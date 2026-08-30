import {
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Activity,
} from "lucide-react";

import {
  isAuthenticated,
  loginUser,
} from "../utils/auth";

import "../App.css";

function Login() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (isAuthenticated()) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  const handleLogin = (
    event
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    setTimeout(() => {
      const result =
        loginUser(
          email,
          password
        );

      if (!result.success) {
        setError(
          result.message
        );

        setLoading(false);
        return;
      }

      navigate("/");
    }, 450);
  };

  return (
    <div className="auth-page">

      <div className="auth-grid" />

      <div className="auth-glow glow-one" />
      <div className="auth-glow glow-two" />

      <div className="auth-card cyber-shine">

        <div className="auth-top">

          <div className="auth-icon">

            <Shield size={31} />

          </div>

          <div>

            <p className="auth-system">
              SCAMSHIELD
            </p>

            <span className="auth-status">

              <Activity size={10} />

              SECURITY NETWORK ONLINE

            </span>

          </div>

        </div>

        <div className="auth-heading">

          <span>
            AUTHENTICATION PORTAL
          </span>

          <h1>
            Welcome back.
          </h1>

          <p>
            Enter your credentials to access
            your ScamShield threat intelligence
            dashboard.
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          <label>
            EMAIL ADDRESS
          </label>

          <div className="input-group">

            <Mail size={18} />

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              autoComplete="email"
              required
              onChange={(event) => {
                setEmail(
                  event.target.value
                );

                setError("");
              }}
            />

          </div>

          <label>
            SECURITY PASSWORD
          </label>

          <div className="input-group">

            <Lock size={18} />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              autoComplete="current-password"
              required
              onChange={(event) => {
                setPassword(
                  event.target.value
                );

                setError("");
              }}
            />

          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="auth-submit magnetic"
            type="submit"
            disabled={loading}
          >

            {loading
              ? "AUTHENTICATING..."
              : "ACCESS SYSTEM"}

            {!loading && (
              <ArrowRight size={18} />
            )}

          </button>

        </form>

        <p className="auth-switch">

          Don't have an account?

          <Link to="/signup">
            Create secure account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;