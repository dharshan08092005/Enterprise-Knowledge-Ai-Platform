import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  IconSend,
  IconHistory,
  IconSparkles,
  IconFileText,
  IconExternalLink,
  IconClock,
  IconTrash,
  IconPlus,
  IconChevronRight,
  IconChevronLeft,
  IconSearch,
  IconCopy,
  IconCheck,
  IconDownload,
  IconBookmark,
  IconDotsVertical,
  IconX,
  IconLoader2,
  IconRobot,
  IconUser,
  IconFile,
  IconWorld,
  IconFileTypePdf,
  IconFileTypeDoc,
  IconLink,
  IconRefresh,
} from "@tabler/icons-react";
import {
  sendChatQuery,
  getChatSessions,
  getChatSessionById,
  deleteChatSessionById,
  type ChatSessionSummary,
} from "../../services/chatService";
import { viewDocument } from "../../services/documentService";
import { getToken } from "../../lib/auth";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface Source {
  id: string;
  title: string;
  type: "pdf" | "doc" | "webpage" | "database";
  excerpt: string;
  page?: number;
  url?: string;
  relevance: number;
}

// Helper function
const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 1000 * 60) return "Just now";
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
  if (diff < 1000 * 60 * 60 * 24 * 7) return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d ago`;
  return date.toLocaleDateString();
};

// Source Icon Component
const SourceIcon = ({ type }: { type: Source["type"] }) => {
  const icons = {
    pdf: <IconFileTypePdf className="w-5 h-5 text-red-400" />,
    doc: <IconFileTypeDoc className="w-5 h-5 text-blue-400" />,
    webpage: <IconLink className="w-5 h-5 text-blue-400" />,
    database: <IconFile className="w-5 h-5 text-emerald-400" />,
  };
  return icons[type];
};

// Source Card Component
const SourceCard = ({ source, onView }: { source: Source; onView: (source: Source) => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(source.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="p-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
          <SourceIcon type={source.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{source.title}</h4>
              {source.page && (
                <span className="text-xs text-gray-500 dark:text-slate-500">Page {source.page}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${source.relevance >= 90 ? "bg-emerald-500/20 text-emerald-400" :
                  source.relevance >= 70 ? "bg-accent/20 text-accent" :
                    "bg-amber-500/20 text-amber-400"
                }`}>
                {source.relevance}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 line-clamp-2">{source.excerpt}</p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white bg-white dark:bg-white/5 rounded-lg transition-colors"
            >
              {copied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => onView(source)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white bg-white dark:bg-white/5 rounded-lg transition-colors"
            >
              <IconExternalLink className="w-3 h-3" />
              View
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, onViewSource }: { message: Message; onViewSource: (source: Source) => void }) => {
  const [showSources, setShowSources] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${message.role === "user"
          ? "bg-accent-gradient"
          : "bg-accent-gradient"
        }`}>
        {message.role === "user" ? (
          <IconUser className="w-5 h-5 text-gray-900 dark:text-white" />
        ) : (
          <IconRobot className="w-5 h-5 text-gray-900 dark:text-white" />
        )}
      </div>

      <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
        <div className={`inline-block p-4 rounded-lg ${message.role === "user"
            ? "bg-accent/25 border border-accent/20"
            : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10"
          }`}>
          {message.role === "assistant" ? (
            <div className="text-sm text-gray-900 dark:text-white markdown-body">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-2 ${message.role === "user" ? "justify-end" : ""}`}>
          <span className="text-xs text-gray-500 dark:text-slate-500">{formatTime(message.timestamp)}</span>

          {message.role === "assistant" && message.sources && message.sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-accent hover:opacity-80 bg-accent/10 rounded-lg transition-colors"
            >
              <IconFileText className="w-3 h-3" />
              {message.sources.length} sources
              <IconChevronRight className={`w-3 h-3 transition-transform ${showSources ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>

        {/* Sources Panel */}
        <AnimatePresence>
          {showSources && message.sources && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {message.sources.map((source) => (
                <SourceCard key={source.id} source={source} onView={onViewSource} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Chat History Item
const ChatHistoryItem = ({
  session,
  isActive,
  onClick,
  onDelete,
}: {
  session: ChatSessionSummary;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`relative group p-3 rounded-lg cursor-pointer transition-all ${isActive
          ? "bg-accent/20 border border-accent/25"
          : "bg-white dark:bg-white/5 border border-transparent hover:border-gray-200 dark:border-white/10"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.title}</h4>
          <p className="text-xs text-gray-500 dark:text-slate-500 truncate mt-1">{session.lastMessage}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1 rounded-lg hover:bg-gray-100 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <IconDotsVertical className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-500 dark:text-slate-500 flex items-center gap-1">
          <IconClock className="w-3 h-3" />
          {formatTime(new Date(session.timestamp))}
        </span>
        <span className="text-xs text-gray-600">•</span>
        <span className="text-xs text-gray-500 dark:text-slate-500">{session.messageCount} messages</span>
      </div>

      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-8 w-36 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-20 overflow-hidden"
            >
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:bg-white/5 transition-colors">
                <IconBookmark className="w-4 h-4" />
                Save
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:bg-white/5 transition-colors">
                <IconDownload className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <IconTrash className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Suggested Questions
const suggestedQuestions = [
  "What were our Q4 revenue numbers?",
  "Summarize the employee benefits policy",
  "What are the key security compliance requirements?",
  "Show me the product roadmap for 2024",
];

export default function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSessionSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState("");
  const [viewingSource, setViewingSource] = useState<Source | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const sessions = await getChatSessions();
      setChatHistory(sessions);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load PDF when viewing source changes
  useEffect(() => {
    let objectUrl = "";
    if (viewingSource) {
      const fetchPdf = async () => {
         try {
           setIsPdfLoading(true);
           const token = getToken();
           if (!token) throw new Error("No token");
           const blob = await viewDocument(token, viewingSource.id);
           objectUrl = URL.createObjectURL(blob);
           const firstWords = viewingSource.excerpt.replace(/[\n\r]/g, " ").replace(/"/g, "").split(/\s+/).slice(0, 10).join(" ");
           const finalUrl = `${objectUrl}#search=${encodeURIComponent(firstWords)}&view=FitH`;
           setPdfUrl(finalUrl);
         } catch (e) {
           console.error("Failed to load PDF:", e);
         } finally {
           setIsPdfLoading(false);
         }
      };
      if (viewingSource.id.length > 10) { // crude check for valid mongo id
        fetchPdf();
      }
    }
    return () => {
       if (objectUrl) URL.revokeObjectURL(objectUrl);
       setPdfUrl(null);
    };
  }, [viewingSource]);

  // Load a specific session
  const loadSession = async (sessionId: string) => {
    try {
      setActiveSessionId(sessionId);
      const session = await getChatSessionById(sessionId);

      const loadedMessages: Message[] = session.messages.map((msg, idx) => ({
        id: `${sessionId}-${idx}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        sources: msg.sources?.map((s, sIdx) => ({
          id: s.documentId || sIdx.toString(),
          title: s.title || "Retrieved Document",
          type: "pdf" as const,
          excerpt: s.excerpt || `Retrieval Score: ${((s.score || 0) * 100).toFixed(2)}%`,
          relevance: Math.round((s.score || 0) * 100),
        })),
      }));

      setMessages(loadedMessages);
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatQuery(userMessage.content, activeSessionId || undefined);

      const mappedSources: Source[] = response.sources.map((s: any, idx: number) => ({
        id: s.documentId || idx.toString(),
        title: s.title || "Retrieved Document",
        type: "pdf",
        excerpt: s.excerpt || `Retrieval Score: ${(s.score * 100).toFixed(2)}%`,
        relevance: Math.round(s.score * 100)
      }));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        sources: mappedSources,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update active session ID (for new sessions)
      if (!activeSessionId && response.sessionId) {
        setActiveSessionId(response.sessionId);
      }

      // Refresh the sidebar history
      await loadChatHistory();
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I am facing an issue at the moment. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Start new chat
  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
  };

  // Delete chat
  const handleDeleteChat = async (id: string) => {
    try {
      await deleteChatSessionById(id);
      setChatHistory((prev) => prev.filter((c) => c.id !== id));
      if (activeSessionId === id) {
        setMessages([]);
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Filter history
  const filteredHistory = chatHistory.filter(
    (c) =>
      c.title.toLowerCase().includes(searchHistory.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchHistory.toLowerCase())
  );

  // Get current sources from last AI message
  const currentSources = messages
    .filter((m) => m.role === "assistant" && m.sources)
    .pop()?.sources || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden"
          >
            {/* History Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IconHistory className="w-5 h-5 text-accent" />
                  Chat History
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewChat}
                  className="p-2 rounded-lg bg-accent/20 text-accent hover:opacity-80 transition-colors"
                >
                  <IconPlus className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-accent/50"
                />
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <IconLoader2 className="w-6 h-6 text-accent animate-spin mb-2" />
                  <p className="text-xs text-gray-500 dark:text-slate-500">Loading chats...</p>
                </div>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((session) => (
                  <ChatHistoryItem
                    key={session.id}
                    session={session}
                    isActive={activeSessionId === session.id}
                    onClick={() => loadSession(session.id)}
                    onDelete={() => handleDeleteChat(session.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-slate-500">
                    {searchHistory ? "No chats found" : "No chat history yet"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                    {!searchHistory && "Start a conversation to see it here"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle History Button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white hover:bg-white/20 transition-all"
      >
        {showHistory ? <IconChevronLeft className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <IconSparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Enterprise AI Assistant</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Powered by your knowledge base</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSources(!showSources)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${showSources
                  ? "bg-accent/20 text-accent border border-accent/25"
                  : "bg-white dark:bg-white/5 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/10"
                }`}
            >
              <IconFileText className="w-4 h-4" />
              Sources
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="p-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:text-white transition-colors"
            >
              <IconRefresh className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="p-6 rounded-3xl bg-accent/20 border border-accent/25 mb-6"
              >
                <IconSparkles className="w-12 h-12 text-accent" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-md">
                Ask me anything about your enterprise knowledge base. I'll find the most relevant information and cite my sources.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setInput(question)}
                    className="p-3 text-left text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg hover:border-accent hover:bg-accent/10 transition-all font-medium"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} onViewSource={setViewingSource} />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
                    <IconRobot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <IconLoader2 className="w-4 h-4 text-accent animate-spin" />
                      <span className="text-sm text-gray-500 dark:text-slate-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything about your knowledge base..."
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${input.trim() && !isLoading
                    ? "bg-accent-gradient text-white shadow-accent"
                    : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-500"
                  }`}
              >
                <IconSend className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>

      {/* Sources Panel */}
      <AnimatePresence>
        {showSources && currentSources.length > 0 && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden"
          >
            {/* Sources Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IconFileText className="w-5 h-5 text-emerald-400" />
                  Document Sources
                </h3>
                <button
                  onClick={() => setShowSources(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:bg-white/10 transition-colors"
                >
                  <IconX className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {currentSources.length} sources referenced
              </p>
            </div>

            {/* Sources List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {currentSources.map((source) => (
                <SourceCard key={source.id} source={source} onView={setViewingSource} />
              ))}
            </div>

            {/* Sources Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 text-sm font-medium text-accent bg-accent/10 border border-accent/25 rounded-lg hover:bg-accent/20 transition-colors"
              >
                View All Sources
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Source Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {viewingSource && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingSource(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-4xl z-[1000] flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.3)]"
              >
                <div className="bg-[#1a1a2e] border-l border-white/10 flex flex-col h-full">
                  {/* Header */}
                  <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-accent/20">
                        <SourceIcon type={viewingSource.type} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-lg font-bold text-white truncate max-w-sm md:max-w-xl" title={viewingSource.title}>
                          {viewingSource.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                          {viewingSource.page ? `Page ${viewingSource.page}` : "Extracted Chunk"} • <span className="text-emerald-400 font-medium">{viewingSource.relevance}% Match</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => pdfUrl && window.open(pdfUrl)}
                        className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                        title="Open in new tab"
                      >
                        <IconWorld className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewingSource(null)}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                      >
                        <IconX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Viewer Content */}
                  <div className="flex-1 overflow-hidden bg-black/40 relative">
                    {isPdfLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <IconLoader2 className="w-12 h-12 animate-spin mb-4 text-accent" />
                            <p className="text-sm font-medium">Fetching original document & finding match...</p>
                        </div>
                    )}

                    {!isPdfLoading && !pdfUrl && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                            <IconFileText className="w-16 h-16 text-accent mb-6" />
                            <p className="text-2xl font-bold">Standard Preview Unavailable</p>
                            <p className="text-gray-400 mt-3 text-center max-w-sm">
                                We can't render a direct preview for this source. It might be manually added text or an unsupported format.
                            </p>
                            
                            <div className="mt-8 text-left max-w-2xl bg-white/5 border border-white/10 p-6 rounded-xl w-full">
                               <div className="mb-4 text-sm font-medium text-gray-400 tracking-wider uppercase">
                                  Relevant Excerpt Highlight
                               </div>
                               <div className="p-6 rounded-lg bg-accent/10 border border-accent/20 relative">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-lg"></div>
                                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap font-medium text-base">
                                     {viewingSource.excerpt}
                                  </p>
                               </div>
                            </div>
                        </div>
                    )}

                    {pdfUrl && !isPdfLoading && (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full border-none"
                            title={viewingSource.title}
                        />
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
