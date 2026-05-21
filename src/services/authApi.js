import { apiRequest } from "./api";

export function loginUser(credentials) {
  return apiRequest("/api/Auth/Login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
