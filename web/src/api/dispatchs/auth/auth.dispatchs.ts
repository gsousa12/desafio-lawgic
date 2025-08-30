import { api } from "@/api/axios";

export const loginDispatch = async (email: string, password: string) => {
  const response = await api.post("/auth/signin", { email, password });
  return response.data;
};

export const logoutDispatch = async () => {
  const response = await api.post("/auth/signout");
  return response.data;
};

export const getUserInformationDispatch = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};
