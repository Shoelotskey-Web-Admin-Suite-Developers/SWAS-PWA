"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "../ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Eye, EyeOff } from "lucide-react" // 👀 Using lucide icons

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branchIds: number[]
  onAddUser: (
    userId: string,
    branchId: number,
    position: "Branch Admin" | "Branch Staff",
    password: string
  ) => void
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  branchIds,
  onAddUser,
}) => {
  const [userId, setUserId] = React.useState("")
  const [branchId, setBranchId] = React.useState<number>(branchIds[0] || 0)
  const [position, setPosition] = React.useState<"Branch Admin" | "Branch Staff">("Branch Staff")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false) // 🔑 toggle

  const handleSubmit = () => {
    if (!userId || !branchId || !position || !password) return
    onAddUser(userId, branchId, position, password)
    setUserId("")
    setBranchId(branchIds[0] || 0)
    setPosition("Branch Staff")
    setPassword("")
    setShowPassword(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mt-[50px] bg-black border-b border-black text-white [&>button]:hidden">
        <DialogHeader className="border-b border-white items-start text-left mb-[1rem]">
          <DialogTitle>Add User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <Label>User ID</Label>
            <Input
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="bg-white text-black placeholder-gray-400"
            />
          </div>

          <div>
            <Label>Branch ID</Label>
            <Select value={branchId.toString()} onValueChange={(val) => setBranchId(Number(val))}>
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branchIds.map((id) => (
                  <SelectItem key={id} value={id.toString()}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Position</Label>
            <Select
              value={position}
              onValueChange={(val) =>
                setPosition(val as "Branch Admin" | "Branch Staff")
              }
            >
              <SelectTrigger className="bg-white text-black">
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Branch Admin">Branch Admin</SelectItem>
                <SelectItem value="Branch Staff">Branch Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Label>Password</Label>
            <Input
              type={showPassword ? "text" : "password"} // 🔄 toggle type
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white text-black placeholder-gray-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-[20px] right-0 text-gray-500 bg-transparent"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            className="border-white bg-black text-white hover:bg-white hover:text-black"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#CE1616] hover:bg-[#E64040] text-white"
            onClick={handleSubmit}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
