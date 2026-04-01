"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { usePromptsContext } from "@/lib/PromptsContext";

interface HeaderProps {
  showMobileMenu?: boolean;
  onSearch?: (q: string) => void;
}

const Sun = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const Moon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export function Header({ showMobileMenu = true, onSearch }: HeaderProps) {
  const { prompts } = usePromptsContext();
  const promptCount = prompts.length;
  const [scrolled, setScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const { user, logout, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLanding = pathname === "/";

  // Scroll-aware transparent header — same as landing page LandingNav
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close account menu on outside click
  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const h = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isAccountMenuOpen]);

  const navBg = scrolled
    ? isDark ? "rgba(17,17,17,0.92)" : "rgba(250,244,233,0.92)"
    : "transparent";

  const borderColor = scrolled
    ? isDark ? "rgba(78,75,71,0.5)" : "rgba(221,216,208,0.6)"
    : "transparent";

  const navLinkStyle: React.CSSProperties = {
    padding: "6px 12px", fontSize: 14, fontWeight: 600,
    color: "var(--cn-muted)", textDecoration: "none", borderRadius: 6,
    transition: "color 0.15s",
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      height: 64, display: "flex", alignItems: "center", padding: "0 24px",
      background: navBg,
      backdropFilter: scrolled ? "blur(14px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: `1px solid ${borderColor}`,
      boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.10)" : "none",
      transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
      fontFamily: "'Inter',system-ui,-apple-system,sans-serif",
    }}>
      <div style={{ maxWidth: 1280, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>

        {/* Left: mobile toggle + logo + nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {showMobileMenu && !isLanding && (
            <button
              aria-label="Open menu"
              onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
              className="flex md:hidden"
              style={{ padding: 7, borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "var(--cn-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(148,138,227,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          )}

          {/* Logo — exact landing page style */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-0.025em", fontFamily: "Georgia,'Times New Roman',serif" }}>
              <span style={{ color: "var(--cn-text)" }}>closed</span>
              <span style={{ color: "var(--cn-accent)" }}>Note</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: 2, marginLeft: 6 }}>
            {isLanding ? (
              <>
                <a href="#features" style={navLinkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
                >Features</a>
                <a href="#compare" style={navLinkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
                >Compare</a>
                <Link href="/docs" style={navLinkStyle}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
                >Docs</Link>
              </>
            ) : (
              <>
                <Link href="/docs" style={{ ...navLinkStyle, color: pathname === "/docs" ? "var(--cn-text)" : "var(--cn-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = pathname === "/docs" ? "var(--cn-text)" : "var(--cn-muted)")}
                >Docs</Link>
                {user && (
                  <Link href="/dashboard" style={{ ...navLinkStyle, color: pathname === "/dashboard" ? "var(--cn-text)" : "var(--cn-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = pathname === "/dashboard" ? "var(--cn-text)" : "var(--cn-muted)")}
                  >Dashboard</Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Center: search bar — app pages only, logged in */}
        {!isLanding && user && (
          <div className="hidden sm:block flex-1 max-w-xs mx-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-search"))}
              style={{ width: "100%", textAlign: "left" }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <svg style={{ position: "absolute", left: 10, width: 14, height: 14, color: "var(--cn-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div style={{
                  width: "100%", paddingLeft: 30, paddingRight: 56, paddingTop: 7, paddingBottom: 7,
                  background: isDark ? "rgba(30,28,26,0.6)" : "rgba(246,238,219,0.7)",
                  border: `1px solid ${isDark ? "rgba(78,75,71,0.4)" : "rgba(221,216,208,0.6)"}`,
                  borderRadius: 8, fontSize: 13, color: "var(--cn-muted)", transition: "border-color 0.15s",
                }}>
                  Search prompts...
                </div>
                <span style={{
                  position: "absolute", right: 8,
                  padding: "2px 6px", background: isDark ? "rgba(40,38,37,0.8)" : "rgba(237,232,216,0.8)",
                  borderRadius: 4, fontSize: 11, color: "var(--cn-dim)", fontFamily: "monospace",
                }}>Ctrl+K</span>
              </div>
            </button>
          </div>
        )}

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>

          {/* Mobile search */}
          {!isLanding && user && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-search"))}
              className="flex sm:hidden"
              style={{ padding: 7, borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: "var(--cn-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(148,138,227,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Theme toggle — exact landing page style */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            style={{ padding: 8, color: "var(--cn-muted)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", borderRadius: 6, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
          >
            {isDark ? <Sun /> : <Moon />}
          </button>

          {/* GitHub — visible on landing + desktop */}
          <a
            href="https://github.com/aboderinsamuel/closedNote"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden sm:flex"
            style={{ padding: 8, color: "var(--cn-muted)", display: "flex", alignItems: "center", textDecoration: "none", borderRadius: 6, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
          >
            <GitHubIcon />
          </a>

          {/* Auth area */}
          {authLoading ? (
            <div style={{ width: 72, height: 32, borderRadius: 99, background: "rgba(148,138,227,0.1)", animation: "pulse 2s infinite" }} />
          ) : user ? (
            <>
              {/* + New button */}
              <Link
                href="/prompts/new"
                style={{
                  padding: "7px 18px", background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)",
                  borderRadius: 99, fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "opacity 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ New</span>
              </Link>

              {/* Account dropdown */}
              <div style={{ position: "relative" }} ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    paddingLeft: 4, paddingRight: 10, paddingTop: 4, paddingBottom: 4,
                    background: isDark ? "rgba(30,28,26,0.7)" : "rgba(246,238,219,0.8)",
                    border: `1px solid ${isDark ? "rgba(78,75,71,0.5)" : "rgba(221,216,208,0.7)"}`,
                    borderRadius: 99, cursor: "pointer", transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: `linear-gradient(135deg, var(--cn-accent), #FC618D)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600, color: "var(--cn-text)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.displayName}
                  </span>
                  <svg style={{ width: 12, height: 12, color: "var(--cn-muted)", transition: "transform 0.15s", transform: isAccountMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isAccountMenuOpen && (
                  <div className="animate-scale-in" style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 220,
                    background: isDark ? "rgba(17,17,17,0.95)" : "rgba(250,244,233,0.98)",
                    backdropFilter: "blur(16px)",
                    border: `1px solid ${isDark ? "rgba(78,75,71,0.6)" : "rgba(221,216,208,0.8)"}`,
                    borderRadius: 12,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.18)", overflow: "hidden", zIndex: 50,
                  }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${isDark ? "rgba(78,75,71,0.4)" : "rgba(221,216,208,0.6)"}` }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--cn-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName}</p>
                      <p style={{ fontSize: 12, color: "var(--cn-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{user.email}</p>
                    </div>
                    <div style={{ padding: "4px 0" }}>
                      <DropItem icon="dashboard" onClick={() => { setIsAccountMenuOpen(false); router.push("/dashboard"); }}>
                        My Prompts <span style={{ fontSize: 11, color: "var(--cn-dim)", marginLeft: "auto" }}>{promptCount}</span>
                      </DropItem>
                      <DropItem icon="chains" href="/chains" onClick={() => setIsAccountMenuOpen(false)}>Threads</DropItem>
                      <DropItem icon="ocr" href="/ocr" onClick={() => setIsAccountMenuOpen(false)}>Image to Text</DropItem>
                      <DropItem icon="docs" href="/docs" onClick={() => setIsAccountMenuOpen(false)} className="md:hidden">Docs</DropItem>
                      <DropItem icon="settings" href="/settings" onClick={() => setIsAccountMenuOpen(false)}>Settings</DropItem>
                    </div>
                    <div style={{ borderTop: `1px solid ${isDark ? "rgba(78,75,71,0.4)" : "rgba(221,216,208,0.6)"}`, padding: "4px 0" }}>
                      <DropItem icon="logout" danger onClick={() => { setIsAccountMenuOpen(false); logout(); }}>Sign out</DropItem>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {pathname !== "/login" && (
                <Link href="/login"
                  className="hidden sm:inline"
                  style={{ padding: "7px 14px", color: "var(--cn-muted)", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "color 0.15s", fontFamily: "inherit" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cn-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--cn-muted)")}
                >Log in</Link>
              )}
              {pathname !== "/signup" && (
                <Link href="/signup"
                  style={{ padding: "7px 18px", background: "var(--cn-btn-bg)", color: "var(--cn-btn-tx)", borderRadius: 99, fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "opacity 0.15s", fontFamily: "inherit" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  {pathname === "/login" ? "Sign up" : "Get started"}
                </Link>
              )}
              {pathname === "/signup" && (
                <Link href="/login"
                  style={{ padding: "7px 16px", border: "1px solid var(--cn-border)", color: "var(--cn-text2)", borderRadius: 99, fontSize: 14, fontWeight: 600, textDecoration: "none", background: "transparent", transition: "opacity 0.15s", fontFamily: "inherit" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >Sign in</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


type IconName = "dashboard" | "chains" | "ocr" | "docs" | "settings" | "logout";

const ICONS: Record<IconName, string> = {
  dashboard: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  chains:    "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  ocr:       "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  docs:      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  settings:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  logout:    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

function DropItem({ icon, children, href, onClick, danger, className = "" }: {
  icon: IconName; children: React.ReactNode;
  href?: string; onClick?: () => void; danger?: boolean; className?: string;
}) {
  const [hov, setHov] = useState(false);
  const s: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 16px", width: "100%", textAlign: "left",
    background: hov ? (danger ? "rgba(220,38,38,0.08)" : "rgba(148,138,227,0.08)") : "transparent",
    border: "none", cursor: "pointer", textDecoration: "none",
    color: danger ? "#fc618d" : "var(--cn-text2)",
    transition: "background 0.12s", fontFamily: "inherit",
  };
  const inner = (
    <>
      <svg width="14" height="14" fill="none" stroke={danger ? "#fc618d" : "var(--cn-dim)"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d={ICONS[icon]} />
      </svg>
      <span style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, flex: 1 }}>{children}</span>
    </>
  );
  if (href) return <Link href={href} onClick={onClick} className={className} style={s} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{inner}</Link>;
  return <button onClick={onClick} className={className} style={s} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{inner}</button>;
}
