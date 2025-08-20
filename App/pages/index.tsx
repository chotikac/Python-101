import Footer from "@/components/Footer";
import { FaHome, FaRobot, FaTerminal, FaCode, FaDatabase, FaMicrochip } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";

export default function Home() {
  return (
    <main className="container py-4">
      <div className="card border-0 shadow-sm bg-surface">
        <div className="card-body p-4 p-lg-5">
          {/* Hero */}
          <section className="text-center">
            <h1 className="display-4 fw-bold mb-3 lh-1">
              Learn <span className="brand-grad">Python</span> - Build Anything.
            </h1>
            <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: 820 }}>
              From programming basics to data analysis and machine learning with scikit-learn.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <a href="/sklearn-demo" className="btn btn-primary btn-lg d-flex align-items-center gap-2">
                <FaRobot /> Try scikit-learn Demo
              </a>
              <a href="/console" className="btn btn-outline-primary btn-lg d-flex align-items-center gap-2">
                <FaTerminal /> Open Python Console
              </a>
            </div>
          </section>

          {/* Feature cards */}
          <section className="mt-5">
            <div className="row row-cols-1 row-cols-md-3 g-3">
              <div className="col">
                <div className="card h-100 glow-tile">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center gap-2">
                      <FaCode /> Python 101
                    </h5>
                    <p className="text-secondary mb-3">
                      Variables, control flow, functions, and problem-solving with code.
                    </p>
                    <a className="link-primary" href="/examples#python101">Start coding →</a>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card h-100 glow-tile">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center gap-2">
                      <FaDatabase /> Data Types & Structures
                    </h5>
                    <p className="text-secondary mb-3">
                      Lists, dictionaries, sets, tuples — learn how to manage and organize data.
                    </p>
                    <a className="link-primary" href="/examples#datastruct">Explore examples →</a>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card h-100 glow-tile">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center gap-2">
                      <FaMicrochip /> Data → ML
                    </h5>
                    <p className="text-secondary mb-3">
                      From raw data to predictive models — pandas workflows & scikit-learn pipelines.
                    </p>
                    <a className="link-primary" href="/sklearn-demo">Try demo →</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center mt-4">
            <hr className="my-4" />
            <p className="lead text-secondary">
              <IoRocketOutline /> Ready to start? Open the{" "}
              <a href="/console" className="link-primary">interactive console</a>{" "}
              and write your first Python program.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}