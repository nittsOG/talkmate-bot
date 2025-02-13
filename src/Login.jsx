import React, { useState } from "react";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");  // For signup only
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getFriendlyErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/invalid-email": "Invalid email format. Please enter a valid email.",
      "auth/user-not-found": "No account found with this email. Please sign up.",
      "auth/invalid-credential": "Invalid credentials. Please try again.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/email-already-in-use": "This email is already registered. Try logging in.",
      "auth/weak-password": "Password must be at least 6 characters long.",
      "auth/too-many-requests": "Too many failed attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Check your internet connection.",
    };
  
    return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
  };
  

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match!");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/chat"); // Redirect after login/signup
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code)); // Use friendly error messages
    }
  };
  

  return (
    <div className="login-page">
      {/* Left Side - Introduction */}
      <div className="login-intro">
        <h1>Welcome to TalkMate</h1>
        <p>Your AI-powered chatbot for seamless conversations.</p>
        <p>Sign in or create an account to start chatting.</p>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-container">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
          {error && <p className="error">{error}</p>}
        </form>
        <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create an account" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;
