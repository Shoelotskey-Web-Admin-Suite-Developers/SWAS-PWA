/// src/models/Users.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  user_id: string; // NCR-VAL-B style (REG-<BRANCHCODE>-<TYPE>)
  user_number: number; // auto-increment
  branch_id: string; // FK -> Branch
  position: string; // e.g., Admin, Staff, Manager
  password: string; // hashed password
}

const UserSchema: Schema = new Schema<IUser>(
  {
    user_id: { type: String, required: true, unique: true }, // e.g., NCR-VAL-B
    user_number: { type: Number, required: true, unique: true }, // auto-increment handled separately
    branch_id: { type: String, required: true, ref: "Branch" },
    position: { type: String, required: true, maxlength: 50 },
    password: { type: String, required: true },
  }
  // no timestamps
);

export const User = mongoose.model<IUser>(
  "User",
  UserSchema,
  "users"
);
