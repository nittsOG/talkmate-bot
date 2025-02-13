import React, { useState, useEffect, useRef } from "react";
import "../styles/Chat.css";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, addDoc, query, orderBy, where } from "firebase/firestore";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Chat({ user }) {
  const [queryInput, setQueryInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const chatEndRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, [user.uid]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  const handleNewChat = async () => {
    try {
      const newChatRef = await addDoc(collection(db, "chats"), {
        userId: user.uid,
        createdAt: new Date(),
      });

      const newSession = { id: newChatRef.id, createdAt: new Date() };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newChatRef.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSubmit = async () => {
    if (!queryInput.trim()) return;
    setIsGenerating(true);
    
    try {
      let sessionId = currentSession;
      if (!sessionId) {
        const newChatRef = await addDoc(collection(db, "chats"), {
          userId: user.uid,
          createdAt: new Date(),
        });
        sessionId = newChatRef.id;
        setCurrentSession(sessionId);
        setSessions(prev => [{ id: sessionId, createdAt: new Date() }, ...prev]);
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
      console.error("❌ Error generating response:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
  sessions={sessions} 
  onNewChat={handleNewChat} 
  onSelectSession={loadChat} 
  refreshSessions={fetchSessions} // ✅ Fix refresh issue
/>

      <div className="chat-section"> 
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index}>
              <div className="message-bubble user">
                <p><strong><h3>You :</h3></strong> {msg.userQuery}</p>
              </div>
              <div className="message-bubble ai">
                <p><strong><h3>AI :</h3></strong> {msg.aiResponse}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="query-container">
          <textarea
            ref={textAreaRef}
            className="MsgInput"
            placeholder="Type your message..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows="1"
          />
          <button className="sendButton" onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
