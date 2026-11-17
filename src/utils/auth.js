const API_URL = import.meta.env.VITE_API_URL || "";

const SESSION_KEY = "scamshieldSession";
const CSRF_KEY = "scamshieldCsrf";

// Remove credentials retained by the former browser-only account store.
localStorage.removeItem("scamshieldUsers");
const previousSession = localStorage.getItem(SESSION_KEY);
if (previousSession) {
  try {
    const { id, name, email, joined, loggedInAt } = JSON.parse(previousSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, name, email, joined, loggedInAt }));
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

/* =========================================
   CSRF TOKEN UTILITY
========================================= */

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getCsrfToken() {
  return getCookie("scamshield_csrf") || localStorage.getItem(CSRF_KEY) || "";
}

export function setCsrfToken(csrfToken) {
  if (csrfToken) {
    localStorage.setItem(CSRF_KEY, csrfToken);
  } else {
    localStorage.removeItem(CSRF_KEY);
  }
}

async function requestCsrfToken() {
  const response = await fetch(`${API_URL}/api/auth/csrf`, { credentials: "include" });
  if (!response.ok) throw new Error("Unable to initialize secure authentication.");
  const data = await response.json();
  setCsrfToken(data.csrfToken);
  return data.csrfToken;
}

/* =========================================
   SESSION MANAGEMENT
========================================= */

export function createSession(user, csrfToken) {
  if (csrfToken) {
    setCsrfToken(csrfToken);
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      joined: user.joined || user.createdAt || new Date().toISOString(),
      loggedInAt: new Date().toISOString(),
    })
  );
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  return {
    id: session.id,
    name: session.name,
    email: session.email,
    joined: session.joined,
  };
}

export function isAuthenticated() {
  return Boolean(getSession());
}

/* =========================================
   BACKEND AUTHENTICATION API CALLS
========================================= */

export async function createUser({ name, email, password }) {
  try {
    const csrfToken = await requestCsrfToken();
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || "Account creation failed.",
      };
    }

    createSession(data.user, data.csrfToken);

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error("Backend auth error:", error);
    return {
      success: false,
      message: "Unable to reach security authentication server. Please verify backend is running.",
    };
  }
}

export async function loginUser(email, password) {
  try {
    const csrfToken = await requestCsrfToken();
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        message: data.message || "Invalid credentials.",
      };
    }

    createSession(data.user, data.csrfToken);

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error("Backend auth error:", error);
    return {
      success: false,
      message: "Unable to reach security authentication server. Please verify backend is running.",
    };
  }
}

export async function logoutUser() {
  try {
    const csrfToken = await requestCsrfToken();
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Logout request failed.");
    localStorage.removeItem(SESSION_KEY);
    setCsrfToken(null);
    return { success: true };
  } catch {
    return { success: false, message: "Unable to log out. Please try again." };
  }
}

export async function deleteCurrentUser() {
  try {
    const csrfToken = await requestCsrfToken();
    const response = await fetch(`${API_URL}/api/auth/account`, {
      method: "DELETE", credentials: "include", headers: { "X-CSRF-Token": csrfToken },
    });
    if (!response.ok) return { success: false, message: "Unable to delete the account. Please try again." };
    localStorage.removeItem(SESSION_KEY);
    setCsrfToken(null);
    return { success: true };
  } catch {
    return { success: false, message: "Unable to delete the account. Please try again." };
  }
}

export async function fetchCurrentUserProfile() {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok && data.success) {
      createSession(data.user);
      return data.user;
    }

    localStorage.removeItem(SESSION_KEY);
    setCsrfToken(null);
    return null;
  } catch (error) {
    console.error("Profile sync error:", error);
    localStorage.removeItem(SESSION_KEY);
    setCsrfToken(null);
    return null;
  }
}
