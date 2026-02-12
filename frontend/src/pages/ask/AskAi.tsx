import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  IconFileTypePdf,
  IconFileTypeDoc,
  IconLink,
  IconRefresh,
} from "@tabler/icons-react";

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

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

// Mock data for chat history
const mockChatHistory: ChatSession[] = [
  { id: "1", title: "Q4 Financial Analysis", lastMessage: "The Q4 revenue increased by 15%...", timestamp: new Date(Date.now() - 1000 * 60 * 30), messageCount: 8 },
  { id: "2", title: "Employee Benefits Policy", lastMessage: "According to the policy document...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), messageCount: 5 },
  { id: "3", title: "Product Roadmap 2024", lastMessage: "The key milestones for Q1 include...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), messageCount: 12 },
  { id: "4", title: "Security Compliance", lastMessage: "Based on the SOC 2 guidelines...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), messageCount: 6 },
  { id: "5", title: "Marketing Strategy", lastMessage: "The target audience analysis shows...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), messageCount: 10 },
];

// Mock sources data
const mockSources: Source[] = [
  { id: "1", title: "Q4 Financial Report 2024.pdf", type: "pdf", excerpt: "Revenue growth exceeded expectations with a 15% YoY increase, primarily driven by enterprise sales...", page: 12, relevance: 95 },
  { id: "2", title: "Company Knowledge Base", type: "database", excerpt: "Historical financial data indicates consistent growth patterns across all business units...", relevance: 88 },
  { id: "3", title: "Market Analysis Report.docx", type: "doc", excerpt: "Industry benchmarks show our performance is in the top quartile for SaaS companies...", page: 5, relevance: 76 },
  { id: "4", title: "Internal Wiki - Finance", type: "webpage", excerpt: "Quarterly reporting guidelines and metrics definitions...", url: "/wiki/finance", relevance: 65 },
];

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
    webpage: <IconLink className="w-5 h-5 text-purple-400" />,
    database: <IconFile className="w-5 h-5 text-emerald-400" />,
  };
  return icons[type];
};

// Source Card Component
const SourceCard = ({ source }: { source: Source }) => {
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
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/5">
          <SourceIcon type={source.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-white truncate">{source.title}</h4>
              {source.page && (
                <span className="text-xs text-gray-500">Page {source.page}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${source.relevance >= 90 ? "bg-emerald-500/20 text-emerald-400" :
                  source.relevance >= 70 ? "bg-blue-500/20 text-blue-400" :
                    "bg-amber-500/20 text-amber-400"
                }`}>
                {source.relevance}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{source.excerpt}</p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"
            >
              {copied ? <IconCheck className="w-3 h-3" /> : <IconCopy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors">
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
const ChatMessage = ({ message }: { message: Message }) => {
  const [showSources, setShowSources] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${message.role === "user"
          ? "bg-gradient-to-br from-purple-500 to-pink-500"
          : "bg-gradient-to-br from-blue-500 to-cyan-500"
        }`}>
        {message.role === "user" ? (
          <IconUser className="w-5 h-5 text-white" />
        ) : (
          <IconRobot className="w-5 h-5 text-white" />
        )}
      </div>

      <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}>
        <div className={`inline-block p-4 rounded-2xl ${message.role === "user"
            ? "bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/20"
            : "bg-white/5 border border-white/10"
          }`}>
          <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
        </div>

        <div className={`flex items-center gap-2 mt-2 ${message.role === "user" ? "justify-end" : ""}`}>
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>

          {message.role === "assistant" && message.sources && message.sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 rounded-lg transition-colors"
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
                <SourceCard key={source.id} source={source} />
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
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`relative group p-3 rounded-xl cursor-pointer transition-all ${isActive
          ? "bg-purple-500/20 border border-purple-500/30"
          : "bg-white/5 border border-transparent hover:border-white/10"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{session.title}</h4>
          <p className="text-xs text-gray-500 truncate mt-1">{session.lastMessage}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <IconDotsVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <IconClock className="w-3 h-3" />
          {formatTime(session.timestamp)}
        </span>
        <span className="text-xs text-gray-600">•</span>
        <span className="text-xs text-gray-500">{session.messageCount} messages</span>
      </div>

      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-8 w-36 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
            >
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                <IconBookmark className="w-4 h-4" />
                Save
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors">
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
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(mockChatHistory);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on my analysis of your knowledge base, I found relevant information regarding your question about "${input.trim().substring(0, 50)}...".\n\nThe Q4 2024 financial report indicates a strong performance with revenue increasing by 15% year-over-year. This growth was primarily driven by:\n\n• Enterprise sales growing by 23%\n• New customer acquisition up by 18%\n• Customer retention rate at 94%\n\nThe company exceeded market expectations and outperformed industry benchmarks in most key metrics.`,
        timestamp: new Date(),
        sources: mockSources,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
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
    setActiveSession(null);
  };

  // Delete chat
  const handleDeleteChat = (id: string) => {
    setChatHistory(chatHistory.filter((c) => c.id !== id));
    if (activeSession === id) {
      setMessages([]);
      setActiveSession(null);
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
            className="flex-shrink-0 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* History Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <IconHistory className="w-5 h-5 text-purple-400" />
                  Chat History
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewChat}
                  className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                >
                  <IconPlus className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {filteredHistory.map((session) => (
                <ChatHistoryItem
                  key={session.id}
                  session={session}
                  isActive={activeSession === session.id}
                  onClick={() => setActiveSession(session.id)}
                  onDelete={() => handleDeleteChat(session.id)}
                />
              ))}
              {filteredHistory.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No chats found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle History Button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 border border-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-all"
      >
        {showHistory ? <IconChevronLeft className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <IconSparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Enterprise AI Assistant</h2>
              <p className="text-xs text-gray-400">Powered by your knowledge base</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSources(!showSources)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${showSources
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-white/5 text-gray-400 border border-white/10"
                }`}
            >
              <IconFileText className="w-4 h-4" />
              Sources
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
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
                className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 mb-6"
              >
                <IconSparkles className="w-12 h-12 text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">How can I help you today?</h3>
              <p className="text-gray-400 mb-8 max-w-md">
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
                    className="p-3 text-left text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 hover:bg-white/10 transition-all"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <IconRobot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <IconLoader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything about your knowledge base..."
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${input.trim() && !isLoading
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/10 text-gray-500"
                  }`}
              >
                <IconSend className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
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
            className="flex-shrink-0 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Sources Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <IconFileText className="w-5 h-5 text-emerald-400" />
                  Document Sources
                </h3>
                <button
                  onClick={() => setShowSources(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <IconX className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {currentSources.length} sources referenced
              </p>
            </div>

            {/* Sources List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {currentSources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>

            {/* Sources Footer */}
            <div className="p-4 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 text-sm font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors"
              >
                View All Sources
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
