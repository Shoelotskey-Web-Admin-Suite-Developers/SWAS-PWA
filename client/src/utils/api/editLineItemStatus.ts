// src/utils/api/editLineItemStatus.ts
export const editLineItemStatus = async (line_item_ids: string[], new_status: string) => {
  try {
    const res = await fetch("http://localhost:5000/line-items/status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ line_item_ids, new_status }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update line item status");
    }

    const data = await res.json();
    return data; // { message: "x line item(s) updated to ..." }
  } catch (error: any) {
    console.error("Error updating line item status:", error);
    throw error;
  }
};
