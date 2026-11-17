import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  LogOut,
  ArrowLeft,
  ScanLine,
  Lock,
  Trash2,
  Clock,
  Mail,
  CalendarDays,
  User,
} from "lucide-react";

import CyberWorld
  from "../components/CyberWorld";

import useCyberInteractions
  from "../hooks/useCyberInteractions";

import {
  getCurrentUser,
  logoutUser,
  deleteCurrentUser,
} from "../utils/auth";

import {
  getScanHistory,
  clearScanHistory,
} from "../utils/scans";

import "./profile.css";


function Profile() {
  useCyberInteractions();

  const navigate =
    useNavigate();

  const user =
    getCurrentUser();


  const [
    history,
    setHistory,
  ] = useState(
    () =>
      getScanHistory(
        user?.email
      )
  );


  /* =========================================================
     STATISTICS
     ========================================================= */

  const scanned =
    history.length;


  const threats =
    history.filter(
      (scan) =>
        scan.riskScore >= 40
    ).length;


  const safe =
    history.filter(
      (scan) =>
        scan.riskScore < 40
    ).length;


  const threatRate =
    scanned > 0
      ? Math.round(
          (
            threats /
            scanned
          ) * 100
        )
      : 0;


  const averageRisk =
    scanned > 0
      ? Math.round(
          history.reduce(
            (
              total,
              scan
            ) =>
              total +
              scan.riskScore,
            0
          ) /
          scanned
        )
      : 0;


  const securityLevel =
    threatRate >= 70
      ? "HIGH ALERT"
      : threatRate >= 40
        ? "MONITORING"
        : "SECURE";


  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = async () => {
    const result = await logoutUser();
    if (!result.success) {
      window.alert(result.message);
      return;
    }

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  /* =========================================================
     DELETE ACCOUNT
     ========================================================= */

  const handleDeleteAccount =
    async () => {

      const confirmation =
        window.prompt(
          `WARNING!

This will permanently delete:

• Your ScamShield account
• Your scan history in this browser
• Your current login session

Type DELETE to confirm.`
        );


      if (
        confirmation !==
        "DELETE"
      ) {
        return;
      }


      /*
        Remove user account.
      */

      const result =
        await deleteCurrentUser();


      if (!result.success) {
        window.alert(
          result.message
        );

        return;
      }


      window.alert(
        "Your ScamShield account has been deleted."
      );
      if (user?.email) clearScanHistory(user.email);


      navigate(
        "/signup",
        {
          replace: true,
        }
      );
    };


  /* =========================================================
     CLEAR HISTORY
     ========================================================= */

  const handleClear = () => {
    const confirmed =
      window.confirm(
        "Clear all ScamShield scan history?"
      );


    if (!confirmed) {
      return;
    }


    clearScanHistory(
      user?.email
    );


    setHistory([]);
  };


  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate = (
    timestamp
  ) => {

    if (!timestamp) {
      return "Unknown";
    }


    return new Date(
      timestamp
    ).toLocaleString(
      "en-IN",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    );
  };


  const formatJoined = (
    timestamp
  ) => {

    if (!timestamp) {
      return "Unknown";
    }


    return new Date(
      timestamp
    ).toLocaleDateString(
      "en-IN",
      {
        month:
          "short",

        year:
          "numeric",
      }
    );
  };


  /* =========================================================
     RISK STYLES
     ========================================================= */

  const riskClass = (
    score
  ) => {

    if (
      score >= 70
    ) {
      return "high";
    }


    if (
      score >= 40
    ) {
      return "medium";
    }


    return "low";
  };


  const riskLabel = (
    score
  ) => {

    if (
      score >= 70
    ) {
      return "HIGH RISK";
    }


    if (
      score >= 40
    ) {
      return "SUSPICIOUS";
    }


    return "LOW RISK";
  };


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="profile-page">

      <CyberWorld />


      {/* NAVBAR */}

      <nav className="profile-navbar">

        <Link
          to="/"
          className="back-button magnetic"
        >

          <ArrowLeft
            size={16}
          />

          DASHBOARD

        </Link>


        <Link
          to="/"
          className="profile-brand"
        >

          <Shield
            size={20}
          />

          SCAM

          <span>
            SHIELD
          </span>

        </Link>


        <div className="online-status">

          <span />

          ENGINE ONLINE

        </div>

      </nav>


      <main className="profile-container">


        {/* PROFILE HEADER */}

        <section className="profile-header tilt-card cyber-shine">

          <div className="avatar">

            <User
              size={36}
            />

          </div>


          <div className="profile-identity">

            <p className="profile-label">
              SECURITY OPERATOR
            </p>


            <h1>
              {user?.name}
            </h1>


            <div className="user-meta">

              <span>

                <Mail
                  size={13}
                />

                {user?.email}

              </span>


              <span>

                <CalendarDays
                  size={13}
                />

                Joined{" "}

                {formatJoined(
                  user?.joined
                )}

              </span>

            </div>

          </div>


          <div className="protection-status">

            <CheckCircle
              size={19}
            />


            <div>

              <strong>
                PROTECTED
              </strong>

              <span>
                Security session active
              </span>

            </div>

          </div>

        </section>


        {/* SECURITY CARD */}

        <section className="security-card tilt-card cyber-shine">

          <div className="security-core">

            <Lock
              size={27}
            />

          </div>


          <div className="security-info">

            <p>
              SECURITY POSTURE
            </p>


            <h2>
              {securityLevel}
            </h2>


            <div className="security-bar">

              <div
                style={{
                  width:
                    `${Math.max(
                      10,
                      100 -
                        threatRate
                    )}%`,
                }}
              />

            </div>


            <span>

              Calculated from your
              recent threat analysis.

            </span>

          </div>

        </section>


        {/* PROFILE STATS */}

        <section className="profile-stats">

          <ProfileStat
            icon={
              <ScanLine />
            }
            title="MESSAGES SCANNED"
            value={
              scanned
            }
          />


          <ProfileStat
            icon={
              <AlertTriangle />
            }
            title="THREATS DETECTED"
            value={
              threats
            }
            type="danger"
          />


          <ProfileStat
            icon={
              <CheckCircle />
            }
            title="SAFE MESSAGES"
            value={
              safe
            }
            type="safe"
          />


          <ProfileStat
            icon={
              <Activity />
            }
            title="AVERAGE RISK"
            value={
              `${averageRisk}%`
            }
          />

        </section>


        {/* SCAN HISTORY */}

        <section className="history-panel tilt-card">

          <div className="panel-heading">

            <div className="heading-left">

              <Clock
                size={18}
              />


              <div>

                <h3>
                  SCAN HISTORY
                </h3>

                <p>
                  RECENT THREAT INTELLIGENCE
                </p>

              </div>

            </div>


            {history.length >
              0 && (

              <button
                className="clear-history-button magnetic"
                onClick={
                  handleClear
                }
              >

                <Trash2
                  size={14}
                />

                CLEAR

              </button>

            )}

          </div>


          {history.length ===
          0 ? (

            <div className="empty-history">

              <ScanLine
                size={40}
              />


              <h3>
                NO SCANS YET
              </h3>


              <p>

                Analyze your first
                suspicious message to
                generate threat data.

              </p>


              <Link
                to="/"
                className="scan-button magnetic"
              >

                <ScanLine
                  size={17}
                />

                START SCANNING

              </Link>

            </div>

          ) : (

            <div className="history-list">

              {history.map(
                (scan) => (

                  <div
                    className="history-item"
                    key={
                      scan.id
                    }
                  >

                    <div
                      className={`history-score ${riskClass(
                        scan.riskScore
                      )}`}
                    >

                      {
                        scan.riskScore
                      }

                    </div>


                    <div className="history-info">

                      <div className="history-top">

                        <strong
                          className={
                            riskClass(
                              scan.riskScore
                            )
                          }
                        >

                          {riskLabel(
                            scan.riskScore
                          )}

                        </strong>


                        <span>

                          {formatDate(
                            scan.timestamp
                          )}

                        </span>

                      </div>


                      <p className="history-message">

                        {
                          scan.message
                        }

                      </p>


                      {scan.threats
                        ?.length >
                      0 ? (

                        <div className="history-threats">

                          {scan.threats
                            .slice(
                              0,
                              4
                            )
                            .map(
                              (
                                threat,
                                index
                              ) => (

                                <span
                                  key={
                                    `${threat.title}-${index}`
                                  }
                                >

                                  {
                                    threat.title
                                  }

                                </span>

                              )
                            )}

                        </div>

                      ) : (

                        <div className="history-safe">

                          <CheckCircle
                            size={13}
                          />

                          No major threats detected

                        </div>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* SECURITY SYSTEMS */}

        <section className="system-panel tilt-card cyber-shine">

          <div className="panel-heading">

            <div className="heading-left">

              <Activity
                size={18}
              />


              <div>

                <h3>
                  SECURITY SYSTEMS
                </h3>

                <p>
                  DETECTION ENGINE STATUS
                </p>

              </div>

            </div>

          </div>


          <div className="system-grid">

            <SystemStatus
              title="PHISHING DETECTOR"
              description="Social engineering analysis"
            />


            <SystemStatus
              title="URL ANALYSIS"
              description="Suspicious link inspection"
            />


            <SystemStatus
              title="CREDENTIAL GUARD"
              description="OTP and password detection"
            />


            <SystemStatus
              title="PAYMENT MONITOR"
              description="Financial fraud indicators"
            />

          </div>

        </section>


        {/* ACCOUNT ACTIONS */}

        <section className="profile-actions">

          <Link
            to="/"
            className="scan-button magnetic"
          >

            <ScanLine
              size={17}
            />

            SCAN NEW MESSAGE

          </Link>


          <button
            type="button"
            className="logout-button magnetic"
            onClick={
              handleLogout
            }
          >

            <LogOut
              size={17}
            />

            LOG OUT

          </button>


          <button
            type="button"
            className="delete-account-button magnetic"
            onClick={
              handleDeleteAccount
            }
          >

            <Trash2
              size={17}
            />

            DELETE ACCOUNT

          </button>

        </section>

      </main>

    </div>
  );
}


/* =========================================================
   PROFILE STAT
   ========================================================= */

function ProfileStat({
  icon,
  title,
  value,
  type = "",
}) {

  return (
    <div
      className={
        `profile-stat ${type} tilt-card cyber-shine`
      }
    >

      <div className="profile-stat-icon">
        {icon}
      </div>


      <p>
        {title}
      </p>


      <h2>
        {value}
      </h2>

    </div>
  );
}


/* =========================================================
   SYSTEM STATUS
   ========================================================= */

function SystemStatus({
  title,
  description,
}) {

  return (
    <div className="system-status">

      <div className="system-icon">

        <Shield
          size={18}
        />

      </div>


      <div>

        <strong>
          {title}
        </strong>


        <p>
          {description}
        </p>

      </div>


      <div className="system-online">

        <span />

        ONLINE

      </div>

    </div>
  );
}


export default Profile;
