import React, { useState, useEffect } from "react";
import "./App.css";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./Login";

import { db } from "./firebaseConfig";  // Ensure db is imported
import { collection, getDocs, addDoc } from "firebase/firestore";  

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Add loading state for authentication
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch the user's chat history from Firestore
        const chatsCollection = collection(db, "chats");
        const querySnapshot = await getDocs(chatsCollection);
        const chats = querySnapshot.docs
          .filter(doc => doc.data().userId === currentUser.uid)  // Ensure filtering by user ID
          .map(doc => doc.data());

        // Sort chats by timestamp to display in the correct order
        const sortedChats = chats.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
        setMessages(sortedChats);  // Set the sorted chat history in the state
      }

      setLoading(false);  // Once Firebase is ready, set loading to false
    });

    return () => unsubscribe();  // Cleanup the listener when the component is unmounted
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsGenerating(true);  // Set generating state true while generating the response

    try {
      const apiKey = "AIzaSyDNLBSL0nAenr0dSJNgfNNg8NTnELzHlE8";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            parts: [{ text: query }],
          },
        ],
      };

      const result = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await result.json();
      console.log("API Response:", data);
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

      const pointWiseResponse = generatedText
        .split("\n")
        .filter((line) => line.trim())
        .map((line, index) => `${index + 1}. ${line.trim()}`)
        .join("\n");

      // Update the messages state immediately
      setMessages((prev) => [
        { userQuery: query, aiResponse: pointWiseResponse },
        ...prev  // Add the new message at the top
      ]);
      setQuery("");  // Reset the input field

      // Save the chat history to Firestore
      if (user) {
        await addDoc(collection(db, "chats"), {
          userId: user.uid,
          userQuery: query,
          aiResponse: pointWiseResponse,
          timestamp: new Date(),
        });
      }

    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        { userQuery: query, aiResponse: "An error occurred. Please try again." },
      ]);
    } finally {
      setIsGenerating(false);  // Set generating state false after generating the response
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  // Show loading spinner or login page while Firebase is determining authentication state
  if (loading) {
    return <div>Loading...</div>;  // You can customize this with a loader
  }

  return (
    <div className="app-container">
      {user ? (
        <>
          <h1>AI Content Generator</h1>
          <p>Welcome, {user.email}!</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>

          <div className="query-container">
            <textarea
              placeholder="Enter your query here..."
              value={query}
              onChange={handleQueryChange}
              className="query-input"
            ></textarea>
            <div className="button-container">
              <button onClick={handleSubmit} className="submit-button" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate"}
              </button>
              <button onClick={handleClear} className="clear-button">
                Clear
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className="message-box">
                <p><strong>User:</strong> {msg.userQuery}</p>
                <pre><strong>AI:</strong> {msg.aiResponse}</pre>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
