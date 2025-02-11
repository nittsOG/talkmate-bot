import React from "react";
import ProfileMenu from "./ProfileMenu";
import "../styles/Navbar.css";

const Navbar = ({ user, refreshSessions }) => {
  return (
    <div className="navbar">
      <h2>TalkMate</h2>
      <ProfileMenu user={user} refreshSessions={refreshSessions} />
    </div>
  );
};

export default Navbar;
