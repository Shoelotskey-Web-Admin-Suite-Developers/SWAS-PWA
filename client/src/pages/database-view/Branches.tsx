// src/pages/branches.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Branch = {
  id: number
  name: string
  location: string
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: "SM Valenzuela", location: "Valenzuela City" },
    { id: 2, name: "SM Grand", location: "Caloocan City" },
  ])

  const [form, setForm] = useState({
    name: "",
    location: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.location) return

    const newBranch: Branch = {
      id: branches.length + 1,
      name: form.name,
      location: form.location,
    }

    setBranches([...branches, newBranch])
    setForm({ name: "", location: "" })
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      {/* Add Branch Form */}
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Add New Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBranch} className="space-y-4">
            <div>
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter branch name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter branch location"
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full">
              Add Branch
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Branch List */}
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <p className="text-sm text-gray-500">No branches available</p>
          ) : (
            <ul className="space-y-2">
              {branches.map((branch) => (
                <li
                  key={branch.id}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{branch.name}</p>
                    <p className="text-sm text-gray-600">{branch.location}</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
