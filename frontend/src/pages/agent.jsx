import { useEffect, useState } from "react";
import API from "../api";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";

export default function Agent() {
  const { auth } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [available, setAvailable] = useState(false);

  const loadChats = async () => {
    try {
      const res = await API.get("/agent/my-chats");
      setChats(res.data.conversations || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load chats");
    }
  };

  const loadProfile = async () => {
    try {
      const res = await API.get("/agent/profile");
      setAvailable(Boolean(res.data?.isAvailable));
    } catch {
      setAvailable(false);
    }
  };

  useEffect(() => {
    loadChats();
    loadProfile();
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("agent_join", {
      sessionId: activeChat.sessionId,
      agentName: auth?.user?.name || "Agent",
    });

    setMessages(activeChat.messages || []);

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [activeChat, auth?.user?.name]);

  const toggleAvailability = async () => {
    try {
      const res = await API.put("/agent/availability");
      setAvailable(res.data.isAvailable);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update availability");
    }
  };

  const send = (text) => {
    if (!activeChat) return;

    socket.emit("send_message", {
      sessionId: activeChat.sessionId,
      sender: "agent",
      text,
    });
  };

  const closeConversation = async () => {
    if (!activeChat) return;

    try {
      await API.put(`/chat/close/${activeChat.sessionId}`);
      alert("Conversation closed");
      setActiveChat(null);
      setMessages([]);
      loadChats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close conversation");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Agent Dashboard</h2>
            <p className="mt-2 text-slate-500">Reply to assigned customer conversations.</p>
          </div>

          <button
            onClick={toggleAvailability}
            className={`rounded-2xl px-5 py-3 text-sm font-black text-white ${
              available ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-700 hover:bg-slate-800"
            }`}
          >
            {available ? "Available" : "Unavailable"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-black text-slate-900">My Chats</h3>

            {chats.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                No assigned chats.
              </p>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      activeChat?._id === chat._id
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-sm font-black text-slate-900">
                      {chat.userId?.name || "Guest User"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {chat.messages?.at(-1)?.text || chat.sessionId}
                    </p>
                    <p className="mt-2 text-xs font-bold capitalize text-indigo-600">
                      {chat.status}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            {activeChat ? (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={closeConversation}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
                  >
                    Close Conversation
                  </button>
                </div>

                <ChatBox messages={messages} onSend={send} />
              </>
            ) : (
              <div className="flex h-[650px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-100 text-3xl">
                    🎧
                  </div>
                  <p className="text-lg font-black text-slate-900">Select a chat</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose a conversation from the left panel.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}