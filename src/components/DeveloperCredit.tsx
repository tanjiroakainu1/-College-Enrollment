export const DEVELOPER = {
  name: "Raminder Jangao",
  role: "Full-Stack Developer",
  initials: "RJ",
} as const;

type Variant = "showcase" | "footer" | "compact" | "strip";

export function DeveloperCredit({ variant = "footer" }: { variant?: Variant }) {
  if (variant === "showcase") {
    return (
      <section className="dev-showcase" aria-label="Developer credit">
        <div className="dev-showcase-orbit dev-showcase-orbit-a" />
        <div className="dev-showcase-orbit dev-showcase-orbit-b" />
        <div className="dev-showcase-inner">
          <div className="dev-avatar-ring">
            <div className="dev-avatar">
              <span className="dev-avatar-text">{DEVELOPER.initials}</span>
              <span className="dev-avatar-spark">✦</span>
            </div>
          </div>

          <div className="dev-showcase-body">
            <p className="dev-eyebrow">✨ Meet the Developer</p>
            <h2 className="dev-name">{DEVELOPER.name}</h2>
            <p className="dev-role">{DEVELOPER.role}</p>
          </div>

          <div className="dev-showcase-badge">
            <span className="dev-badge-icon">🍬</span>
            <div>
              <p className="dev-badge-label">Built by</p>
              <p className="dev-badge-name">{DEVELOPER.name}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <div className="dev-compact" aria-label={`Developed by ${DEVELOPER.name}`}>
        <div className="dev-compact-avatar">{DEVELOPER.initials}</div>
        <div className="dev-compact-text">
          <p className="dev-compact-label">Developed by</p>
          <p className="dev-compact-name">{DEVELOPER.name}</p>
        </div>
        <span className="dev-compact-candy" aria-hidden>
          🍬
        </span>
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className="dev-strip" aria-label={`Developed by ${DEVELOPER.name}`}>
        <span className="dev-strip-icon">👨‍💻</span>
        <p className="dev-strip-text">
          Developed with <span className="dev-strip-heart">♥</span> by{" "}
          <strong className="dev-strip-name">{DEVELOPER.name}</strong>
        </p>
        <span className="dev-strip-candy">🍬</span>
      </div>
    );
  }

  return (
    <footer className="dev-footer" aria-label="Site footer">
      <div className="dev-footer-glow" />
      <div className="dev-footer-inner">
        <div className="dev-footer-brand">
          <span className="dev-footer-logo">🎓</span>
          <div>
            <p className="dev-footer-title">College Enrollment System</p>
            <p className="dev-footer-edition">Candy Red Edition</p>
          </div>
        </div>

        <div className="dev-footer-divider" />

        <div className="dev-footer-credit">
          <div className="dev-footer-avatar">{DEVELOPER.initials}</div>
          <div>
            <p className="dev-footer-label">Developed by</p>
            <p className="dev-footer-name">{DEVELOPER.name}</p>
            <p className="dev-footer-role">{DEVELOPER.role}</p>
          </div>
        </div>

        <p className="dev-footer-copy">
          © {new Date().getFullYear()} {DEVELOPER.name}. All rights reserved. Sweet code, sweeter experience.
        </p>
      </div>
    </footer>
  );
}
