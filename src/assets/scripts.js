// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Editor/Runner wiring
const statusEl = document.getElementById("status");
const runBtn = document.getElementById("btn-run");
const clearBtn = document.getElementById("btn-clear");
const editor = document.getElementById("editor");
const output = document.getElementById("output");

let pyodide;

// Append to console area
function write(line = "") {
  output.textContent += line + "\n";
  output.scrollTop = output.scrollHeight;
}

// Boot Pyodide
async function boot() {
  if (!statusEl) return;
  statusEl.innerHTML = `<i class="bi bi-cloud-download"></i> Downloading Pyodide…`;
  pyodide = await loadPyodide({
    stdin: () => null,
    stdout: (s) => write(s),
    stderr: (s) => write(s),
  });
  statusEl.innerHTML = `<i class="bi bi-check2-circle"></i> Ready`;
  if (runBtn) runBtn.disabled = false;
  if (clearBtn) clearBtn.disabled = false;
}
boot();

// Run Python
runBtn?.addEventListener("click", async () => {
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

// Clear console
clearBtn?.addEventListener("click", () => {
  output.textContent = "";
});
