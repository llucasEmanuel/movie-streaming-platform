const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Erro inesperado");
  }

  return data;
}

export interface UserProfile {
  name: string;
  email: string;
  photo: string | null;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}

export async function getProfile(id: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/accounts/${id}`);
  return parseResponse<UserProfile>(response);
}

export async function updateProfile(
  id: string,
  data: { name?: string; email?: string; password?: string; photo?: { filename: string; sizeMB: number } }
): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_URL}/accounts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return parseResponse<UpdateProfileResponse>(response);
}

export async function updateEmail(id: string, email: string): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_URL}/accounts/${id}/email`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return parseResponse<UpdateProfileResponse>(response);
}

export async function updateName(id: string, name: string): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_URL}/accounts/${id}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return parseResponse<UpdateProfileResponse>(response);
}

export async function updatePassword(id: string, password: string): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_URL}/accounts/${id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  return parseResponse<UpdateProfileResponse>(response);
}

export async function updatePhoto(id: string, filename: string, sizeMB: number): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_URL}/accounts/${id}/photo`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename, sizeMB }),
  });
  return parseResponse<UpdateProfileResponse>(response);
}


async function generateAccountRemovalToken(userId: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { id: userId, exp: Math.floor(Date.now() / 1000) + 3600 };

  const stringifyAndBase64Url = (obj: unknown) => {
    const str = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(str);
    const base64 = btoa(String.fromCharCode(...bytes));

    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };

  const headerB64 = stringifyAndBase64Url(header);
  const payloadB64 = stringifyAndBase64Url(payload);
  const tokenInput = `${headerB64}.${payloadB64}`;

  const keyData = new TextEncoder().encode("secret");
  const key = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(tokenInput),
  );

  const signatureArray = new Uint8Array(signatureBuffer);
  const signatureB64 = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${tokenInput}.${signatureB64}`;
}

export async function deleteAccount(id: string): Promise<void> {
  const token = await generateAccountRemovalToken(id);

  const response = await fetch(`${API_URL}/users/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return;
  }

  let message = "Erro interno do servidor. Tente novamente mais tarde.";

  if (response.status === 401) {
    message = "Sessão expirada.\nFaça login novamente.";
  } else if (response.status === 403) {
    message = "Você não tem permissão para realizar esta ação.";
  } else if (response.status === 404) {
    message = "Conta não encontrada.";
  }

  try {
    const data = await response.json();

    if (data?.error || data?.message) {
      message = data.error ?? data.message;
    }
  } catch {
    // A resposta pode não ter corpo JSON.
  }

  throw new Error(message);
}