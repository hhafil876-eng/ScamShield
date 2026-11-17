import {
  Navigate,
} from "react-router-dom";

import {
  fetchCurrentUserProfile,
} from "../utils/auth";
import { useEffect, useState } from "react";

function ProtectedRoute({
  children,
}) {
  const [authenticated, setAuthenticated] = useState(null);
  useEffect(() => {
    let active = true;
    const validate = async () => {
      const user = await fetchCurrentUserProfile();
      if (active) setAuthenticated(Boolean(user));
    };
    validate();
    window.addEventListener("focus", validate);
    const timer = window.setInterval(validate, 60000);
    return () => {
      active = false;
      window.removeEventListener("focus", validate);
      window.clearInterval(timer);
    };
  }, []);
  if (authenticated === null) return null;
  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
