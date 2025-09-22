const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getBranchType(branchId?: string): Promise<string | null> {
  const branchIdType = branchId || sessionStorage.getItem("branch_id"); // fallback for testing
  try {
    const url = `${BASE_URL}/api/branches/by-branch-id/${branchIdType}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }
    const branch = await response.json();
    return branch.type || null;
  } catch {
    return null;
  }
}