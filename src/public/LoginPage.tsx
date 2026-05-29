import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { DeveloperCredit } from "../components/DeveloperCredit";
import { PublicNav } from "../components/PublicNav";
import { useAppStore } from "../core/store";

export function LoginPage() {
  const { login, currentUser, state } = useAppStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const quick = params.get("quick");
  const [email, setEmail] = useState(quick === "admin" ? "admin@gmail.com" : quick === "student" ? "student@gmail.com" : "");
  const [password, setPassword] = useState(quick === "admin" ? "admin123" : quick === "student" ? "student123" : "");
  const [error, setError] = useState("");

  if (currentUser) return <Navigate to={currentUser.role === "admin" ? "/admin" : "/student"} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.message || "Login failed");
      return;
    }
    navigate("/app");
  };

  const announcements = state.announcements.filter((a) => a.targetRole !== "admin").slice(-5).reverse();

  return (
    <div className="public-page">
      <div className="candy-orb pointer-events-none absolute left-8 top-10 h-72 w-72 rounded-full bg-rose-500/25 blur-3xl" />
      <div
        className="candy-orb pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-red-500/20 blur-3xl"
        style={{ animationDelay: "1.2s" }}
      />

      <PublicNav />

      <div className="public-shell relative z-10 grid w-full max-w-5xl gap-4 md:grid-cols-2">
        <div className="public-auth-side">
          <h3 className="text-lg font-bold text-rose-50">Latest Announcements</h3>
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

          <h2 className="mt-4 text-2xl font-black text-rose-50">Sign In</h2>
          <p className="mt-1 text-sm text-rose-200/70">Login to admin or student dashboard.</p>

          {error && (
            <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</div>
          )}

          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@gmail.com");
                setPassword("admin123");
              }}
              className="public-quick-btn"
            >
              🛡️ Quick Access: Default Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("student@gmail.com");
                setPassword("student123");
              }}
              className="public-quick-btn public-quick-btn-student"
            >
              🎒 Quick Access: Default Student
            </button>
          </div>

          <form onSubmit={submit} className="mt-3 space-y-3">
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
              placeholder="Password"
              type="password"
              className="public-input"
            />
            <button type="submit" className="public-btn-primary w-full">
              Login
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-rose-400/20 pt-4">
            <Link to="/" className="public-footer-link">
              🏠 Home
            </Link>
            <p className="text-sm text-rose-200/70">
              New student?{" "}
              <Link className="public-footer-link" to="/register">
                Create account
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
