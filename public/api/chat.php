<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function load_env(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $env = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim($value, " \t\"'");
    }

    return $env;
}

$envPath = dirname(__DIR__, 2) . '/.env';
$env = load_env($envPath);
$key = $env['OPENROUTER_API_KEY'] ?? '';

if ($key === '') {
    http_response_code(503);
    echo json_encode(['error' => 'Campus AI is not configured yet.']);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '[]', true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request body']);
    exit;
}

$messages = $input['messages'] ?? null;
if (!is_array($messages) || count($messages) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Messages are required']);
    exit;
}

$model = is_string($input['model'] ?? null) ? $input['model'] : 'openrouter/free';

$payload = json_encode([
    'model' => $model,
    'messages' => $messages,
    'temperature' => 0.7,
    'max_tokens' => 800,
]);

if ($payload === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Could not encode request']);
    exit;
}

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $key,
    ],
    CURLOPT_POSTFIELDS => $payload,
]);

$response = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false || $status < 200) {
    http_response_code(502);
    echo json_encode(['error' => 'Campus AI is temporarily unavailable.', 'detail' => $error ?: null]);
    exit;
}

http_response_code($status);
echo $response;
