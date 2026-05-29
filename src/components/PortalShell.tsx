import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DeveloperCredit } from "./DeveloperCredit";

type PortalShellProps<T extends string> = {
  portalTitle: string;
  userName: string;
  tabs: readonly T[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  onLogout: () => void;
  children: ReactNode;
};

const SIDEBAR_WIDTH = "min(88vw, 20rem)";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-6 flex-col justify-between" aria-hidden="true">
      <span className={`block h-0.5 w-full rounded-full bg-white transition-all duration-300 ${open ? "translate-y-[9px] rotate-45" : ""}`} />
      <span className={`block h-0.5 w-full rounded-full bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
      <span className={`block h-0.5 w-full rounded-full bg-white transition-all duration-300 ${open ? "-translate-y-[9px] -rotate-45" : ""}`} />
    </span>
  );
}

function SidebarNav<T extends string>({
  portalTitle,
  userName,
  tabs,
  activeTab,
  onSelect,
  onLogout,
  onClose,
  showClose,
}: {
  portalTitle: string;
  userName: string;
  tabs: readonly T[];
  activeTab: T;
  onSelect: (tab: T) => void;
  onLogout: () => void;
  onClose: () => void;
  showClose: boolean;
}) {
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-black tracking-wide text-white">{portalTitle}</h2>
          <p className="mt-1 text-xs font-medium text-rose-100">{userName}</p>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border-2 border-rose-200/50 bg-rose-500/30 p-2 text-lg font-bold leading-none text-white hover:bg-rose-500/50"
            aria-label="Close menu"
          >
            &times;
          </button>
        )}
      </div>

      <nav className="mt-4 max-h-[calc(100vh-12rem)] space-y-1.5 overflow-y-auto overscroll-contain pr-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(t);
            }}
            className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-bold capitalize transition ${
              activeTab === t
                ? "border-2 border-rose-200 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.55)]"
                : "border-2 border-rose-300/40 bg-[#3d1520] text-rose-50 hover:border-rose-200 hover:bg-[#4a1a28]"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onLogout();
        }}
        className="mt-4 w-full cursor-pointer rounded-lg border-2 border-red-300/60 bg-red-600 px-3 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(220,38,38,0.4)] hover:bg-red-500"
      >
        Logout
      </button>

      <div className="mt-4">
        <DeveloperCredit variant="compact" />
      </div>
    </>
  );
}

export function PortalShell<T extends string>({
  portalTitle,
  userName,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  children,
}: PortalShellProps<T>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [menuOpen]);

  const selectTab = (tab: T) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const mobileMenu =
    mounted &&
    menuOpen &&
    createPortal(
      <div className="lg:hidden">
        {/* Dim only the content area — never covers the sidebar */}
        <div
          role="presentation"
          className="fixed inset-y-0 right-0 z-[200] bg-black/55"
          style={{ left: SIDEBAR_WIDTH }}
          onClick={closeMenu}
        />
        <aside
          className="fixed inset-y-0 left-0 z-[210] flex flex-col border-r-2 border-rose-400/35 bg-[#2a1018] p-4 shadow-[0_0_40px_rgba(244,63,94,0.4)]"
          style={{ width: SIDEBAR_WIDTH }}
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarNav
            portalTitle={portalTitle}
            userName={userName}
            tabs={tabs}
            activeTab={activeTab}
            onSelect={selectTab}
            onLogout={handleLogout}
            onClose={closeMenu}
            showClose
          />
        </aside>
      </div>,
      document.body,
    );

  return (
    <div className="relative min-h-screen bg-[#1a0810] text-rose-50">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

      <header className="sticky top-0 z-50 flex items-center gap-3 border-b-2 border-rose-400/30 bg-[#2a1018] px-3 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="shrink-0 rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-500 to-red-600 p-2.5 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          <HamburgerIcon open={menuOpen} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-rose-200">{portalTitle}</p>
          <p className="truncate text-sm font-extrabold capitalize text-white">{activeTab.replace(/_/g, " ")}</p>
        </div>
      </header>

      {mobileMenu}

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row">
        {/* Desktop sidebar only */}
        <aside className="hidden h-fit w-64 shrink-0 flex-col rounded-2xl border-2 border-rose-400/30 bg-[#2a1018] p-4 shadow-[0_0_30px_rgba(244,63,94,0.25)] lg:flex">
          <SidebarNav
            portalTitle={portalTitle}
            userName={userName}
            tabs={tabs}
            activeTab={activeTab}
            onSelect={selectTab}
            onLogout={handleLogout}
            onClose={closeMenu}
            showClose={false}
          />
        </aside>

        <main className="min-w-0 flex-1 space-y-4 pb-4">{children}</main>
      </div>

      <div className="mx-auto hidden max-w-7xl px-4 pb-6 lg:block">
        <DeveloperCredit variant="strip" />
      </div>
    </div>
  );
}
