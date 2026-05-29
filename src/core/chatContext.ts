export type ChatRole = "guest" | "admin" | "student";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export const CHATBOT_NAME = "Campus AI";
export const CHATBOT_TAGLINE = "Your candy-red enrollment assistant";

const SYSTEM_BASE = `You are Campus AI, the friendly assistant for the College Enrollment System (Candy Red Edition), developed by Raminder Jangao.

RULES:
- Help users with this enrollment system AND general knowledge / outside-world questions when asked.
- Never mention OpenRouter, API providers, API keys, or backend infrastructure. You are Campus AI only.
- Be concise, warm, and practical. Use bullet points for steps when helpful.
- If unsure about system-specific data, explain how to find it in the portal instead of inventing records.

SYSTEM OVERVIEW:
- Two roles: Admin and Student.
- Public pages: Home (/), Login (/login), Register (/register) for non-users.
- Demo accounts: admin@gmail.com / admin123 (Admin), student@gmail.com / student123 (Student).
- Data persists in browser localStorage (demo app).

ADMIN PORTAL TABS:
- dashboard, students, enrollments, courses, subjects, sections, payments, reports, announcements, settings.
- Admin can approve/reject enrollments, manage courses/subjects/sections, confirm payments, post announcements, view reports, update academic year/semester settings.

STUDENT PORTAL TABS:
- dashboard, profile, enrollment, subjects, schedule, payments, records, notifications, documents.
- Students register on /register, apply for a program, pick subjects/sections, submit payment proof, view schedule & grades, read announcements & notifications.

ENROLLMENT STATUSES: pending, approved, enrolled, rejected.
PAYMENT STATUSES: pending, confirmed, rejected.
PAYMENT TYPES: tuition, miscellaneous, enrollment_fee.
PAYMENT METHODS: gcash, bank_transfer, paymaya.

PROGRAMS (courses): BSIT (Information Technology), BSBA (Business Administration), BSED (Secondary Education).
Students select subjects with prerequisites; sections have schedules and room assignments.

REGISTRATION: New users create a student account on /register (name, email, password min 6 chars), then login and apply for enrollment.`;

const ROLE_CONTEXT: Record<ChatRole, string> = {
  guest: `CURRENT USER: Guest (not logged in). They can browse the public home, read announcements, login, or register as a student.`,
  admin: `CURRENT USER: Admin. They manage the entire enrollment system — students, enrollments, courses, payments, announcements, and settings.`,
  student: `CURRENT USER: Student. They manage their profile, enrollment application, subject selection, schedule, payments, grades, and notifications.`,
};

export function buildSystemPrompt(role: ChatRole): string {
  return `${SYSTEM_BASE}\n\n${ROLE_CONTEXT[role]}`;
}

export const QUICK_QUESTIONS: Record<ChatRole, string[]> = {
  guest: [
    "How do I register as a student?",
    "What programs are offered?",
    "What are the demo login accounts?",
    "How does enrollment work here?",
    "Who built this system?",
    "What's the weather like today?",
    "Explain photosynthesis simply",
    "Give me a healthy study tip",
  ],
  admin: [
    "How do I approve enrollments?",
    "How do I add a new course?",
    "How do I confirm student payments?",
    "How do I post an announcement?",
    "What do enrollment statuses mean?",
    "How do I manage sections & schedules?",
    "Summarize admin dashboard stats",
    "What's a good leadership quote?",
  ],
  student: [
    "How do I apply for enrollment?",
    "How do I pick subjects & sections?",
    "How do I submit payment proof?",
    "Where is my class schedule?",
    "How do I check my grades?",
    "What does pending enrollment mean?",
    "How do I update my profile?",
    "Tips for balancing school & life?",
  ],
};

export const WELCOME_MESSAGES: Record<ChatRole, string> = {
  guest: "Hey there! I'm Campus AI 🍬 Ask me about enrollment, programs, demo logins — or anything in the world!",
  admin: "Welcome, Admin! I can guide you through enrollments, payments, courses, reports — or answer general questions.",
  student: "Hi Student! Need help with enrollment, schedules, payments, or grades? I'm here — ask away!",
};
