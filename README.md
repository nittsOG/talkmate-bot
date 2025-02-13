# 🚀 TalkMate AI Chatbot

TalkMate is an AI-powered chatbot that allows users to have seamless conversations. Built using **React + Vite** with **Firebase Authentication and Firestore**, it provides a smooth and interactive chat experience.

---

## 🌟 Features

- 🔐 **User Authentication** (Login/Signup with Firebase)
- 💬 **Chat with AI** (Powered by the Gemini API)
- 🕘 **Chat History Persistence** (Stored using Firebase Firestore)
- 🌙 **Dark & Light Mode Toggle**
- 📌 **New Chat Creation**
- 🗑️ **Account Deletion**
- 📜 **Session Continuity** (Chats remain in the sidebar)
- 🔄 **Auto New Chat Creation** (If no session exists)
- 🎨 **UI Inspired by ChatGPT** (For a familiar experience)

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **AI Model**: Gemini API
- **Hosting**: Firebase Hosting (or any preferred method)

---

## 🚀 Getting Started

### 📦 1. Clone the Repository

```sh
git clone [https://github.com/yourusername/TalkMate.git](https://github.com/yourusername/TalkMate.git)
cd TalkMate
```

### ⚙️ 2. Install Dependencies

```sh
npm install
```

### 🔑 3. Set Up Firebase

1. Create a **Firebase Project** in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Firestore Database**.
4. Get Firebase **Config Credentials** and create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_GEMINI_API_KEY=
```

### ▶️ 4. Run the Project

```sh
npm run dev
```

Now open `http://localhost:5173` in your browser to use TalkMate!

---

## 📷 Screenshots

### 🔑 Login Page

![image](https://github.com/user-attachments/assets/cce31eb8-ff47-4601-ad3e-b19f7559240b)



### 🆕 Signup Page

![image](https://github.com/user-attachments/assets/ac227967-8f88-4379-bc10-b7d30b39c15f)



### 💬 Chat Interface

#### 🌞 Light Mode
![image](https://github.com/user-attachments/assets/29adf616-96b2-43ca-8e91-aa7ad3d38045)



### 👤 Profile Page



#### 🌙 Dark Mode
![image](https://github.com/user-attachments/assets/31b0abd2-cbd9-4b60-8324-6a362558193f)


---

## 📌 Folder Structure

```
📂 TalkMate
│── 📂 src
│   ├── 📂 components  # Reusable UI components
│   ├── 📂 pages       # Login, Chat pages
│   ├── 📂 styles      # CSS files
│   ├── firebaseConfig.js  # Firebase setup
│   ├── App.jsx        # Main App Component
│   ├── main.jsx       # Entry point
│── 📂 public          # Static assets
│── .env               # Environment variables
│── package.json       # Dependencies & scripts
│── README.md          # Project Documentation
```

---

## 🌍 Deployment (Firebase Hosting)

To deploy the project on **Firebase Hosting**:

```sh
npm run build
firebase deploy
```

---

## 📜 License

This project is licensed under the **MIT License**.

---

## ✨ Contributing

Feel free to **fork** this repository, make improvements, and submit a **pull request**.

---

## 📞 Contact

💌 If you have any questions, reach out to me at **[your.email@example.com](mailto:naitikbarot1677@gmail.com)**
🔗 GitHub: [github.com/yourusername](https://github.com/nittsOG)

