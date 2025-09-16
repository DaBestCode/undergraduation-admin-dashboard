// src/apiRequest.js
import axios from 'axios';
import { getAuth } from "firebase/auth";

/**
 * All API requests should use this function. It will send the Firebase ID token if user is logged in.
 * Usage: apiRequest('get', '/api/students')
 */
export async function apiRequest(method, url, data = null) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated. Log in first.");
  }
  const token = await user.getIdToken();

  return axios({
    method,
    url,
    data,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
