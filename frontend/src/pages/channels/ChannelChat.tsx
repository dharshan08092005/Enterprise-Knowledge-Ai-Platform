import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { getChannelMessages } from "../../services/channelService";
import { format } from "date-fns";
import { Send, Hash, BrainCircuit, Loader2, Sparkles, BookOpen } from "lucide-react";

interface Message {
    _id: string;
    senderId?: { _id: string; firstName: string; lastName: string };
    isBot: boolean;
    content: string;
    sources?: { documentId: string; score: number }[];
    createdAt: string;
}

const ChannelChat: React.FC = () => {
    const { channelId } = useParams<{ channelId: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentUserStr = localStorage.getItem("user");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!channelId || !token) return;

        // 1. Fetch History
        const fetchHistory = async () => {
            try {
                const history = await getChannelMessages(channelId);
                setMessages(history);
                scrollToBottom();
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };
        fetchHistory();

        // 2. Initialize Socket
        const socket = io("http://localhost:5000", {
            auth: { token }
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join_channel", channelId);
        });

        socket.on("receive_message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
        });

        socket.on("bot_typing", (data: { isTyping: boolean }) => {
            setIsBotTyping(data.isTyping);
            scrollToBottom();
        });

        socket.on("error", (err: any) => {
            console.error("Socket error:", err.message);
        });

        return () => {
            socket.emit("leave_channel", channelId);
            socket.disconnect();
        };
    }, [channelId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit("send_message", {
            channelId,
            content: newMessage,
        });

        setNewMessage("");
    };

    return (
        <div className="flex flex-col h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] overflow-hidden -m-6 relative">
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-10 flex border-t-0 shadow-sm border-l-0">
                <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Hash className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                           Channel Collaboration
                           <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">Enterprise RAG</span>
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Discuss with peers, or summon @KnowledgeBot anytime.</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth space-y-6 flex flex-col pt-0 mt-4 custom-scrollbar pattern-cross pattern-gray-100 dark:pattern-gray-900 pattern-size-4 pattern-opacity-40">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto p-8 opacity-60">
                         <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                             <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                         </div>
                         <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Start the conversation</h3>
                         <p className="text-sm text-gray-500 mt-2">Team channel initialized securely. Type <span className="text-blue-600 dark:text-blue-400 font-mono font-bold bg-blue-50 dark:bg-blue-900/30 px-1 py-0.5 rounded">@KnowledgeBot</span> to ask AI questions based on your restricted data.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId?._id === currentUser?.userId;
                        
                        // Human Chat Block
                        if (!msg.isBot) {
                            return (
                                <div key={msg._id || index} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 px-1 flex gap-2">
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                                                {isMe ? "You" : `${msg.senderId?.firstName || 'User'} ${msg.senderId?.lastName || ''}`}
                                            </span>
                                            {format(new Date(msg.createdAt), "p")}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed relative group ${
                                            isMe 
                                                ? "bg-gradient-to-tr from-blue-600 to-blue-500 text-gray-900 dark:text-white rounded-tr-none" 
                                                : "bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none"
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Knowledge Bot Response
                        return (
                            <div key={msg._id || index} className="flex justify-start w-full">
                                <div className="max-w-[85%] flex gap-4">
                                    <div className="flex-none pt-1">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                            <BrainCircuit className="w-4 h-4 text-gray-900 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-2 mb-1.5 px-0.5">
                                            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                                                KnowledgeBot
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded-md">
                                                Enterprise RAG
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                {format(new Date(msg.createdAt), "p")}
                                            </span>
                                        </div>
                                        
                                        <div className="p-5 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-4">
                                            <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                {msg.content}
                                            </div>
                                            
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-2 pt-3 border-t border-gray-50 dark:border-white/5">
                                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
                                                        <BookOpen className="w-3.5 h-3.5" /> Cited Sources
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.sources.map((src, i) => (
                                                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-lg">
                                                                <span className="text-[10px] font-mono text-blue-500 truncate max-w-[120px]">
                                                                    doc_{src.documentId.substring(src.documentId.length - 6)}
                                                                </span>
                                                                <span className="text-[9px] px-1.5 bg-green-100/50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-sm">
                                                                    {Math.round(src.score * 100)}% Match
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                
                {isBotTyping && (
                    <div className="flex justify-start w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
                         <div className="max-w-[85%] flex gap-4">
                             <div className="flex-none pt-1">
                                 <div className="w-8 h-8 flex items-center justify-center">
                                     <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                 </div>
                             </div>
                             <div className="flex flex-col flex-1 pl-1">
                                <span className="text-xs text-blue-500 font-medium tracking-wide">KnowledgeBot is synthesizing documents...</span>
                             </div>
                         </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} className="h-4 w-full flex-none" />
            </div>

            {/* Input Form */}
            <div className="flex-none p-4 md:p-6 bg-white dark:bg-[#0A0A0A] border-t border-gray-100 dark:border-white/10 z-10 w-full lg:max-w-4xl lg:mx-auto">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message channel or tag @KnowledgeBot..."
                        className="w-full bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:ring-2 ring-blue-500 border border-gray-200/50 dark:border-white/5 transition-all shadow-sm"
                        disabled={isBotTyping}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isBotTyping}
                        className="absolute right-2 p-2 bg-blue-600 text-gray-900 dark:text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChannelChat;
