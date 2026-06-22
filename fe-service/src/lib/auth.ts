import api from "./api";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

export async function signUp(email: string, password: string, full_name: string): Promise<AuthResponse> {
  const res = await api.post("/api/v1/auth/signup", { email, password, full_name });
  return res.data.data;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post("/api/v1/auth/signin", { email, password });
  return res.data.data;
}

export async function signOut(): Promise<void> {
  await api.post("/api/v1/auth/signout");
}

export function saveSession(data: AuthResponse) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getUser(): AuthResponse | null {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
