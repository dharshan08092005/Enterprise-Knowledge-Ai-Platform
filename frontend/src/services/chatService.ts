import apiClient from "./apiClient";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export interface ChatSource {
  documentId: string;
  score: number;
  title?: string;
  excerpt?: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  sessionId: string;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

export interface ChatMessageData {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  createdAt: string;
}

export interface ChatSessionFull {
  _id: string;
  title: string;
  messages: ChatMessageData[];
  createdAt: string;
  updatedAt: string;
}

/** Send a chat query, optionally continuing an existing session */
export const sendChatQuery = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  const response = await apiClient.post(
    "/chat",
    { message, sessionId },
    { headers: getAuthHeader() }
  );
  return response.data;
};

/** Get all chat sessions for the current user */
export const getChatSessions = async (): Promise<ChatSessionSummary[]> => {
  const response = await apiClient.get("/chat/sessions", {
    headers: getAuthHeader(),
  });
  return response.data;
};

/** Get a single chat session with all messages */
export const getChatSessionById = async (
  id: string
): Promise<ChatSessionFull> => {
  const response = await apiClient.get(`/chat/sessions/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

/** Delete a chat session */
export const deleteChatSessionById = async (id: string): Promise<void> => {
  await apiClient.delete(`/chat/sessions/${id}`, {
    headers: getAuthHeader(),
  });
};
