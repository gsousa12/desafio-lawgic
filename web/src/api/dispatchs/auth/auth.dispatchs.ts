import { api } from "@/api/axios";

export const logoutDispatch = async () => {
  const response = await api.post("/auth/signout");
  return response.data;
};
