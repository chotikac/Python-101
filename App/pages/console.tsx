import { useEffect, useState } from "react";

export default function Console() {
  const [code, setCode] = useState(`# Try me!
print("Hello, Python 101 🚀")
for i in range(3):
    print("Loop:", i)
`);
  const [out, setOut] = useState<string>("(loading Python runtime…)\n");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
    script.onload = async () => {
      // @ts-ignore
      const pyodide = await window.loadPyodide({
        stdout: (s: string) => setOut((o) => o + s + "\n"),
        stderr: (s: string) => setOut((o) => o + s + "\n"),
      });
      // @ts-ignore
      (window as any)._pyodide = pyodide;
      setReady(true);
      setOut((o) => o + "Python ready.\n");
    };
    document.head.appendChild(script);
  }, []);

  async function run() {
    // @ts-ignore
    const pyodide = (window as any)._pyodide;
    if (!pyodide) return;
    setOut("");
    try {
      await pyodide.runPythonAsync(code);
    } catch (e) {
      setOut((o) => o + (e as any).toString());
    }
  }

  function clearOut() {
    setOut("");
  }

  return (
    <main className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg border-bottom mb-4">
        <div className="container-fluid">
          <a href="/" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-house me-1" />
            Home
          </a>
          <span className="navbar-text ms-3 fw-bold">
            <i className="bi bi-terminal me-1" />
            Python Console
          </span>
        </div>
      </nav>

      <h1 className="h3 mb-3">
        <i className="bi bi-terminal me-2" />
        In-Browser Python Console
      </h1>
      <p className="text-secondary">
        Write Python code below and run it instantly. Powered by Pyodide.
      </p>

      <div className="row g-3">
        <div className="col-lg-6">
          <label className="form-label small text-secondary">Editor</label>
          <textarea
            className="form-control editor"
            style={{ minHeight: 220 }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          <div className="d-flex gap-2 mt-2">
            <button
              className="btn btn-primary"
              onClick={run}
              disabled={!ready}
            >
              <i className="bi bi-play-fill me-1" />
              Run
            </button>
            <button className="btn btn-outline-secondary" onClick={clearOut}>
              <i className="bi bi-trash me-1" />
              Clear
            </button>
          </div>
        </div>

        <div className="col-lg-6">
          <label className="form-label small text-secondary">Console Output</label>
          <pre className="console border rounded p-2" style={{ height: 260, overflow: "auto" }}>
            {out}
          </pre>
        </div>
      </div>
    </main>
  );
}