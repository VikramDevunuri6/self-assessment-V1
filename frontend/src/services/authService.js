import api from "./api";

export async function signup(formData) {
  const { data } = await api.post("/auth/signup", formData);

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function getProfile() {
  const { data } = await api.get("/auth/me");
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}
