import React from "react";
import Home from "./Home";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";
import NetworkProfile from "./NetworkProfile"
import Notification from "./Notification"
import Messaging from "./Messaging";
import Profile from "./Profile"
import Post from "../Posts/Post"
import CrossSell from "./CrossSell"
import LandingPage from "../PublicPages/LandingPage";

const Pages = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage /> } />
        <Route path="/home" element={<Home />}></Route>
        <Route path="/login" element={ <Login />}/>
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/profile/:id" element={<NetworkProfile />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post/:postId" element={<Post />} />
        <Route path="/cross-sell" element={<CrossSell />} />
      </Routes>
    </div>
  );
};

export default Pages;