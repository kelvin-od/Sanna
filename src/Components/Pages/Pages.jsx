import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../PublicPages/LandingPage";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";
import NetworkProfile from "./NetworkProfile";
import Notification from "./Notification";
import Messaging from "./Messaging";
import Profile from "./Profile";
import Post from "../Posts/Post";
import CrossSell from "./CrossSell";
import Accounts from "./Accounts";
import ProtectedRoute from "../../utility/ProtectedRoute";
import { ConnectionProvider } from '../../utility/ConnectionContext';
import { NotificationProvider } from '../../utility/NotificationContext'; 

const Pages = () => {
  return (
    <ConnectionProvider> 
      <NotificationProvider> 
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />
          <Route
            path="/feeds"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <NetworkProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messaging"
            element={
              <ProtectedRoute>
                <Messaging />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <ProtectedRoute>
                <Post />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cross-sell"
            element={
              <ProtectedRoute>
                <CrossSell />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            }
          />
        </Routes>
      </NotificationProvider>
    </ConnectionProvider>
  );
};

export default Pages;
