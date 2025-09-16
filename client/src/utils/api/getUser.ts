// utils/api/getUsers.ts
export interface User {
  user_id: string
  branch_id: string
}

export async function getUsers(): Promise<User[]> {
  const token = sessionStorage.getItem("token")

  const res = await fetch("http://localhost:5000/api/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Failed to fetch users")
  }

  const data = await res.json()
  return data // assuming API returns an array of users
}
