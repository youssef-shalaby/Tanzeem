import { apiRequest } from "./api";

export async function submitOnboarding(payload) {
  return apiRequest("/api/Onboarding/Onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
