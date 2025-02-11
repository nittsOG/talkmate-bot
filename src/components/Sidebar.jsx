import React from "react";
import "../styles/Sidebar.css";
import { db } from "../firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";

const Sidebar = ({ sessions, onNewChat, onSelectSession, refreshSessions }) => {
  const handleDeleteSession = async (sessionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this session?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "chats", sessionId));
      refreshSessions();  // ✅ Auto-refresh after deletion
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
                <button className="delete-btn" onClick={() => handleDeleteSession(session.id)}>🗑</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
