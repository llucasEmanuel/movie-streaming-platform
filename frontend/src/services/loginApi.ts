import type { LoggedUser } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface LoginResponse {
  authenticated: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoggedUser> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok || !data.authenticated || !data.user) {
  throw new Error("E-mail ou senha inválidos");
}

  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
  };
}