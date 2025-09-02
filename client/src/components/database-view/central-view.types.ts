/* ----------------------------- types ----------------------------- */
export type PaymentStatus = "PAID" | "PARTIAL" | "NP"
export type Branch = "SM Valenzuela" | "Valenzuela" | "SM Grand"
export type BranchLocation = "Valenzuela City" | "Caloocan City"

export type Transaction = {
  id: string
  shoeModel: string
  serviceNeeded: string[]
  additional: string[]
  rush: boolean
  status: string
  statusDates: Record<string, string | null>
  beforeImage?: string | null
  afterImage?: string | null
}

export type ReceiptRow = {
  id: string
  dateIn: Date
  receivedBy: string
  dateOut?: Date | null
  customer: string
  pairs: number
  released: number
  branch: Branch
  branchLocation: BranchLocation
  total: number
  amountPaid: number
  remaining: number
  status: PaymentStatus

  // Extra fields for dialog
  customerBirthday?: string
  address?: string
  email?: string
  contact?: string
  transactions?: Transaction[]
}

export type TxStatusDates = Record<string, string | null>

