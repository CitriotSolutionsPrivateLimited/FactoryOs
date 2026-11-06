import React, { useReducer } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { RootContext } from './context/RootContext';
import rootReducer from './reducers/rootReducer';
import PrivateRoute from './layouts/PrivateRoute';
import Login from './components/auth/login';
import Home from './components/home';

function App() {

  const initalState = {
    auth: {
      isLoggedIn: false,
      user: null
    },
  };

  const [state, dispatch] = useReducer(
    rootReducer(initalState),
    initalState
  );

  return (
    <RootContext.Provider value={{ ...state, dispatch }}>
      <Router>

        {/* Socket notification listener */}

        {/* Toast notification display */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          style={{ zIndex: 999999 }}
        />

        <Routes>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/home/*"
            element={
              <PrivateRoute>
                <Home path="/home" />
              </PrivateRoute>
            }
          />

           <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

        </Routes>

      </Router>
    </RootContext.Provider>
  );
}

export default App;