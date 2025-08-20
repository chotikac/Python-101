export default function Home() {
  return (
    <main className="bg-grid p-4 rounded-3">
      {/* Hero */}
      <section className="text-center py-5">
        <h1 className="display-4 fw-bold mb-3">
          Learn <span className="text-primary">Python</span>. Build Anything.
        </h1>
        <p className="lead text-secondary mb-4">
          From programming basics to data analysis and machine learning with scikit-learn —
          all in one student-friendly course.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <a href="/sklearn-demo" className="btn btn-primary btn-lg">
            <i className="bi bi-robot me-2" />
            Try scikit-learn Demo
          </a>
          <a href="/console" className="btn btn-outline-primary btn-lg">
            <i className="bi bi-terminal me-2" />
            Open Python Console
          </a>
        </div>
      </section>

      {/* Feature cards */}
      <section className="container mt-5">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <div className="card h-100 card-glow">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-braces-asterisk me-2" />
                  Python 101
                </h5>
                <p className="text-secondary">
                  Variables, control flow, functions, and problem-solving with code.
                </p>
              </div>
              <div className="card-footer bg-transparent border-0">
                <a href="/console" className="link-primary">
                  Start coding →
                </a>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 card-glow">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-database-gear me-2" />
                  Data Types & Structures
                </h5>
                <p className="text-secondary">
                  Lists, dictionaries, sets, tuples — learn how to manage and organize data.
                </p>
              </div>
              <div className="card-footer bg-transparent border-0">
                <a href="/examples" className="link-primary">
                  Explore examples →
                </a>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100 card-glow">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-robot me-2" />
                  Data → ML
                </h5>
                <p className="text-secondary">
                  From raw data to predictive models — pandas workflows & scikit-learn pipelines.
                </p>
              </div>
              <div className="card-footer bg-transparent border-0">
                <a href="/sklearn-demo" className="link-primary">
                  Try demo →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center mt-5">
        <hr />
        <p className="lead text-secondary">
          🚀 Ready to start? Open the{" "}
          <a href="/console" className="link-primary">
            interactive console
          </a>{" "}
          and write your first Python program.
        </p>
      </section>
    </main>
  );
}