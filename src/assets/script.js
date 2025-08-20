// ---------- Footer year ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Elements ----------
const statusEl = document.getElementById("status");
const runBtn = document.getElementById("btn-run");
const clearBtn = document.getElementById("btn-clear");
const editor = document.getElementById("editor");
const output = document.getElementById("output");

// Optional: persist editor content between reloads
const LS_KEY = "runner-editor-code";
if (editor && localStorage.getItem(LS_KEY)) {
  editor.value = localStorage.getItem(LS_KEY);
}
editor?.addEventListener("input", () => {
  try { localStorage.setItem(LS_KEY, editor.value); } catch (_) {}
});

let pyodide;

// Append to console area
function write(line = "") {
  output.textContent += line + "\n";
  output.scrollTop = output.scrollHeight;
}

// ---------- Boot Pyodide ----------
async function boot() {
  if (!statusEl) return;
  try {
    statusEl.innerHTML = `<i class="bi bi-cloud-download"></i> Downloading Pyodide…`;

    // Load runtime
    pyodide = await loadPyodide({
      stdin: () => null,
      stdout: (s) => write(s),
      stderr: (s) => write(s),
    });

    // Load common packages that ship with Pyodide
    statusEl.innerHTML = `<i class="bi bi-box-arrow-in-down"></i> Loading packages…`;
    await pyodide.loadPackage(["numpy", "pandas"]);

    statusEl.innerHTML = `<i class="bi bi-check2-circle"></i> Ready`;
    if (runBtn) runBtn.disabled = false;
    if (clearBtn) clearBtn.disabled = false;
  } catch (e) {
    statusEl.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Failed to load`;
    write(String(e));
  }
}
boot();

// ---------- Run Python ----------
runBtn?.addEventListener("click", async () => {
  if (!pyodide) return;
  runBtn.disabled = true;
  statusEl.innerHTML = `<i class="bi bi-cpu"></i> Running…`;
  try {
    await pyodide.runPythonAsync(editor.value); // supports top-level await
    statusEl.innerHTML = `<i class="bi bi-check2-circle"></i> Done`;
  } catch (err) {
    write(String(err));
    statusEl.innerHTML = `<i class="bi bi-exclamation-triangle"></i> Error`;
  } finally {
    runBtn.disabled = false;
  }
});

// Ctrl/Cmd + Enter to run
document.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter") {
    runBtn?.click();
    e.preventDefault();
  }
});

// ---------- Clear console ----------
clearBtn?.addEventListener("click", () => {
  output.textContent = "";
  statusEl.innerHTML = `<i class="bi bi-circle-fill" style="font-size:10px;"></i> Ready`;
});

// ---------- Small UX niceties ----------
editor?.addEventListener("focus", () => {
  // Place caret at end on first focus if it's the default text
  if (editor.dataset._touched) return;
  editor.dataset._touched = "1";
  const val = editor.value;
  editor.value = "";
  editor.value = val;
});
