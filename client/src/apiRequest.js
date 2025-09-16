import axios from "axios";
import { auth } from "./firebaseConfig";

export async function apiRequest(method, url, data = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return axios({
    method,
    url,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
