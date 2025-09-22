const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getBranchNameForNavbar(): Promise<string | null> {
  const branchIdName = sessionStorage.getItem("branch_id"); // fallback for testing
  console.log("BASE_URL:", BASE_URL);
  console.log("branchId:", branchIdName);

  try {
    const url = `${BASE_URL}/api/branches/by-branch-id/${branchIdName}`;
    console.log("Fetching:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);

    if (!response.ok) {
      console.log("API response not ok:", response.statusText);
      return null;
    }
    const branch = await response.json();
    console.log("Branch response:", branch);

    return branch.branch_name || null;
  } catch (err) {
    console.log("Fetch error:", err);
    return null;
  }
}