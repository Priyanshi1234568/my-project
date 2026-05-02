import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Agent from "./pages/Agent";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* ✅ ADD THIS */}

        <Route path="/chat" element={
          <ProtectedRoute role="user">
            <Chat />
          </ProtectedRoute>
        }/>

        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Admin />
          </ProtectedRoute>
        }/>

        <Route path="/agent" element={
          <ProtectedRoute role="agent">
            <Agent />
          </ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  );
}