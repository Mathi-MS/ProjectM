import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";


const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = Cookies.get("PRT_token");

    return !!token;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = Cookies.get("PRT_token");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
