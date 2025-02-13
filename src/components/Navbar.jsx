import React from "react";
import ProfileMenu from "./ProfileMenu";
import "../styles/Navbar.css";

const Navbar = ({ user, refreshSessions }) => {
  return (
    <div className="navbar">
       <div className="logo">
          <span className="logo-highlight">TalkMate</span>BOT
      </div>
      {/* <h2 className="navbar-title">TalkMate</h2> */}
      <ProfileMenu user={user} refreshSessions={refreshSessions}  /> {/* ✅ Only one instance here */}
    </div>
  );
};

export default Navbar;
