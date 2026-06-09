import { apiRequest } from "./api";

export async function submitOnboarding(payload) {
  const response = await apiRequest("/api/Onboarding/Onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (typeof response === "string" && /onboarding failed/i.test(response)) {
    throw new Error(response.replace(/^Onboarding failed:\s*/i, "") || "Onboarding failed. Please try again.");
  }

  return response;
}
