// pages/examples.tsx
import fs from "node:fs";
import path from "node:path";
import type { GetStaticProps } from "next";
import { useEffect, useMemo, useRef, useState } from "react";

/* ----------------------------- Types & helpers ---------------------------- */
type ExampleItem = {
  filename: string;   // e.g., 001_hello_world.py
  title: string;      // e.g., 001 • hello world
  summary: string;    // first docstring/comment/line
  raw: string;        // file contents
};

function titleFromFilename(fn: string) {
  const base = fn.replace(/\.py$/i, "");
  const [idx, ...rest] = base.split("_");
  return `${idx} • ${rest.join(" ").replace(/-/g, " ")}`;
}

function extractSummary(src: string) {
  const doc = src.match(/^[ \t]*("""|''')([\s\S]*?)\1/m);
  if (doc && doc[2].trim()) return doc[2].trim().split("\n")[0].slice(0, 160);
  const firstLine = src.split("\n").map((s) => s.trim()).find(Boolean) || "Python example";
  return firstLine.slice(0, 160);
}

/* ------------------------------ Build-time IO ----------------------------- */
export const getStaticProps: GetStaticProps<{ items: ExampleItem[] }> = async () => {
  const candidates = [
    process.env.EXAMPLES_DIR,                 // optional override via .env.local
    "examples",                               // recommended location
    path.join("pages", "api", "examples"),    // your earlier location
    path.join("public", "examples"),
  ].filter(Boolean) as string[];

  let dir = "";
  for (const c of candidates) {
    const abs = path.join(process.cwd(), c);
    if (fs.existsSync(abs)) { dir = abs; break; }
  }
  if (!dir) {
    throw new Error(
      "Examples folder not found. Create /examples or /pages/api/examples, " +
      "or set EXAMPLES_DIR in .env.local."
    );
  }

  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".py")).sort();

  const items: ExampleItem[] = files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), "utf8");
    return {
      filename,
      title: titleFromFilename(filename),
      summary: extractSummary(raw),
      raw,
    };
  });

  return { props: { items } };
};

/* ------------------------------ Pyodide hook ------------------------------ */
function usePyodide(stdout: (s: string) => void, stderr: (s: string) => void) {
  const ready = useRef(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
    script.onload = async () => {
      // @ts-ignore
      const pyodide = await window.loadPyodide({ stdout, stderr });
      // @ts-ignore
      (window as any)._pyodide = pyodide;
      ready.current = true;
      stdout("Python ready.");
    };
    document.head.appendChild(script);
  }, [stdout, stderr]);

  const run = async (code: string) => {
    // @ts-ignore
    const pyodide = (window as any)._pyodide;
    if (!pyodide) throw new Error("Python runtime not loaded yet.");
    return pyodide.runPythonAsync(code);
  };

  return { isReady: () => ready.current, run };
}

/* ---------------------------------- Page ---------------------------------- */
export default function Examples({ items }: { items: ExampleItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.filename.toLowerCase().includes(q) ||
        x.summary.toLowerCase().includes(q)
    );
  }, [items, query]);

  const [show, setShow] = useState(false);
  const [code, setCode] = useState<string>("");
  const [out, setOut] = useState<string>("");

  const { isReady, run } = usePyodide(
    (s) => setOut((o) => o + s + "\n"),
    (s) => setOut((o) => o + s + "\n")
  );

  const openConsole = (raw: string) => {
    setCode(raw);
    setOut("");
    setShow(true);
  };

  const onRun = async () => {
    try {
      setOut("");
      await run(code);
    } catch (e: any) {
      setOut(String(e));
    }
  };

  return (
    <main className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg border-bottom mb-4">
        <div className="container-fluid">
          <a href="/" className="btn btn-outline-secondary btn-sm">Home</a>
          <span className="navbar-text ms-3 fw-bold">100 Python Examples</span>
          <div className="ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search examples…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ minWidth: 220 }}
            />
          </div>
        </div>
      </nav>

      <p className="text-secondary">
        Click <b>Open in Console</b> to run the example in a popup. Powered by Pyodide (client‑side Python).
      </p>

      <div className="row g-3">
        {filtered.map((ex) => (
          <div className="col-md-6 col-lg-4" key={ex.filename}>
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{ex.title}</h5>
                <p className="card-text text-secondary small flex-grow-1">{ex.summary}</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => openConsole(ex.raw)}>
                    Open in Console
                  </button>
                  <details className="ms-auto">
                    <summary className="small text-secondary">peek</summary>
                    <pre className="border rounded p-2 mt-2" style={{ maxHeight: 180, overflow: "auto" }}>
{ex.raw.slice(0, 600)}{ex.raw.length > 600 ? "\n..." : ""}
                    </pre>
                  </details>
                </div>
              </div>
              <div className="card-footer small text-secondary">
                <code>{ex.filename}</code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Blurred backdrop + modal */}
      {show && (
        <>
          {/* Backdrop (click to close) */}
          <div
            className="modal-backdrop show"
            onClick={() => setShow(false)}
            aria-hidden="true"
          ></div>

          {/* Modal */}
          <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Python Console</h5>
                  <button className="btn-close" aria-label="Close" onClick={() => setShow(false)} />
                </div>

                <div className="modal-body">
                  <label className="form-label small text-secondary">Editor</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: 160, fontFamily: "ui-monospace, Menlo, monospace" }}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                  />

                  <div className="d-flex gap-2 my-2">
                    <button className="btn btn-primary" onClick={onRun} disabled={!isReady()}>
                      Run
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => setOut("")}>
                      Clear
                    </button>
                  </div>

                  <label className="form-label small text-secondary">Console Output</label>
                  <pre className="border rounded p-2" style={{ height: 220, overflow: "auto", whiteSpace: "pre-wrap" }}>
                    {out || (isReady() ? "" : "Loading Python runtime…")}
                  </pre>

                  <div className="alert alert-warning mt-3 small mb-0">
                    ⚠️ Pyodide can’t install heavy native packages like <code>pandas</code> or <code>scikit‑learn</code>.
                    For those, open a Colab/Binder notebook instead.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}