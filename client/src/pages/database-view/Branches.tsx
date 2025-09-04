"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import "@/styles/database-view/branches.css"
import { EditBranchDialog } from "@/components/database-view/EditBranchDialog"
import { EditUserDialog } from "@/components/database-view/EditUserDialog"
import { AddUserDialog } from "@/components/database-view/AddUserDialog"
import { AddBranchDialog } from "@/components/database-view/AddBranchDialog"

type Branch = {
  id: number
  name: string
  location: string
}

type User = {
  id: string
  branchId: number
  position: "Branch Admin" | "Branch Staff"
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: "ADMIN", location: "Location" },
    { id: 2, name: "SM Valenzuela", location: "Valenzuela City" },
    { id: 3, name: "Valenzuela", location: "Valenzuela City" },
    { id: 4, name: "SM Grand", location: "Caloocan" },
    { id: 5, name: "SM Grand", location: "Caloocan" },
  ])

  const [users, setUsers] = useState<User[]>([
    { id: "adminSMVAL@JUy", branchId: 1, position: "Branch Admin" },
    { id: "staffSMVAL@RChing", branchId: 1, position: "Branch Staff" },
    { id: "adminSMGrand@Xy", branchId: 2, position: "Branch Admin" },
    { id: "staffSMGrand@Zz", branchId: 2, position: "Branch Staff" },
  ])

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [addBranchOpen, setAddBranchOpen] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)

  const selectedBranch = branches.find((b) => b.id === selectedBranchId)
  const filteredUsers = users.filter((u) => u.branchId === selectedBranchId)

  // Handlers for adding
  const handleAddBranch = (name: string, location: string) => {
    const newBranch: Branch = {
      id: branches.length + 1,
      name,
      location,
    }
    setBranches([...branches, newBranch])
  }

  const handleAddUser = (
    userId: string,
    branchId: number,
    position: "Branch Admin" | "Branch Staff",
    password?: string
  ) => {
    const newUser: User & { password?: string } = { id: userId, branchId, position, password }
    setUsers([...users, newUser])
  }


  return (
    <div className="branches-wrapper">
      {/* Branches Table */}
      <Card className="branches-cards">
        <CardHeader className="flex flex-row justify-between pb-0">
          <CardTitle>
            <h1 className="mt-3">Branches</h1>
          </CardTitle>
          <Button className="extra-bold" onClick={() => setAddBranchOpen(true)}>
            Add Branch
          </Button>
        </CardHeader>

        <CardContent className="card-contents">
          <div className="branches-table-container">
            <Table className="branches-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center text-black branches-col-id">
                    <h5>Branch ID</h5>
                  </TableHead>
                  <TableHead className="text-center text-black">
                    <h5>Branch</h5>
                  </TableHead>
                  <TableHead className="text-center text-black">
                    <h5>Location</h5>
                  </TableHead>
                  <TableHead className=" text-black branches-col-action">
                    <h5 className="text-right pr-[3.5rem]">Action</h5>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id} className="branches-row">
                    <TableCell>
                      <small className="bold text-center">{branch.id}</small>
                    </TableCell>
                    <TableCell>
                      <small>{branch.name}</small>
                    </TableCell>
                    <TableCell>
                      <small>{branch.location}</small>
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        className="bg-[#CE1616] hover:bg-[#E64040] text-white extra-bold"
                        size="sm"
                        onClick={() => setEditingBranch(branch)}
                      >
                        Edit
                      </Button>
                      <Button
                        className={`branches-btn extra-bold ${
                          selectedBranchId === branch.id ? "branches-btn-active" : ""
                        }`}
                        variant={selectedBranchId === branch.id ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setSelectedBranchId(selectedBranchId === branch.id ? null : branch.id)
                        }
                      >
                        View Users
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Users in Selected Branch */}
      <Card className="branches-cards">
        <CardHeader className="flex flex-row justify-between  pb-0">
          <CardTitle>
            <h1 className="mt-3">
              {selectedBranch ? `Users in ${selectedBranch.name}` : "Select a Branch"}
            </h1>
          </CardTitle>
          {selectedBranch && (
            <Button className="extra-bold" onClick={() => setAddUserOpen(true)}>
              Add User
            </Button>
          )}
        </CardHeader>

        <CardContent className="card-contents">
          {selectedBranch ? (
            filteredUsers.length > 0 ? (
              <div className="branches-table-container">
                <Table className="branches-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center text-black">
                        <h5>User ID</h5>
                      </TableHead>
                      <TableHead className="text-center text-black">
                        <h5>Branch ID</h5>
                      </TableHead>
                      <TableHead className="text-center text-black">
                        <h5>Position</h5>
                      </TableHead>
                      <TableHead className="text-black">
                        <h5 className="text-right pr-[0.3rem]">Action</h5>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="branches-row">
                        <TableCell>
                          <small>{user.id}</small>
                        </TableCell>
                        <TableCell>
                          <small>{user.branchId}</small>
                        </TableCell>
                        <TableCell>
                          <small>{user.position}</small>
                        </TableCell>
                        <TableCell className="flex justify-end">
                          <Button
                            className="bg-[#CE1616] hover:bg-[#E64040] text-white extra-bold"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No users available for this branch.</p>
            )
          ) : (
            <p className="text-sm text-gray-500">Please select a branch to view its users.</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Branch Dialog */}
      {editingBranch && (
        <EditBranchDialog
          open={!!editingBranch}
          onOpenChange={(open) => !open && setEditingBranch(null)}
          branch={{
            branchId: editingBranch.id.toString(),
            branchName: editingBranch.name,
            location: editingBranch.location,
          }}
        />
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={{
            userId: editingUser.id,
            branchId: editingUser.branchId,
            position: editingUser.position,
          }}
          branchIds={branches.map((b) => b.id)}
        />
      )}

      {/* Add Branch Dialog */}
      <AddBranchDialog
        open={addBranchOpen}
        onOpenChange={setAddBranchOpen}
        onAddBranch={handleAddBranch}
      />

      {/* Add User Dialog */}
      {selectedBranch && (
        <AddUserDialog
          open={addUserOpen}
          onOpenChange={setAddUserOpen}
          branchIds={branches.map((b) => b.id)}
          onAddUser={handleAddUser}
        />
      )}
    </div>
  )
}
