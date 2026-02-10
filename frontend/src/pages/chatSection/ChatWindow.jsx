import React, { useRef, useState, useEffect } from "react";
import useThemeStore from "../../store/themeStore";
import useUserStore from "../../store/useUserStore";
import { useChatStore } from "../../store/chatStore";
import { isValid, isToday, isYesterday, format } from 'date-fns';
import emptyWindowImage from '../../images/_image_use.png'
import { FaArrowLeft, FaLock, FaTimes,FaBriefcase,FaGamepad } from "react-icons/fa";
import MessageBubble from './MessageBubble';
import { analyzeToxicity } from "../../services/toxicityApi";

const ChatWindow = ({ selectedContact, setSelectedContact }) => {
  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const { conversations, fetchMessages, fetchConversations, messages, sendMessage, isUserTyping, isUserOnline, getUserLastSeen, startTyping, stopTyping, resetMessages } = useChatStore();
  const [environment, setEnvironment] = useState("OFFICE"); // "OFFICE" or "GAMING"

  useEffect(() => {
    if (selectedContact?._id) {
      // Only try to find conversation if we have checking data
      const conversationData = conversations?.data || [];
      const conversation = conversationData.find(c =>
        c.participants.some(p => p._id === selectedContact._id)
      );

      if (conversation) {
        fetchMessages(conversation._id);
      } else {
        resetMessages();
      }
    }
  }, [selectedContact, conversations, fetchMessages, resetMessages]);

  // --- Logic from "My File" ---
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  // const USE_MOCK = true;
  // const ws = useRef(null);

  // --- Logic from "Other's File" ---
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);

  const online = isUserOnline(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);
  const isTyping = isUserTyping(selectedContact?._id);

  // WebSocket / Mock Setup
  // useEffect(() => {
  //   if (USE_MOCK) {
  //     ws.current = {
  //       send: (data) => {
  //         const parsed = JSON.parse(data);
  //         setTimeout(() => simulateBackendResponse(parsed.text), 600);
  //       },
  //     };
  //   } else {
  //     ws.current = new WebSocket("ws://localhost:5000");
  //     ws.current.onmessage = (event) => setAnalysisResult(JSON.parse(event.data));
  //     return () => ws.current.close();
  //   }
  // }, []);

  // const simulateBackendResponse = (message) => {
  //   let level;
  //   let suggestion;
  //   const msgLower = message.toLowerCase();
  //   const criticalWords = ["stupid", "silly", "poor", "donkey", "monkey", "rubbish", "mental"];
  //   const mediumWords = ["idiot", "hate", "mad", "crazy"];

  //   if (criticalWords.some((w) => msgLower.includes(w))) {
  //     level = "Critical";
  //     suggestion = "Please communicate respectfully.";
  //   } else if (mediumWords.some((w) => msgLower.includes(w))) {
  //     level = "Medium";
  //     suggestion = "Try using more professional language.";
  //   } else {
  //     level = "Easy";
  //     suggestion = message;
  //   }

  //   setAnalysisResult({ level, suggested_message: suggestion, original_message: message });
  // };

  // const analyzeMessage = () => {
  //   if (!text.trim()) return;
  //   ws.current.send(JSON.stringify({ text, sender: user?.username }));
  // };

  const analyzeMessage = async () => {
    if (!text.trim()) return;

    try {
      const result = await analyzeToxicity({
        message: text,
        senderId: user?._id,
        receiverId: selectedContact?._id,
      });

      setAnalysisResult(result);
    } catch (error) {
      console.error("Toxicity analysis failed:", error);
    }
  };


  // Final Send Function
  const handleFinalSend = async (messageContent) => {
    if (!selectedContact || !messageContent.trim()) return;

    try {
      const formData = new FormData();
      formData.append("senderId", user?._id);
      formData.append("receiverId", selectedContact?._id);
      formData.append("messageStatus", online ? "delivered" : "send");
      formData.append("content", messageContent.trim());

      if (selectedFile) {
        formData.append("media", selectedFile, selectedFile.name);
      }

      await sendMessage(formData);

      // Reset states
      setText("");
      setAnalysisResult(null);
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error("failed to send message", error);
    }
  };

  // Dynamic Border Style
  const getBorderStyle = () => {
    if (!analysisResult) return theme === "dark" ? "2px solid #374151" : "2px solid #e5e7eb";
    if (analysisResult.level === "Easy") return "2px solid #10b981";
    if (analysisResult.level === "Medium") return "2px solid #facc15";
    if (analysisResult.level === "Critical") return "2px solid #ef4444";
    return "2px solid gray";
  };

  // Helper: Grouping & Date Logic (kept from other's file)
  const groupedMessages = Array.isArray(messages) ? messages.reduce((acc, message) => {
    if (!message.createdAt) return acc;
    const dateString = format(new Date(message.createdAt), "yyyy-MM-dd");
    if (!acc[dateString]) acc[dateString] = [];
    acc[dateString].push(message);
    return acc;
  }, {}) : {};

  if (!selectedContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen text-center">
        <img src={emptyWindowImage} alt="chat-app" className="w-64 mb-4" />
        <h2 className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>Select a contact to start</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen w-full flex flex-col">
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${theme === "dark" ? "bg-[#303430] text-white" : "bg-zinc-100 text-gray-600"}`}>
        <div className="flex items-center">
          <button onClick={() => setSelectedContact(null)} className="mr-3"><FaArrowLeft size={20} /></button>
          <img src={selectedContact?.profilePicture} className="w-10 h-10 rounded-full" alt="profile" />
          <div className="ml-3">
            <h2 className="font-semibold">{selectedContact?.username}</h2>
            <p className="text-xs">{isTyping ? "Typing..." : online ? "Online" : "Offline"}</p>
          </div>
        </div>
        {/* Modern Toggle Button */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold transition-colors duration-300 ${environment === "OFFICE" ? (theme === "dark" ? "text-blue-400" : "text-blue-600") : (theme === "dark" ? "text-gray-400" : "text-gray-500")}`}>
            OFF
          </span>
          
          <div className={`relative inline-flex items-center h-10 w-20 rounded-full shadow-lg transition-all duration-300 cursor-pointer ${environment === "OFFICE" ? (theme === "dark" ? "bg-gradient-to-r from-blue-600 to-blue-500" : "bg-gradient-to-r from-blue-500 to-blue-400") : (theme === "dark" ? "bg-gradient-to-r from-purple-600 to-pink-500" : "bg-gradient-to-r from-purple-500 to-pink-400")}`} onClick={() => setEnvironment(environment === "OFFICE" ? "GAMING" : "OFFICE")}>
            {/* Toggle Indicator */}
            <div className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center text-sm font-bold ${environment === "OFFICE" ? "translate-x-0 text-blue-600" : "translate-x-10 text-purple-600"}`}>
              {environment === "OFFICE" ? <FaBriefcase size={14} /> : <FaGamepad size={14} />}
            </div>
          </div>

          <span className={`text-xs font-bold transition-colors duration-300 ${environment === "GAMING" ? (theme === "dark" ? "text-purple-400" : "text-purple-600") : (theme === "dark" ? "text-gray-400" : "text-gray-500")}`}>
            GAM
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 p-4 overflow-y-auto ${theme === "dark" ? "bg-[#191a1a]" : "bg-[#f1ece5]"}`}>
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <React.Fragment key={date}>
            <div className="flex justify-center my-4">
              <span className="text-xs px-3 py-1 bg-gray-500/20 rounded-full">{date}</span>
            </div>
            {msgs.map((msg) => (
              <MessageBubble key={msg._id} message={msg} theme={theme} currentUser={user} />
            ))}
          </React.Fragment>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area with Toxicity Analysis */}
      <div className={`p-4 border-t ${theme === "dark" ? "bg-[#303430] border-gray-700" : "bg-white border-gray-200"}`}>

        {/* Analysis Feedback UI */}
        {analysisResult && (
          <div className={`mb-3 p-3 rounded-lg border ${theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-gray-50 text-black border-gray-300"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm"><b>Toxicity Level:</b> {analysisResult.level}</span>
              <button onClick={() => setAnalysisResult(null)}><FaTimes size={12} /></button>
            </div>

            {analysisResult.level === "Critical" && (
              <div className="mt-2 text-red-500 font-bold text-sm">
                Your message is too critical. Please rewrite it to be more respectful.
              </div>
            )}

            {analysisResult.level === "Medium" && (
              <div className="mt-2">
                <p className="text-sm italic"><b>Suggestion:</b> {analysisResult.suggested_message}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleFinalSend(text)}
                    className="bg-gray-500 text-white text-xs px-3 py-1.5 rounded hover:bg-gray-600"
                  >
                    Send As It Is
                  </button>
                  <button
                    onClick={() => handleFinalSend(analysisResult.suggested_message)}
                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700"
                  >
                    Use Suggested
                  </button>
                </div>
              </div>
            )}

            {analysisResult.level === "Easy" && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-green-500 text-sm font-medium">Message looks good!</span>
                <button
                  onClick={() => handleFinalSend(text)}
                  className="bg-green-600 text-white text-xs px-4 py-1.5 rounded hover:bg-green-700"
                >
                  Send Message
                </button>
              </div>
            )}
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (analysisResult?.level === "Critical") setAnalysisResult(null);
          }}
          style={{ border: getBorderStyle(), outline: 'none' }}
          className={`w-full p-3 rounded-xl transition-all resize-none min-h-[80px] ${theme === "dark" ? "bg-[#191a1a] text-white placeholder-gray-500" : "bg-gray-100 text-black placeholder-gray-400"}`}
          placeholder="Type your message..."
        />
       

        {/* Action Button */}
        <button
          onClick={analyzeMessage}
          disabled={!text.trim() || (analysisResult && analysisResult.level === "Critical")}
          className={`mt-2 w-full py-2.5 rounded-lg font-semibold transition-all ${!text.trim() || (analysisResult && analysisResult.level === "Critical")
            ? "bg-gray-400 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:opacity-90"
            }`}
        >
          {analysisResult?.level === "Critical" ? "Message Blocked" : "Analyze Message"}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;