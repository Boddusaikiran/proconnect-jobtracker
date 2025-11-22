import { useState, useRef, useEffect, useCallback } from "react";
import { AiOutlineRobot } from "react-icons/ai";
import { FaUserCircle, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";

const CHAT_STORAGE_KEY = "customerCareAI_chat";

export default function CustomerCareAI() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string; time: string }[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [darkMode, setDarkMode] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);
    const [isRecording, setIsRecording] = useState(false);
    const [isIdle, setIsIdle] = useState(false);

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    // Draggable button
    const [buttonPos, setButtonPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const buttonDraggingRef = useRef(false);
    const buttonDragOffset = useRef({ x: 0, y: 0 });

    // Draggable chat window
    const [chatPos, setChatPos] = useState({ x: window.innerWidth - 320, y: 100 });
    const chatDraggingRef = useRef(false);
    const chatDragOffset = useRef({ x: 0, y: 0 });

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Idle detection
    useEffect(() => {
        let idleTimer: NodeJS.Timeout;
        const resetIdle = () => {
            clearTimeout(idleTimer);
            setIsIdle(false);
            idleTimer = setTimeout(() => setIsIdle(true), 3000);
        };
        window.addEventListener("mousemove", resetIdle);
        window.addEventListener("keydown", resetIdle);
        resetIdle();
        return () => {
            window.removeEventListener("mousemove", resetIdle);
            window.removeEventListener("keydown", resetIdle);
            clearTimeout(idleTimer);
        };
    }, []);

    useEffect(() => {
        const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        } else {
            setMessages([{
                from: "ai",
                text: "👋 Hello! I'm your AI assistant. How can I help you today?",
                time: getCurrentTime()
            }]);
        }

        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = "en-US";
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsRecording(false);
            };
            recognition.onend = () => setIsRecording(false);
            recognitionRef.current = recognition;
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const sendMessage = async () => {
        if (!input.trim() || isSending) return;

        const userMessage = { from: "user" as const, text: input, time: getCurrentTime() };
        setMessages((prev) => [...prev, userMessage]);
        const messageText = input;
        setInput("");
        setIsSending(true);
        setIsTyping(true);

        try {
            // Use job assistant endpoint if user is authenticated
            const endpoint = user ? "/api/ai/job-assistant" : "/api/ai/chat";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageText }),
                credentials: "include",
            });

            const data = await res.json();
            await new Promise((resolve) => setTimeout(resolve, 800));

            const aiMessage = { from: "ai" as const, text: data.reply || "I am not sure, please try again.", time: getCurrentTime() };
            setMessages((prev) => [...prev, aiMessage]);

            if ("speechSynthesis" in window) {
                const utter = new SpeechSynthesisUtterance(aiMessage.text);
                utter.lang = "en-US";
                window.speechSynthesis.speak(utter);
            }
        } catch (error) {
            console.error("AI assistant error:", error);
            setMessages((prev) => [
                ...prev,
                { from: "ai" as const, text: "Oops! Something went wrong. Try again later.", time: getCurrentTime() },
            ]);
        } finally {
            setIsSending(false);
            setIsTyping(false);
        }
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) return;
        if (isRecording) recognitionRef.current.stop();
        else recognitionRef.current.start();
        setIsRecording(!isRecording);
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem(CHAT_STORAGE_KEY);
    };

    const onButtonMouseDown = (e: React.MouseEvent) => {
        buttonDraggingRef.current = true;
        buttonDragOffset.current = { x: e.clientX - buttonPos.x, y: e.clientY - buttonPos.y };
        e.preventDefault();
    };

    const onChatMouseDown = (e: React.MouseEvent) => {
        chatDraggingRef.current = true;
        chatDragOffset.current = { x: e.clientX - chatPos.x, y: e.clientY - chatPos.y };
        e.preventDefault();
    };

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (buttonDraggingRef.current) {
            setButtonPos({ x: e.clientX - buttonDragOffset.current.x, y: e.clientX - buttonDragOffset.current.y });
        }
        if (chatDraggingRef.current) {
            setChatPos({ x: e.clientX - chatDragOffset.current.x, y: e.clientY - chatDragOffset.current.y });
        }
    }, []);

    const onMouseUp = useCallback(() => {
        buttonDraggingRef.current = false;
        if (chatDraggingRef.current) {
            const padding = 10;
            const x = chatPos.x;
            const y = chatPos.y;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const chatWidth = 320;
            const chatHeight = 480;

            const snapX = x + chatWidth / 2 < windowWidth / 2 ? padding : windowWidth - chatWidth - padding;
            const snapY = y + chatHeight / 2 < windowHeight / 2 ? padding : windowHeight - chatHeight - padding;

            setChatPos({ x: snapX, y: snapY });
        }
        chatDraggingRef.current = false;
    }, [chatPos]);

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    return (
        <>
            <button
                onMouseDown={onButtonMouseDown}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    left: buttonPos.x,
                    top: buttonPos.y,
                    transition: "opacity 0.3s",
                    opacity: isIdle && !isOpen ? 0.3 : 1,
                }}
                className="fixed z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 cursor-move"
                title="AI Assistant"
            >
                <AiOutlineRobot size={24} />
            </button>

            {isOpen && (
                <div
                    style={{ left: chatPos.x, top: chatPos.y, width: 320, height: 480 }}
                    className={`fixed border shadow-xl z-50 flex flex-col rounded-lg ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
                >
                    <div
                        onMouseDown={onChatMouseDown}
                        className={`p-4 font-semibold flex justify-between items-center rounded-t-lg cursor-move ${darkMode ? "bg-gray-800" : "bg-blue-600 text-white"}`}
                    >
                        {user ? "Smart Job Assistant" : "AI Assistant"}
                        <div className="flex gap-2">
                            <button onClick={clearChat} title="Clear Chat" className="hover:text-gray-200 font-bold">🗑️</button>
                            <button onClick={() => setIsOpen(false)} className="font-bold hover:text-gray-200">✕</button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-2">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex items-end gap-2 max-w-full ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.from === "ai" && <AiOutlineRobot size={24} className={darkMode ? "text-blue-400" : "text-blue-600"} />}
                                {msg.from === "user" && <FaUserCircle size={24} className={darkMode ? "text-gray-400" : "text-gray-500"} />}
                                <div className={`p-2 rounded-md break-words max-w-[70%] ${msg.from === "user" ? (darkMode ? "bg-blue-700 text-white" : "bg-blue-100") : (darkMode ? "bg-gray-800 text-white" : "bg-gray-100")}`}>
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                    <div className="text-xs text-gray-400 text-right mt-1">{msg.time}</div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2 max-w-[70%]">
                                <AiOutlineRobot size={24} className={darkMode ? "text-blue-400" : "text-blue-600"} />
                                <div className={`p-2 rounded-md flex items-center gap-1 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></span>
                                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                                    <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef}></div>
                    </div>

                    {user && (
                        <div className={`px-4 py-2 border-t flex flex-wrap gap-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                            <button
                                onClick={() => { setInput("What's due this week?"); setTimeout(() => sendMessage(), 100); }}
                                className={`px-3 py-1 text-xs rounded-md transition ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                            >
                                ⏰ Deadlines
                            </button>
                            <button
                                onClick={() => { setInput("Show my applied jobs"); setTimeout(() => sendMessage(), 100); }}
                                className={`px-3 py-1 text-xs rounded-md transition ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                            >
                                🎯 Applied
                            </button>
                            <button
                                onClick={() => { setInput("Show my summary"); setTimeout(() => sendMessage(), 100); }}
                                className={`px-3 py-1 text-xs rounded-md transition ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
                            >
                                📊 Analytics
                            </button>
                        </div>
                    )}

                    <div className={`p-4 border-t flex gap-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your message..."
                            className={`flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode ? "bg-gray-800 text-white border-gray-700 placeholder-gray-400" : "bg-white text-gray-900 border-gray-300"}`}
                        />
                        <button
                            onClick={toggleRecording}
                            title={isRecording ? "Stop Recording" : "Start Voice Input"}
                            className={`px-3 rounded-md text-white ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}`}
                        >
                            {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        </button>
                        <button
                            onClick={sendMessage}
                            disabled={isSending}
                            className={`px-4 rounded-md text-white transition ${isSending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {isSending ? "..." : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
