import { Link, Navigate } from "react-router-dom";
import { DeveloperCredit } from "../components/DeveloperCredit";
import { PublicNav } from "../components/PublicNav";
import { useAppStore } from "../core/store";

function CandyBackground() {
  return (
    <>
      <div className="candy-orb pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose-500/25 blur-3xl" />
      <div
        className="candy-orb pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-red-500/20 blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="candy-orb pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div className="public-orb-extra" />
      <div className="public-sparkle public-sparkle-a">✦</div>
      <div className="public-sparkle public-sparkle-b">🍬</div>
      <div className="public-sparkle public-sparkle-c">🎓</div>
      <div className="public-sparkle public-sparkle-d">✧</div>
    </>
  );
}

export function HomePage() {
  const { state, currentUser } = useAppStore();
  if (currentUser) return <Navigate to={currentUser.role === "admin" ? "/admin" : "/student"} replace />;

  const announcements = state.announcements
    .filter((a) => a.targetRole !== "admin")
    .sort((a, b) => b.id - a.id);

  const features = [
    { icon: "📋", title: "Smart Enrollment", text: "Apply for courses, pick sections, and track approval in one student portal." },
    { icon: "💳", title: "Payment Tracking", text: "Submit tuition and fees with proof — admins confirm in real time." },
    { icon: "📅", title: "Live Schedules", text: "View your class schedule with rooms and times as soon as you are enrolled." },
    { icon: "📣", title: "Campus Announcements", text: "Stay updated on enrollment windows, payments, and campus advisories." },
  ];

  const quickRoles = [
    { label: "Admin", icon: "🛡️", email: "admin@gmail.com", to: "/login?quick=admin" },
    { label: "Student", icon: "🎒", email: "student@gmail.com", to: "/login?quick=student" },
  ];

  return (
    <div className="public-page">
      <CandyBackground />
      <PublicNav />

      <main className="public-shell">
        <section className="public-hero">
          <div className="public-hero-glow" />
          <div className="relative z-10">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="public-hero-badge">🍭 Candy Red Edition · Public Home</span>
              <span className="public-badge">{state.settings.academicYear}</span>
              <span className="public-badge">{state.settings.semester}</span>
              <span className="public-badge">{announcements.length} Live Announcements</span>
            </div>

            <h1 className="public-hero-title">Sweet Enrollment. Bold Campus Life.</h1>
            <p className="public-hero-sub mt-4 max-w-3xl">
              Welcome! This is the public home for guests and prospective students — browse campus announcements,
              explore the system, then sign in or register when you are ready to enroll.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="public-btn-primary public-cta-btn" to="/login">
                🔐 Sign In
              </Link>
              <Link className="public-btn-secondary public-cta-btn" to="/register">
                🎓 Create Student Account
              </Link>
              <Link className="public-cta-ghost" to="/login">
                ⚡ Quick Access on Login →
              </Link>
            </div>

            <div className="public-stat-row mt-10">
              <div className="public-stat">
                <p className="public-stat-num">{state.courses.length}</p>
                <p className="public-stat-label">Programs</p>
              </div>
              <div className="public-stat">
                <p className="public-stat-num">{state.subjects.length}</p>
                <p className="public-stat-label">Subjects</p>
              </div>
              <div className="public-stat">
                <p className="public-stat-num">{announcements.length}</p>
                <p className="public-stat-label">Announcements</p>
              </div>
              <div className="public-stat">
                <p className="public-stat-num">🍬</p>
                <p className="public-stat-label">Candy UI</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="public-section-title">Demo Quick Access</h2>
          <p className="public-section-sub">One-click demo accounts — prefilled on the login page</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickRoles.map((r) => (
              <Link key={r.email} to={r.to} className="public-role-card">
                <span className="public-role-icon">{r.icon}</span>
                <div>
                  <p className="font-bold text-rose-50">{r.label}</p>
                  <p className="text-xs text-rose-300/80">{r.email}</p>
                </div>
                <span className="public-role-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="public-badge">📣 From Campus Admin</span>
              <h2 className="public-section-title mt-2">Campus Announcements</h2>
              <p className="public-section-sub">No login required — read the latest updates below</p>
            </div>
            <Link className="public-cta-ghost" to="/login">
              Sign in for full access →
            </Link>
          </div>

          <div className="mt-4 grid gap-3">
            {announcements.length === 0 && (
              <div className="public-announcement-card text-center text-rose-200/70">No announcements yet.</div>
            )}
            {announcements.map((a) => (
              <article key={a.id} className="public-announcement-card">
                <div className="mb-1 text-xs text-rose-200/60">{new Date(a.createdAt).toLocaleString()}</div>
                <h4 className="text-lg font-bold text-rose-50">{a.title}</h4>
                <p className="mt-1 text-sm text-rose-100/80">{a.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="public-section-title">Why Enroll Here?</h2>
          <p className="public-section-sub">Everything you need — admin and student portals included</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <article key={f.title} className="public-feature-card public-announcement-card">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-2 font-bold text-rose-50">{f.title}</h3>
                <p className="mt-1 text-sm text-rose-100/75">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <DeveloperCredit variant="showcase" />
        </section>

        <section className="public-bottom-cta mt-10">
          <div className="public-hero relative overflow-hidden rounded-3xl p-8 text-center md:p-10">
            <div className="public-hero-glow" />
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-rose-50 md:text-3xl">Ready to join campus?</h2>
              <p className="mx-auto mt-2 max-w-xl text-rose-100/80">
                Create your student account or sign in with a demo role to explore the full enrollment experience.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link className="public-btn-primary public-cta-btn" to="/register">
                  🎓 Register Now
                </Link>
                <Link className="public-btn-secondary public-cta-btn" to="/login">
                  🔐 Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DeveloperCredit variant="footer" />
    </div>
  );
}
