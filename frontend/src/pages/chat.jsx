import { useEffect, useMemo, useState } from "react";
import socket from "../socket/socket";
import API from "../api";
import { generateSession } from "../utils/generateSession";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [closed, setClosed] = useState(false);

  const sessionId = useMemo(() => generateSession(), []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_room", { sessionId });

    API.get(`/chat/history/${sessionId}`)
      .then((res) => {
        setMessages(res.data.messages || []);
        setClosed(res.data.status === "closed");
      })
      .catch(() => {
        setMessages([]);
      });

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleClosed = (data) => {
      setClosed(true);
      alert(data.message);
    };

    const handleMessageError = (data) => {
      alert(data.message || "Message failed");
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("conversation_closed", handleClosed);
    socket.on("message_error", handleMessageError);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("conversation_closed", handleClosed);
      socket.off("message_error", handleMessageError);
    };
  }, [sessionId]);

  const send = async (text) => {
    const userMsg = {
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await API.post("/chat/message", {
        message: text,
        sessionId,
      });

      const botMsg = {
        sender: "bot",
        text: res.data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.data.agentAssigned) {
        socket.emit("join_room", { sessionId });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: err.response?.data?.message || "Something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <ChatBox messages={messages} onSend={send} disabled={closed} />
      </main>
    </div>
  );
}