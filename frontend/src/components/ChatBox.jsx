import { useEffect, useRef, useState } from "react";

export default function ChatBox({ messages, onSend, disabled = false }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const send = () => {
    const value = text.trim();
    if (!value || disabled) return;

    onSend(value);
    setText("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="mx-auto flex h-[650px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white">
        <h2 className="text-xl font-bold">Support Chat</h2>
        <p className="mt-1 text-sm text-indigo-100">
          Ask your question. Our bot or agent will help you.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-5 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-100 text-3xl">
                💬
              </div>
              <p className="text-lg font-semibold text-slate-800">
                Start a conversation
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Type your message below.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.sender === "user";

            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "rounded-br-sm bg-indigo-600 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {!isUser && (
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      {m.sender || "bot"}
                    </p>
                  )}
                  <p>{m.text}</p>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            disabled={disabled}
            placeholder="Type your message..."
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
          />

          <button
            onClick={send}
            disabled={disabled}
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}