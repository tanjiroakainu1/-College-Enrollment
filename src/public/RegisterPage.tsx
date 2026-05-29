import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { DeveloperCredit } from "../components/DeveloperCredit";
import { PublicNav } from "../components/PublicNav";
import { useAppStore } from "../core/store";

export function RegisterPage() {
  const { registerStudent, currentUser, state } = useAppStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (currentUser) return <Navigate to={currentUser.role === "admin" ? "/admin" : "/student"} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const res = registerStudent(name, email, password);
    if (!res.ok) {
      setError(res.message || "Registration failed");
      return;
    }
    navigate("/login");
  };

  const announcements = state.announcements.filter((a) => a.targetRole !== "admin").slice(-5).reverse();

  return (
    <div className="public-page">
      <div className="candy-orb pointer-events-none absolute left-4 top-24 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      <div
        className="candy-orb pointer-events-none absolute right-6 top-8 h-72 w-72 rounded-full bg-rose-500/25 blur-3xl"
        style={{ animationDelay: "0.8s" }}
      />

      <PublicNav />

      <div className="public-shell relative z-10 grid w-full max-w-5xl gap-4 md:grid-cols-2">
        <div className="public-auth-side">
          <h3 className="text-lg font-bold text-rose-50">Campus News</h3>
          <div className="auth-mini-feed mt-3 space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-rose-300/20 bg-[#120308]/70 p-3">
                <div className="text-xs text-rose-200/60">{new Date(a.createdAt).toLocaleDateString()}</div>
                <div className="font-semibold text-rose-50">{a.title}</div>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-rose-200/60">No announcements yet.</p>}
          </div>
        </div>

        <div className="public-auth-card">
          <Link to="/" className="auth-home-btn">
            🏠 Back to Home
          </Link>

          <h2 className="mt-4 text-2xl font-black text-rose-50">Student Registration</h2>
          <p className="mt-1 text-sm text-rose-200/70">Create your account to start enrollment.</p>

          {error && (
            <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</div>
          )}

          <form onSubmit={submit} className="mt-3 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Full name"
              className="public-input"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="public-input"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Password (min 6 chars)"
              type="password"
              className="public-input"
            />
            <button type="submit" className="public-btn-primary w-full">
              Create Account
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-rose-400/20 pt-4">
            <Link to="/" className="public-footer-link">
              🏠 Home
            </Link>
            <p className="text-sm text-rose-200/70">
              Already have an account?{" "}
              <Link className="public-footer-link" to="/login">
                Sign in
              </Link>
            </p>
          </div>

          <DeveloperCredit variant="strip" />
        </div>
      </div>

      <DeveloperCredit variant="footer" />
    </div>
  );
}
