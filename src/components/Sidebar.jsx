import React, { useState } from "react";
import "../styles/Sidebar.css";
import { db } from "../firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";

const Sidebar = ({ sessions, onNewChat, onSelectSession, refreshSessions }) => {
  const [menuOpen, setMenuOpen] = useState(null);

  const toggleMenu = (sessionId) => {
    setMenuOpen(menuOpen === sessionId ? null : sessionId);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteDoc(doc(db, "chats", sessionId));
      
      if (refreshSessions) { // ✅ Avoids undefined function error
        refreshSessions(); // ✅ Auto-refresh sessions
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return (
    <div className="sidebar">
      <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>
      <div className="chat-history">
        {sessions.length === 0 ? (
          <p className="no-history">No previous chats</p>
        ) : (
          sessions.map((session, index) => {
            let createdAt = "Unknown Date";
            if (session.createdAt instanceof Date) {
              createdAt = session.createdAt.toLocaleString();
            } else if (session.createdAt?.seconds) {
              createdAt = new Date(session.createdAt.seconds * 1000).toLocaleString();
            }

            return (
              <div key={session.id} className="chat-item">
                <span onClick={() => onSelectSession(session.id)}>Chat {index + 1} - {createdAt}</span>

                {/* Three-dot menu button */}
                <button className="menu-btn" onClick={() => toggleMenu(session.id)}>⋮</button>

                {/* Dropdown menu */}
                {menuOpen === session.id && (
                  <div className="menu-dropdown">
                    <button onClick={() => handleDeleteSession(session.id)} className="delete-option">
                      <h2>🗑</h2> 
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
