import { apiRequest } from "./api";

export function normalizeCategory(category) {
  return {
    id: category?.id ?? category?.Id ?? category?.categoryId ?? category?.CategoryId ?? null,
    name: category?.name ?? category?.Name ?? category?.categoryName ?? category?.CategoryName ?? "",
  };
}

function normalizeCategoryList(data) {
  const rows = Array.isArray(data) ? data : data?.data || data?.items || [];
  return rows
    .map(normalizeCategory)
    .filter((category) => category.name.trim())
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCategories() {
  try {
    return normalizeCategoryList(await apiRequest("/api/Categories"));
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) throw error;
    return lookupCategories();
  }
}

export async function lookupCategories(searchTerm = "") {
  const query = searchTerm.trim() ? `?searchTerm=${encodeURIComponent(searchTerm.trim())}` : "";
  return normalizeCategoryList(await apiRequest(`/api/Categories/lookup${query}`));
}

export function createCategory(name) {
  return apiRequest("/api/Categories", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() }),
  });
}

export function updateCategory(category) {
  return apiRequest("/api/Categories", {
    method: "PUT",
    body: JSON.stringify({
      id: Number(category.id),
      name: category.name.trim(),
    }),
  });
}

export function deleteCategory(id) {
  return apiRequest(`/api/Categories/${id}`, { method: "DELETE" });
}
