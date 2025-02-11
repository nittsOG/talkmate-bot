import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import "../styles/ProfileMenu.css";

const ProfileMenu = ({ user, refreshSessions }) => {
  const [menuOpen, setMenuOpen] = useState(false);

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

        // ✅ Delete all messages first
        for (const message of messagesSnapshot.docs) {
          await deleteDoc(doc(db, "chats", chat.id, "messages", message.id));
        }

        // ✅ Then delete the chat session itself
        await deleteDoc(doc(db, "chats", chat.id));
      }

      if (typeof refreshSessions === "function") {
        refreshSessions(); // ✅ Auto-refresh sessions
      }

      alert("✅ All data cleared successfully!");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      alert("Failed to clear data. Please try again.");
    }
  };

  // ✅ Delete Account (Deletes user + all data)
  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action is irreversible!");

    if (confirmDelete) {
      try {
        // ✅ Step 1: Ask user to reauthenticate
        const password = prompt("For security, please enter your password:");
        if (!password) return alert("Account deletion canceled.");

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        // ✅ Step 2: Clear all user data before deleting the account
        await handleClearData();

        // ✅ Step 3: Delete user from Firebase Authentication
        await deleteUser(auth.currentUser);

        alert("✅ Account and all related data deleted successfully!");
        window.location.href = "/login";
      } catch (error) {
        console.error("❌ Error deleting account:", error);
        if (error.code === "auth/requires-recent-login") {
          alert("⚠️ Please log out and log in again before deleting your account.");
        } else {
          alert("Failed to delete account. Please try again.");
        }
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
          <button onClick={handleDeleteAccount}>🚨 Delete Account</button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
