import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import DeleteAccount from "./DeleteAccount"; // ✅ Import DeleteAccount Component
import "../styles/ProfileMenu.css";

const ProfileMenu = ({ user, refreshSessions }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

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
        await refreshSessions(); // Ensure session list refreshes after clearing
      }

      alert("✅ All data cleared successfully!");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      alert("Failed to clear data. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      {/* ✅ Updated Profile Button Design */}
      <button className="button" onClick={toggleMenu}>
        <svg className="svg-icon" fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
          <g stroke="white" strokeLinecap="round" strokeWidth="1.5">
            <circle cx="10" cy="10" r="2.5"></circle>
            <path
              clipRule="evenodd"
              d="m8.39079 2.80235c.53842-1.51424 2.67991-1.51424 3.21831-.00001.3392.95358 1.4284 1.40477 2.3425.97027 1.4514-.68995 2.9657.82427 2.2758 2.27575-.4345.91407.0166 2.00334.9702 2.34248 1.5143.53842 1.5143 2.67996 0 3.21836-.9536.3391-1.4047 1.4284-.9702 2.3425.6899 1.4514-.8244 2.9656-2.2758 2.2757-.9141-.4345-2.0033.0167-2.3425.9703-.5384 1.5142-2.67989 1.5142-3.21831 0-.33914-.9536-1.4284-1.4048-2.34247-.9703-1.45148.6899-2.96571-.8243-2.27575-2.2757.43449-.9141-.01669-2.0034-.97028-2.3425-1.51422-.5384-1.51422-2.67994.00001-3.21836.95358-.33914 1.40476-1.42841.97027-2.34248-.68996-1.45148.82427-2.9657 2.27575-2.27575.91407.4345 2.00333-.01669 2.34247-.97026z"
              fillRule="evenodd"
            ></path>
          </g>
        </svg>
        <span className="lable">Account</span>
      </button>

      {menuOpen && (
        <div className="profile-dropdown">
          <p>{user.email}</p>
          <button onClick={handleClearData}>🗑 Clear Data</button>
          <button onClick={() => setShowDeleteModal(true)}>🚨 Delete Account</button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      )}

      {/* ✅ Delete Account Modal (Using DeleteAccount Component) */}
      {showDeleteModal && (
        <DeleteAccount 
          user={user} 
          refreshSessions={refreshSessions} 
          onClose={() => setShowDeleteModal(false)} 
        />
      )}
    </div>
  );
};

export default ProfileMenu;
