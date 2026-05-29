import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/login", label: "Sign In", icon: "🔐" },
  { to: "/register", label: "Register", icon: "🎓" },
];

export function PublicNav() {
  const { pathname } = useLocation();

  return (
    <header className="public-nav-sticky">
      <nav className="public-nav">
        <Link to="/" className="public-nav-brand">
          <span className="public-nav-logo">🎓</span>
          <div>
            <span className="public-nav-title">College Enrollment</span>
            <span className="public-nav-sub">Candy Red Edition</span>
          </div>
        </Link>
        <div className="public-nav-links">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" || pathname === "/home" : pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className={`public-nav-link ${active ? "public-nav-link-active" : ""}`}>
                <span aria-hidden>{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
