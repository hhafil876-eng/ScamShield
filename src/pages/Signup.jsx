import { useState } from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  Activity,
} from "lucide-react";

import {
  createUser,
  isAuthenticated,
} from "../utils/auth";

import "../App.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
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

  const handleSignup = (event) => {
    event.preventDefault();

    setError("");

    if (name.trim().length < 2) {
      setError(
        "Please enter a valid name."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result =
        createUser({
          name,
          email,
          password,
        });

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
            SECURE REGISTRATION
          </span>

          <h1>
            Create account.
          </h1>

          <p>
            Join ScamShield and start
            protecting yourself from
            phishing, scams and suspicious
            messages.
          </p>

        </div>

        <form
          className="auth-form"
          onSubmit={handleSignup}
        >

          <label>
            FULL NAME
          </label>

          <div className="input-group">

            <User size={18} />

            <input
              type="text"
              placeholder="Your name"
              value={name}
              required
              autoComplete="name"
              onChange={(event) => {
                setName(
                  event.target.value
                );

                setError("");
              }}
            />

          </div>

          <label>
            EMAIL ADDRESS
          </label>

          <div className="input-group">

            <Mail size={18} />

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              required
              autoComplete="email"
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
              placeholder="Minimum 6 characters"
              value={password}
              required
              autoComplete="new-password"
              onChange={(event) => {
                setPassword(
                  event.target.value
                );

                setError("");
              }}
            />

          </div>

          <label>
            CONFIRM PASSWORD
          </label>

          <div className="input-group">

            <Lock size={18} />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              required
              autoComplete="new-password"
              onChange={(event) => {
                setConfirmPassword(
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
            type="submit"
            className="auth-submit magnetic"
            disabled={loading}
          >

            {loading
              ? "CREATING ACCOUNT..."
              : "CREATE SECURE ACCOUNT"}

            {!loading && (
              <ArrowRight size={18} />
            )}

          </button>

        </form>

        <p className="auth-switch">

          Already have an account?

          <Link to="/login">
            Sign in
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;