import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import "../styles/ProfileMenu.css";

const ProfileMenu = ({ user, refreshSessions }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // ✅ Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // ✅ Clear Data (Deletes all chat sessions and messages)
  const handleClearData = async () => {
    if (!user) return;

    try {
      const chatsQuery = query(collection(db, "chats"), where("userId", "==", user.uid));
      const chatSnapshots = await getDocs(chatsQuery);

      if (chatSnapshots.empty) {
        alert("No data found to clear!");
        return;
      }

      for (const chat of chatSnapshots.docs) {
        const messagesQuery = collection(db, "chats", chat.id, "messages");
        const messagesSnapshot = await getDocs(messagesQuery);

        for (const message of messagesSnapshot.docs) {
          await deleteDoc(doc(db, "chats", chat.id, "messages", message.id));
        }

        await deleteDoc(doc(db, "chats", chat.id));
      }

      if (typeof refreshSessions === "function") {
        refreshSessions();
      }

      alert("✅ All data cleared successfully!");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      alert("Failed to clear data. Please try again.");
    }
  };

  // ✅ Open Delete Account Modal
  const handleOpenDeleteModal = () => {
    setShowPasswordModal(true);
    setError("");
  };

  // ✅ Delete Account (Deletes user + all data)
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      await handleClearData();

      await deleteUser(auth.currentUser);

      alert("✅ Account and all related data deleted successfully!");
      window.location.href = "/login";
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (error.code === "auth/requires-recent-login") {
        setError("⚠️ Please log out and log in again before deleting your account.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
    }
  };

  return (
    <div className="profile-container">
      <button className="profile-button" onClick={toggleMenu}>⚙️</button>
      {menuOpen && (
        <div className="profile-dropdown">
          <p>{user.email}</p>
          <button onClick={handleClearData}>🗑 Clear Data</button>
          <button onClick={handleOpenDeleteModal}>🚨 Delete Account</button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Account Deletion</h3>
            <p>Enter your password to proceed:</p>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error-message">{error}</p>}
            <div className="modal-buttons">
              <button onClick={handleDeleteAccount} className="delete-btn">Confirm Delete</button>
              <button onClick={() => setShowPasswordModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
