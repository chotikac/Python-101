// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Theme toggle (Bootstrap 5.3 data-bs-theme)
const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(theme) {
  htmlEl.setAttribute("data-bs-theme", theme);
  if (themeIcon) {
    themeIcon.className = theme === "dark" ? "bi bi-moon-stars" : "bi bi-brightness-high";
  }
}
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const next = htmlEl.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

// Highlight active nav link
(function highlightActive() {
  const path = location.pathname.replace(/\/+$/, "");
  document.querySelectorAll(".nav-link").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    const normalized = new URL(href, location.origin).pathname.replace(/\/+$/, "");
    if (normalized === path) a.classList.add("active");
  });
})();

// ------- Pyodide runner (only if editor exists) -------
// We lazily load pyodide when a page has #py-editor or [data-pyodide].
const hasPyEditor = document.getElementById("py-editor") || document.querySelector("[data-pyodide]");
if (hasPyEditor) {
  // Dynamically insert the Pyodide script
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
  s.onload = bootPyodide;
  document.head.appendChild(s);
}

let pyodide = null;
let pyBooting = false;

async function bootPyodide() {
  if (pyBooting) return;
  pyBooting = true;
  const statusEl = document.getElementById("status");
  const runBtn = document.getElementById("btn-run");
  const clearBtn = document.getElementById("btn-clear");
  const output = document.getElementById("output");
  const editor = document.getElementById("py-editor");

  function write(line = "") {
    if (!output) return;
    output.textContent += line + "\n";
    output.scrollTop = output.scrollHeight;
  }

  try {
    if (statusEl) statusEl.innerHTML = `<i class="bi bi-cloud-download"></i> Downloading Python runtime…`;
    pyodide = await loadPyodide({
      stdin: () => null,
      stdout: (s) => write(s),
      stderr: (s) => write(s),
    });
    if (statusEl) statusEl.innerHTML = `<i class="bi bi-check2-circle"></i> Python ready`;
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<i class="bi bi-x-circle"></i> Failed to load Pyodide`;
    console.error(err);
    return;
  }

  // Example: preload some common packages if needed
  // await pyodide.loadPackage(['micropip']);
  // You can then install pure-python wheels via micropip if desired.

  if (runBtn) {
    runBtn.addEventListener("click", async () => {
      if (!pyodide || !editor) return;
      try {
        const code = editor.value;
        await pyodide.runPythonAsync(code);
      } catch (e) {
        // Errors are already printed to output via stderr
      }
    });
  }

  if (clearBtn && output) {
    clearBtn.addEventListener("click", () => (output.textContent = ""));
  }
}