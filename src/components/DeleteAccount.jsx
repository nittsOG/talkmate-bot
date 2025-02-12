import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import "../styles/DeleteAccount.css";

const DeleteAccount = ({ user, onCancel }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user's chat data
      const chatsQuery = query(collection(db, "chats"), where("userId", "==", user.uid));
      const chatSnapshots = await getDocs(chatsQuery);
      
      for (const chat of chatSnapshots.docs) {
        const messagesQuery = collection(db, "chats", chat.id, "messages");
        const messagesSnapshot = await getDocs(messagesQuery);
        for (const message of messagesSnapshot.docs) {
          await deleteDoc(doc(db, "chats", chat.id, "messages", message.id));
        }
        await deleteDoc(doc(db, "chats", chat.id));
      }

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
    <div className="delete-account-container">
      <h3>Confirm Account Deletion</h3>
      <p>Enter your password to proceed:</p>
      <input 
  type="password" 
  id="delete-account-password"
  placeholder="Password" 
  value={password} 
  onChange={(e) => setPassword(e.target.value)}
/>

      {error && <p className="error-message">{error}</p>}
      <div className="buttons">
        <button onClick={handleDeleteAccount} className="delete-btn">Confirm Delete</button>
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

export default DeleteAccount;
