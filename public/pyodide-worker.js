const PYODIDE_VERSION = '0.26.2';
let pyodide = null;
let activeRun = null;

async function getPyodide() {
  if (!pyodide) {
    const { loadPyodide } = await import(
      `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`
    );
    pyodide = await loadPyodide({
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
      // Pyodide sends one callback per completed output line.
      stdout: (text) => {
        if (activeRun) self.postMessage({ type: 'stdout', runId: activeRun, text });
      },
      stderr: (text) => {
        if (activeRun) self.postMessage({ type: 'stderr', runId: activeRun, text });
      },
    });
  }
  return pyodide;
}

self.onmessage = async ({ data }) => {
  if (data?.type !== 'run') return;

  const runId = data.runId;
  activeRun = runId;
  self.postMessage({ type: 'status', runId, status: 'loading' });

  try {
    const runtime = await getPyodide();
    await runtime.loadPackagesFromImports(data.code);
    const usesMatplotlib = /\b(matplotlib|pyplot)\b/.test(data.code);
    if (usesMatplotlib) {
      await runtime.loadPackage('matplotlib');
      await runtime.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.close("all")
`);
    }
    self.postMessage({ type: 'status', runId, status: 'running' });
    await runtime.runPythonAsync(data.code);
    if (usesMatplotlib) {
      const images = await runtime.runPythonAsync(`
import base64
import io
import matplotlib.pyplot as plt

_images = []
for _figure_number in plt.get_fignums():
    _buffer = io.BytesIO()
    plt.figure(_figure_number).savefig(_buffer, format="png", bbox_inches="tight", dpi=140)
    _images.append(base64.b64encode(_buffer.getvalue()).decode("ascii"))
_images
`);
      self.postMessage({ type: 'images', runId, images: Array.from(images.toJs()) });
      images.destroy();
    }
    self.postMessage({ type: 'result', runId, ok: true });
  } catch (error) {
    self.postMessage({
      type: 'result',
      runId,
      ok: false,
      error: error instanceof Error ? error.toString() : String(error),
    });
  } finally {
    activeRun = null;
  }
};
