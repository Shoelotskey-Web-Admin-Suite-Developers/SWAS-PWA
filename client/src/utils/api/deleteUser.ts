// utils/api/deleteUser.ts
export const deleteUser = async (userId: string) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to delete user");
    }

    return true; // deletion successful
  } catch (err) {
    console.error("Failed to delete user:", err);
    throw err;
  }
};
