import apiClient from "./apiClient";

export const fetchKnowledgeBase = async () => {
  const res = await apiClient.get("/knowledge-base");
  return res.data;
};
