import { analyzeContent } from "./utils/scanner";
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import {
  Search,
  AlertTriangle,
  CheckCircle,
  Activity,
  Link as LinkIcon,
  CreditCard,
  Zap,
  User,
  KeyRound,
  Gift,
  Building2,
  Smartphone,
  Sparkles,
  ScanLine,
} from "lucide-react";

import CyberWorld from "./components/CyberWorld";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

import scamShieldLogo from "./assets/scamshield-logo.png";

import useCyberInteractions from "./hooks/useCyberInteractions";

import {
  getCurrentUser,
} from "./utils/auth";

import {
  getScanHistory,
  saveScan,
} from "./utils/scans";

import "./App.css";


function ThreatIcon({ type }) {
  const props = {
    size: 18,
  };

  switch (type) {
    case "credential":
      return <KeyRound {...props} />;

    case "payment":
      return <CreditCard {...props} />;

    case "url":
      return <LinkIcon {...props} />;

    case "prize":
      return <Gift {...props} />;

    case "banking":
      return <Building2 {...props} />;

    case "remote":
      return <Smartphone {...props} />;

    case "impersonation":
      return <User {...props} />;

    default:
      return <AlertTriangle {...props} />;
  }
}


function Dashboard() {
  useCyberInteractions();

  const user = getCurrentUser();

  const [message, setMessage] =
    useState("");

  const [analyzed, setAnalyzed] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [threats, setThreats] =
    useState([]);

  const [scanning, setScanning] =
    useState(false);

  const [history, setHistory] =
    useState(() =>
      getScanHistory(user?.email)
    );


  const analyzeMessage = () => {
    if (!message.trim()) return;

    setScanning(true);
    setAnalyzed(false);

    setTimeout(() => {
      const result = analyzeContent(message);
      const finalScore = result.riskScore;
      const detected = result.threats;

      setScore(finalScore);
      setThreats(detected);
      setAnalyzed(true);
      setScanning(false);


      const scan = {
        id:
          typeof crypto !==
            "undefined" &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now(),

        message:
          message.trim(),

        riskScore:
          finalScore,

        riskLevel:
          finalScore >= 70
            ? "HIGH RISK"
            : finalScore >= 40
              ? "SUSPICIOUS"
              : "LOW RISK",

        threats:
          detected,

        timestamp:
          new Date().toISOString(),
      };


      if (user?.email) {
        const updated =
          saveScan(
            user.email,
            scan
          );

        setHistory(updated);
      }

    }, 850);
  };


  const riskLabel = () => {
    if (score >= 70)
      return "HIGH RISK";

    if (score >= 40)
      return "SUSPICIOUS";

    return "LOW RISK";
  };


  const verdict = () => {
    if (score >= 70) {
      return (
        "Multiple high-risk phishing or social-engineering indicators " +
        "were detected. Do not click links, send money or disclose " +
        "credentials until the sender has been independently verified."
      );
    }

    if (score >= 40) {
      return (
        "Suspicious characteristics were detected. Verify the sender " +
        "through an official channel before taking action."
      );
    }

    return (
      "No major known scam indicators were detected. " +
      "This does not guarantee that the message is safe."
    );
  };


  const totalScans =
    history.length;

  const threatsDetected =
    history.filter(
      (scan) =>
        scan.riskScore >= 40
    ).length;

  const safeMessages =
    history.filter(
      (scan) =>
        scan.riskScore < 40
    ).length;


  const demoMessage =
    "URGENT: Your bank account has been suspended. Verify your account immediately at https://secure-login-verify.example and enter your OTP.";


  return (
    <div className="app">

      <CyberWorld />

      <nav className="navbar">

        <Link
          to="/"
          className="logo"
        >

          <div className="logo-icon">
            <img
              src={scamShieldLogo}
              alt="ScamShield"
            />
          </div>

          <div className="brand-copy">

            <h2>
              SCAM
              <span>SHIELD</span>
            </h2>

            <p>
              DIGITAL THREAT INTELLIGENCE
            </p>

          </div>

        </Link>


        <div className="nav-actions">

          <div className="system-chip">
            <span />
            ENGINE ONLINE
          </div>

          <Link
            to="/profile"
            className="profile-nav magnetic"
          >
            <User size={16} />

            {user?.name
              ?.split(" ")[0]
              ?.toUpperCase() ||
              "PROFILE"}
          </Link>

        </div>

      </nav>


      <main>

        <section className="hero">

          <div className="hero-tag">
            <Sparkles size={14} />
            HYBRID THREAT ANALYSIS
          </div>

          <h1>
            Think before
            <br />

            <span>
              you click.
            </span>
          </h1>

          <p>
            Analyze suspicious SMS,
            WhatsApp messages, emails,
            payment requests and links for
            phishing, fraud and social
            engineering signals.
          </p>

        </section>


        <section className="scanner-card tilt-card cyber-shine">

          <div className="scanner-header">

            <div>

              <p className="eyebrow">
                THREAT SCANNER
              </p>

              <h3>
                Analyze suspicious content
              </h3>

              <span>
                Paste any suspicious
                message below.
              </span>

            </div>

            <div className="scanner-icon">
              <ScanLine size={24} />
            </div>

          </div>


          <div className="scanner-input-shell">

            <textarea
              placeholder="Paste suspicious SMS, WhatsApp message, email or URL here..."
              value={message}
              onChange={(event) => {
                setMessage(
                  event.target.value
                );

                setAnalyzed(false);
              }}
            />

            {scanning && (
              <div className="scanner-beam beam-active" />
            )}

          </div>


          <div className="scanner-footer">

            <button
              type="button"
              className="example-button magnetic"
              onClick={() => {
                setMessage(
                  demoMessage
                );

                setAnalyzed(false);
              }}
            >
              LOAD DEMO MESSAGE
            </button>

            <button
              type="button"
              className="analyze-button magnetic"
              onClick={
                analyzeMessage
              }
              disabled={
                scanning ||
                !message.trim()
              }
            >

              {scanning ? (
                <>
                  <Activity
                    size={18}
                    className="spin-icon"
                  />

                  ANALYZING THREAT
                </>
              ) : (
                <>
                  <Zap size={18} />
                  ANALYZE MESSAGE
                </>
              )}

            </button>

          </div>

        </section>


        {analyzed && (

          <section
            className={`result tilt-card ${
              score >= 70
                ? "danger-result"
                : ""
            }`}
          >

            <div className="result-grid">


              <div className="threat-meter-card">

                <p className="eyebrow">
                  THREAT SCORE
                </p>

                <div
                  className={`threat-meter ${
                    score >= 70
                      ? "danger-meter"
                      : score >= 40
                        ? "warning-meter"
                        : "safe-meter"
                  }`}
                  style={{
                    "--score":
                      `${score * 3.6}deg`,
                  }}
                >

                  <div className="meter-inner">

                    <strong>
                      {score}
                    </strong>

                    <span>
                      /100
                    </span>

                  </div>

                </div>


                <div
                  className={`risk-pill ${
                    score >= 70
                      ? "high"
                      : score >= 40
                        ? "medium"
                        : "low"
                  }`}
                >

                  {score >= 40 ? (
                    <AlertTriangle
                      size={15}
                    />
                  ) : (
                    <CheckCircle
                      size={15}
                    />
                  )}

                  {riskLabel()}

                </div>

              </div>


              <div className="analysis-panel">

                <div className="analysis-heading">

                  <div>

                    <p className="eyebrow">
                      DETECTION REPORT
                    </p>

                    <h3>
                      Identified signals
                    </h3>

                  </div>

                  <Search size={21} />

                </div>


                {threats.length === 0 ? (

                  <div className="clean-state">

                    <CheckCircle
                      size={30}
                    />

                    <div>

                      <strong>
                        No major threats detected
                      </strong>

                      <p>
                        No high-risk patterns
                        were identified.
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="detections">

                    {threats.map(
                      (threat, index) => (

                        <div
                          className="threat-item"
                          key={`${threat.type}-${index}`}
                        >

                          <div className="threat-icon">

                            <ThreatIcon
                              type={
                                threat.type
                              }
                            />

                          </div>

                          <div className="threat-info">

                            <strong>
                              {threat.title}
                            </strong>

                            <p>
                              {threat.detail}
                            </p>

                          </div>

                          <span className="threat-weight">
                            +{threat.weight}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>


            <div className="verdict">

              <div className="verdict-header">

                <Activity size={18} />

                <div>
                  <span>
                    EXPLAINABLE VERDICT
                  </span>

                  <h3>
                    ScamShield analysis
                  </h3>
                </div>

              </div>

              <p>
                {verdict()}
              </p>

            </div>

          </section>

        )}


        <section className="stats">

          <div className="stat-card tilt-card cyber-shine">

            <div className="stat-icon">
              <ScanLine />
            </div>

            <div>
              <p>
                MESSAGES SCANNED
              </p>

              <h2>
                {totalScans}
              </h2>
            </div>

          </div>


          <div className="stat-card danger-stat tilt-card cyber-shine">

            <div className="stat-icon">
              <AlertTriangle />
            </div>

            <div>
              <p>
                THREATS DETECTED
              </p>

              <h2>
                {threatsDetected}
              </h2>
            </div>

          </div>


          <div className="stat-card tilt-card cyber-shine">

            <div className="stat-icon">
              <CheckCircle />
            </div>

            <div>
              <p>
                SAFE MESSAGES
              </p>

              <h2>
                {safeMessages}
              </h2>
            </div>

          </div>

        </section>

      </main>


      <footer className="app-footer">

        <img
          src={scamShieldLogo}
          alt=""
        />

        SCAMSHIELD SECURITY ENGINE

        <span>•</span>

        NEVER SHARE OTPs OR PASSWORDS

      </footer>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;