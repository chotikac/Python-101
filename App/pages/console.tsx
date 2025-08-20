import { useEffect, useState } from "react";

const EXAMPLES: Record<string, string> = {
  hello: `# Hello World Example
print("Hello, Python 101 🚀")`,

  loop: `# Loop Example
for i in range(5):
    print("Counting:", i)`,

  datastruct: `# Data Structures Example
nums = [3, 1, 4, 1, 5, 9]
unique = set(nums)
person = {"name": "Alice", "age": 21}
print("nums:", nums)
print("unique:", unique)
print("person:", person)`,

  pandas: `# Pandas Basics Example
import pandas as pd
data = {"name": ["Alice", "Bob", "Cara"], "age": [18, 19, 20]}
df = pd.DataFrame(data)
print(df)
print("Average age:", df["age"].mean())`,

  sklearn: `# Simple scikit-learn demo
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1], [2], [3], [4]])
y = [2.1, 4.1, 6.0, 8.2]

model = LinearRegression().fit(X, y)
print("coef:", model.coef_, "intercept:", model.intercept_)
print("pred:", model.predict(X))`,
};

export default function Console() {
  const [code, setCode] = useState(EXAMPLES.hello);
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
            Home
          </a>
          <span className="navbar-text ms-3 fw-bold">
            Python Console
          </span>
        </div>
      </nav>

      <h1 className="h3 mb-3">In-Browser Python Console</h1>
      <p className="text-secondary">
        Choose an example or write Python code below and run it instantly. Powered by Pyodide.
      </p>

      <div className="row g-3">
        {/* Sidebar with examples */}
        <div className="col-md-3">
          <div className="list-group">
            {Object.keys(EXAMPLES).map((key) => (
              <button
                key={key}
                className="list-group-item list-group-item-action"
                onClick={() => setCode(EXAMPLES[key])}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Editor + Output */}
        <div className="col-md-9">
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
              Run
            </button>
            <button className="btn btn-outline-secondary" onClick={clearOut}>
              Clear
            </button>
          </div>

          <label className="form-label small text-secondary mt-3">Console Output</label>
          <pre className="console border rounded p-2" style={{ height: 260, overflow: "auto" }}>
            {out}
          </pre>
        </div>
      </div>
    </main>
  );
}