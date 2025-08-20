const USER = "aeiwz";
const REPO = "Python-101";
// Optional: your own Jupyter (Hub/Server) base URL via env var (no trailing slash)
const JUPYTER_BASE = process.env.NEXT_PUBLIC_JUPYTER_BASE ?? ""; // e.g. "https://hub.yourschool.edu/user/you"

const NOTEBOOKS = [
  { slug: "intro", title: "Intro to ML (scikit-learn)" },
  { slug: "pandas-basics", title: "Pandas Basics" },
];

export default function Notebooks() {
  return (
    <main className="container py-4">
      {/* Navbar with Home */}
      <nav className="navbar navbar-expand-lg border-bottom mb-4">
        <div className="container-fluid">
          <a href="/" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-house me-1"/> Home
          </a>
          <span className="navbar-text ms-3 fw-bold">
            <i className="bi bi-journal-richtext me-1"/> Notebooks
          </span>
        </div>
      </nav>

      <h1 className="h4 mb-3">Course Notebooks</h1>
      <p className="text-secondary">
        Open each notebook on Colab or Binder for full <b>pandas</b> and <b>scikit‑learn</b>. If you have access to a
        JupyterHub/Server, use that button.
      </p>

      <div className="row row-cols-1 row-cols-md-2 g-3">
        {NOTEBOOKS.map(n => {
          const path = `App/notebooks/${n.slug}.ipynb`;
          const colab = `https://colab.research.google.com/github/${USER}/${REPO}/blob/main/${path}`;

          return (
            <div className="col" key={n.slug}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{n.title}</h5>
                  <p className="text-secondary small mb-3">{path}</p>
                  <div className="d-flex flex-wrap gap-2">
                    <a className="btn btn-warning" href={colab} target="_blank" rel="noreferrer">
                      <i className="bi bi-box-arrow-up-right me-1"/> Open in Colab
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="alert alert-info small mt-4">
        <i className="bi bi-info-circle me-1"/> Tip: put dataset files alongside the notebooks (e.g. <code>/notebooks/data/</code>)
        so Colab/Binder/Jupyter can access them with relative paths.
      </div>
    </main>
  );
}