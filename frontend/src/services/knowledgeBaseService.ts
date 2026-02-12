import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

export const fetchKnowledgeBase = async (token: string) => {
  const res = await api.get("/knowledge-base", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};
