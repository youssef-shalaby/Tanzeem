import { apiRequest } from "./api";

export function loginUser(credentials) {
  return apiRequest("/api/Auth/Login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function requestPasswordReset(email) {
  return apiRequest("/api/Auth/forget-password/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyPasswordResetOtp({ email, otp }) {
  return apiRequest("/api/Auth/forget-password/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function confirmPasswordReset({ email, otp, newPassword }) {
  return apiRequest("/api/Auth/forget-password/confirm", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export function deleteAccountFully() {
  return apiRequest("/api/Auth/Delete-Account-Fully", {
    method: "DELETE",
  });
}
