import { useEffect, useState } from "react";

const EXAMPLES: Record<string, string> = {
  hello: `# Hello, Python
name = "Student"
print("Hello,", name)
for i in range(1, 6):
    print("Counting:", i)`,
  datastruct: `# Data Structures
nums = [3, 1, 4, 1, 5, 9]
names = {"alice": 18, "bob": 19}
unique = set(nums)

print("sum:", sum(nums))
print("sorted:", sorted(nums))
print("names->age:", names)
print("unique:", unique)`,
  csv: `# Mini CSV parsing (no pandas)
data = "name,age\\nAlice,18\\nBob,19\\nCara,20"
lines = data.strip().split("\\n")
header = lines[0].split(",")
rows = [dict(zip(header, line.split(","))) for line in lines[1:]]
avg_age = sum(int(r["age"]) for r in rows) / len(rows)
print("rows:", rows)
print("avg age:", avg_age)`,
  sklearn: `# Demo: simple linear regression (concept only)
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1.0],[2.0],[3.0],[4.0]])
y = [2.0, 4.1, 5.9, 8.2]

model = LinearRegression().fit(X, y)
print("coef_", model.coef_, "intercept_", model.intercept_)
print("pred", model.predict(X))
`
};

export default function Examples() {
  const [selected, setSelected] = useState("hello");
  const [code, setCode] = useState(EXAMPLES["hello"]);
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
            <i className="bi bi-journal-code me-1" />
            Examples
          </span>
        </div>
      </nav>

      <div className="row g-3">
        {/* Example list */}
        <div className="col-md-4">
          <div className="list-group">
            {Object.keys(EXAMPLES).map((k) => (
              <button
                key={k}
                className={`list-group-item list-group-item-action ${
                  selected === k ? "active" : ""
                }`}
                onClick={() => {
                  setSelected(k);
                  setCode(EXAMPLES[k]);
                }}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="alert alert-warning mt-3 small">
            <i className="bi bi-exclamation-triangle me-1" />
            Note: Pyodide doesn’t support heavy packages (like full scikit-learn) in-browser.
            The sklearn example here works only if the package is available on the server API.
          </div>
        </div>

        {/* Editor + Output */}
        <div className="col-md-8">
          <label className="form-label small text-secondary">Editor</label>
          <textarea
            className="form-control editor"
            style={{ minHeight: 220 }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={run} disabled={!ready}>
              <i className="bi bi-play-fill me-1" />
              Run
            </button>
            <button className="btn btn-outline-secondary" onClick={clearOut}>
              <i className="bi bi-trash me-1" />
              Clear
            </button>
          </div>

          <label className="form-label small text-secondary mt-3">
            Console Output
          </label>
          <pre
            className="console border rounded p-2"
            style={{ height: 260, overflow: "auto" }}
          >
            {out}
          </pre>
        </div>
      </div>
    </main>
  );
}