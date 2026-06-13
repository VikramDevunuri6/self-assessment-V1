import api from "./api";
import { setSession, getRefreshToken, clearSession, getUser } from "./tokenStorage";

export async function signup(formData) {
  const { data } = await api.post("/auth/signup", formData);
  setSession(data);
  return data;
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  setSession(data);
  return data;
}

export async function getProfile() {
  const { data } = await api.get("/profile");
  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } finally {
    clearSession();
  }
}

export { getUser };
