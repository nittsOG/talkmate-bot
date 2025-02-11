import React, { useState, useEffect, useRef } from "react";
import "../styles/Chat.css";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, addDoc, query, orderBy, deleteDoc, doc, where } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function Chat({ user }) {
  const [queryInput, setQueryInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [user.uid]);

  const fetchSessions = async () => {
    try {
      const sessionCollection = collection(db, "chats");
      const sessionQuery = query(sessionCollection, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const sessionSnapshot = await getDocs(sessionQuery);

      const sessionList = sessionSnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setSessions(sessionList);
      if (sessionList.length > 0) {
        loadChat(sessionList[0].id);
      } else {
        setMessages([]);
        setCurrentSession(null);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const loadChat = async (sessionId) => {
    try {
      setCurrentSession(sessionId);
      const messagesRef = collection(db, "chats", sessionId, "messages");
      const messageQuery = query(messagesRef, orderBy("timestamp", "asc"));
      const messageSnapshot = await getDocs(messageQuery);

      const messageList = messageSnapshot.docs.map(doc => ({
        id: doc.id,
        userQuery: doc.data().userQuery,
        aiResponse: doc.data().aiResponse,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));

      setMessages(messageList);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const startNewChat = async () => {
    try {
      const newChatRef = await addDoc(collection(db, "chats"), {
        userId: user.uid,
        createdAt: new Date(),
      });

      setSessions(prev => [{ id: newChatRef.id, createdAt: new Date() }, ...prev]);
      setMessages([]);
      setCurrentSession(newChatRef.id);
    } catch (error) {
      console.error("Error creating new chat session:", error);
    }
  };

  const handleSubmit = async () => {
    if (!queryInput.trim()) return;
    setIsGenerating(true);

    try {
      let sessionId = currentSession;

      if (!sessionId) {
        await startNewChat();
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const payload = { contents: [{ parts: [{ text: queryInput }] }] };

      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await result.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

      const userMessage = { userQuery: queryInput, aiResponse: generatedText, timestamp: new Date() };

      await addDoc(collection(db, "chats", sessionId, "messages"), userMessage);

      setMessages(prev => [...prev, userMessage]);
      setQueryInput("");
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearUserData = async () => {
    try {
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

      setSessions([]);
      setMessages([]);
      setCurrentSession(null);
      await fetchSessions();
      window.location.reload();
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  };

  const deleteAccount = async () => {
    try {
      await clearUserData();
      await deleteUser(auth.currentUser);
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="app-container">
      <Sidebar sessions={sessions} onNewChat={startNewChat} onSelectSession={loadChat} refreshSessions={fetchSessions} />
      <div className="chat-section">
        <Navbar user={user} onClearData={clearUserData} onDeleteAccount={deleteAccount} refreshSessions={fetchSessions} />
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className="message-bubble">
              <div className="user-message"><p><strong>You:</strong> {msg.userQuery}</p></div>
              <div className="ai-message"><p><strong>AI:</strong> {msg.aiResponse || "Waiting for response..."}</p></div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="query-container">
          <textarea placeholder="Enter your query..." value={queryInput} onChange={(e) => setQueryInput(e.target.value)}></textarea>
          <button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
