const USERS_KEY = "scamshieldUsers";
const SESSION_KEY = "scamshieldSession";

export function getUsers() {
  try {
    const users = JSON.parse(
      localStorage.getItem(USERS_KEY) || "[]"
    );

    return Array.isArray(users)
      ? users
      : [];
  } catch (error) {
    console.error(
      "Unable to read users:",
      error
    );

    return [];
  }
}

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

export function createUser({
  name,
  email,
  password,
}) {
  const users =
    getUsers();

  const cleanEmail =
    email.trim().toLowerCase();

  const exists =
    users.some(
      (user) =>
        user.email.toLowerCase() ===
        cleanEmail
    );

  if (exists) {
    return {
      success: false,
      message:
        "An account with this email already exists.",
    };
  }

  const newUser = {
    id: generateId(),
    name: name.trim(),
    email: cleanEmail,

    // Frontend prototype only.
    // Move password authentication to backend later.
    password,

    joined:
      new Date().toISOString(),
  };

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify([
      ...users,
      newUser,
    ])
  );

  createSession(newUser);

  return {
    success: true,
    user: newUser,
  };
}

export function loginUser(
  email,
  password
) {
  const cleanEmail =
    email.trim().toLowerCase();

  const users =
    getUsers();

  const user =
    users.find(
      (item) =>
        item.email.toLowerCase() ===
        cleanEmail
    );

  if (!user) {
    return {
      success: false,
      message:
        "No ScamShield account found with this email.",
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message:
        "Incorrect password. Please try again.",
    };
  }

  createSession(user);

  return {
    success: true,
    user,
  };
}

export function createSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      userId: user.id,
      email: user.email,
      loggedInAt:
        new Date().toISOString(),
    })
  );
}

export function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem(
        SESSION_KEY
      )
    );
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const session =
    getSession();

  if (!session) return null;

  return (
    getUsers().find(
      (user) =>
        user.id === session.userId
    ) || null
  );
}

export function isAuthenticated() {
  return Boolean(
    getCurrentUser()
  );
}

export function logoutUser() {
  localStorage.removeItem(
    SESSION_KEY
  );
}