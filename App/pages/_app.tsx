import type { AppProps } from "next/app";
import "@/styles/globals.css";

// Bootstrap & Icons via CDN in Head
import Head from "next/head";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-bs-theme", saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"/>
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"/>
        <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <title>Python Programming 101</title>
      </Head>

      <div className="container py-3">
        <nav className="navbar navbar-expand-lg border-bottom mb-3">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold" href="/">
              <i className="bi bi-cpu me-2"/>Python 101
            </a>
            <div className="d-flex gap-2">
              <a href="/examples" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-journal-code"/> Examples
              </a>
              <a href="/console" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-terminal"/> Console
              </a>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="btn btn-primary btn-sm" aria-label="Toggle theme">
                <i className={theme === "dark" ? "bi bi-moon-stars" : "bi bi-brightness-high"} />
              </button>
            </div>
          </div>
        </nav>
        <Component {...pageProps} />
        <footer className="border-top mt-4 pt-3 small text-secondary">
          <i className="bi bi-code-slash"/> {new Date().getFullYear()} • Built with Next.js & Bootstrap
        </footer>
      </div>
    </>
  );
}