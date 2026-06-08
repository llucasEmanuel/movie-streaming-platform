import type { RecommendationSection } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Erro inesperado");
  }

  return data;
}

export async function getRecommendations(userId: string): Promise<RecommendationSection[]> {
  const response = await fetch(`${API_URL}/recommendations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-test-user-id": userId,
    },
  });

  return parseResponse<RecommendationSection[]>(response);
}
