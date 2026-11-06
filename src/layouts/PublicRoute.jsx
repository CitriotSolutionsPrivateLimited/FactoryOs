// routes/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import useAuth from "../hooks/useAuth";
import { RootContext } from "../context/RootContext";

const PublicRoute = ({ children }) => {
  const isLoggedIn = useAuth();
  const { admin } = useContext(RootContext);

  if (!isLoggedIn) {
    return children;
  }

  return <Navigate to="/userhome/Dashboard" replace />;
};

export default PublicRoute;