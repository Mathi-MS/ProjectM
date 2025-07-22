import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = Cookies.get("CableToken");
    return !!token;
  });
  console.log(isAuthenticated,"qwd");
  

  useEffect(() => {
    // Check authentication status when component mounts
    const token = Cookies.get("CableToken");
    setIsAuthenticated(!!token);

    // Also check periodically or on focus
    const handleFocus = () => {
      const token = Cookies.get("CableToken");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
