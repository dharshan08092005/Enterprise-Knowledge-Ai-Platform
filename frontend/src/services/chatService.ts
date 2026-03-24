import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
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
}

export const sendChatQuery = async (message: string): Promise<ChatResponse> => {
  const token = localStorage.getItem("accessToken");
  const response = await api.post("/chat", { message }, {
    headers: {
        Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
