const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getTransactionById = async (transaction_id: string) => {
  const branch_id = sessionStorage.getItem("branch_id");
  if (!branch_id) throw new Error("Branch ID not found in session storage");

  const res = await fetch(`${API_BASE_URL}/api/transactions/${transaction_id}?branch_id=${branch_id}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch transaction: ${errorText}`);
  }
  return await res.json();
};
