"use client";

import { useState } from "react";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "bot", text: "Hello! 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    // Simple automated response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Thank you for your message! An admin will get back to you soon. 😊" },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 p-4 text-white">
            <h3 className="font-bold">AF-NEXUS Assistant</h3>
            <p className="text-xs opacity-80">Always here to help</p>
          </div>
          <div className="p-4 h-64 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm max-w-[80%] ${
                  msg.sender === "bot"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-blue-100 text-blue-700 ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <button
              onClick={handleSend}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg hover:bg-blue-700 transition"
      >
        {isOpen ? "✖" : "💬"}
      </button>
    </div>
  );
}