import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { RootContext } from '../context/RootContext';

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuth();
  const { logoutRedirect } = useContext(RootContext);

  if (!isLoggedIn) {
    return <Navigate to={logoutRedirect || "/login"} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;