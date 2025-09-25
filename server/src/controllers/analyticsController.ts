import { Request, Response } from "express"
import { DailyRevenue } from "../models/DailyRevenue"
import { Forecast } from "../models/Forecast"
import { MonthlyRevenue } from "../models/MonthlyRevenue"
import { LineItem } from "../models/LineItem"
import { Service } from "../models/Service"
import { Transaction } from "../models/Transactions"

export const getDailyRevenue = async (req: Request, res: Response) => {
  try {
    // Return all daily revenue records sorted by date ascending
    const records = await DailyRevenue.find().sort({ date: 1 }).lean()
    return res.status(200).json(records)
  } catch (err) {
    console.error("Error fetching daily revenue:", err)
    return res.status(500).json({ error: "Failed to fetch daily revenue" })
  }
}

export const getForecast = async (req: Request, res: Response) => {
  try {
    // Return all forecast records sorted by date ascending
    const records = await Forecast.find().sort({ date: 1 }).lean()
    return res.status(200).json(records)
  } catch (err) {
    console.error("Error fetching forecast:", err)
    return res.status(500).json({ error: "Failed to fetch forecast" })
  }
}

export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    // Return all monthly revenue records sorted by Year first
    const records = await MonthlyRevenue.find().sort({ Year: 1 }).lean()
    
    console.log("Found monthly revenue records:", records.length)
    if (records.length > 0) {
      console.log("Sample record:", records[0])
      console.log("Record keys:", Object.keys(records[0]))
    }
    
    // If no records found, return empty array
    if (records.length === 0) {
      console.log("No monthly revenue records found in database")
      return res.status(200).json([])
    }
    
    // Month names to numbers mapping
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Transform the data and add month numbers for sorting
    const transformedData = records.map((record: any) => {
      // Convert month name to month number
      const monthIndex = monthNames.indexOf(record.month)
      const monthNumber = monthIndex !== -1 ? monthIndex + 1 : 1
      
      const monthStr = record.Year.toString() + "-" + monthNumber.toString().padStart(2, "0")
      
      // Get branch values - use the correct branch codes from the data structure
      return {
        month: monthStr,
        total: record.total || 0,
        SMVal: record["SMVAL-B-NCR"] || 0,
        Val: record["VAL-B-NCR"] || 0,  
        SMGra: record["SMGRA-B-NCR"] || 0,
        sortKey: record.Year * 100 + monthNumber // For proper chronological sorting
      }
    })
    
    // Sort by year and month chronologically
    const sortedData = transformedData.sort((a, b) => a.sortKey - b.sortKey)
    
    // Remove the sortKey before sending response
    const finalData = sortedData.map(({ sortKey, ...item }) => item)
    
    console.log("Transformed data sample:", finalData.slice(0, 2))
    return res.status(200).json(finalData)
  } catch (err) {
    console.error("Error fetching monthly revenue:", err)
    return res.status(500).json({ error: "Failed to fetch monthly revenue" })
  }
}

export const getTopServices = async (req: Request, res: Response) => {
  try {
    // Get branch filter from query params
    const { branches } = req.query
    let branchFilter: any = {}
    
    // Handle branch filtering
    if (branches && typeof branches === 'string') {
      const branchArray = branches.split(',').filter(b => b.trim())
      
      // Map frontend branch IDs to actual branch_ids
      const branchIdMap: { [key: string]: string } = {
        "1": "SMVAL-B-NCR",    // SM Valenzuela
        "2": "VAL-B-NCR",      // Valenzuela  
        "3": "SMGRA-B-NCR"     // SM Grand
      }
      
      // If "4" (Total) is selected or no specific branches, don't filter
      if (!branchArray.includes("4") && branchArray.length > 0) {
        const actualBranchIds = branchArray
          .map(b => branchIdMap[b])
          .filter(Boolean) // Remove undefined values
        
        if (actualBranchIds.length > 0) {
          branchFilter = { branch_id: { $in: actualBranchIds } }
        }
      }
    }
    
    // Get line items with branch filtering
    const lineItems = await LineItem.find(branchFilter).lean()
    
    // Count occurrences of each service
    const serviceCounts: { [key: string]: number } = {}
    
    lineItems.forEach((lineItem: any) => {
      if (lineItem.services && Array.isArray(lineItem.services)) {
        lineItem.services.forEach((service: any) => {
          const serviceId = service.service_id
          serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + (service.quantity || 1)
        })
      }
    })
    
    // Get service details for SERVICE-1, SERVICE-2, SERVICE-3, SERVICE-8, SERVICE-9
    const targetServices = ["SERVICE-1", "SERVICE-2", "SERVICE-3", "SERVICE-8", "SERVICE-9"]
    const services = await Service.find({
      service_id: { $in: targetServices }
    }).lean()
    
    // Create service name mapping
    const serviceNameMap: { [key: string]: string } = {}
    services.forEach((service: any) => {
      serviceNameMap[service.service_id] = service.service_name
    })
    
    // Build response data for individual services
    const individualServices = ["SERVICE-1", "SERVICE-2", "SERVICE-3"].map((serviceId) => ({
      service: serviceNameMap[serviceId] || serviceId,
      serviceId: serviceId,
      transactions: serviceCounts[serviceId] || 0,
      fill: getServiceColor(serviceId)
    }))
    
    // Combine SERVICE-8 and SERVICE-9 as "Color Renewal"
    const colorRenewalCount = (serviceCounts["SERVICE-8"] || 0) + (serviceCounts["SERVICE-9"] || 0)
    const colorRenewalService = {
      service: "Color Renewal",
      serviceId: "COLOR-RENEWAL",
      transactions: colorRenewalCount,
      fill: getServiceColor("COLOR-RENEWAL")
    }
    
    // Calculate date range from line items (using latest_update field)
    let earliestDate: Date | null = null
    let latestDate: Date | null = null
    
    lineItems.forEach((lineItem: any) => {
      const updateDate = new Date(lineItem.latest_update)
      if (!earliestDate || updateDate < earliestDate) {
        earliestDate = updateDate
      }
      if (!latestDate || updateDate > latestDate) {
        latestDate = updateDate
      }
    })
    
    // Combine all services
    const topServicesData = [...individualServices, colorRenewalService]
    
    // Include date range in response
    const response = {
      data: topServicesData,
      dateRange: {
        earliest: earliestDate,
        latest: latestDate,
        totalLineItems: lineItems.length
      }
    }
    
    return res.status(200).json(response)
  } catch (err) {
    console.error("Error fetching top services:", err)
    return res.status(500).json({ error: "Failed to fetch top services" })
  }
}

export const getSalesBreakdown = async (req: Request, res: Response) => {
  try {
    // Get branch filter from query params
    const { branches } = req.query
    let branchFilter: any = {}
    
    // Handle branch filtering
    if (branches && typeof branches === 'string') {
      const branchArray = branches.split(',').filter(b => b.trim())
      
      // Map frontend branch IDs to actual branch_ids
      const branchIdMap: { [key: string]: string } = {
        "1": "SMVAL-B-NCR",    // SM Valenzuela
        "2": "VAL-B-NCR",      // Valenzuela  
        "3": "SMGRA-B-NCR"     // SM Grand
      }
      
      // If "4" (Total) is selected or no specific branches, don't filter
      if (!branchArray.includes("4") && branchArray.length > 0) {
        const actualBranchIds = branchArray
          .map(b => branchIdMap[b])
          .filter(Boolean) // Remove undefined values
        
        if (actualBranchIds.length > 0) {
          branchFilter = { branch_id: { $in: actualBranchIds } }
        }
      }
    }
    
    // Get all transactions with branch filtering
    const transactions = await Transaction.find(branchFilter).lean()
    
    // Calculate counts and amounts by payment status
    const statusData = {
      "NP": { count: 0, amount: 0 },
      "PARTIAL": { count: 0, amount: 0 },
      "PAID": { count: 0, amount: 0 }
    }
    
    transactions.forEach((transaction: any) => {
      const status = transaction.payment_status as keyof typeof statusData
      if (status in statusData) {
        statusData[status].count++
        
        // Calculate amount based on payment status
        const totalAmount = Number(transaction.total_amount || 0)
        const amountPaid = Number(transaction.amount_paid || 0)
        
        if (status === "PAID") {
          // For paid transactions, use total amount
          statusData[status].amount += totalAmount
        } else if (status === "PARTIAL") {
          // For partial transactions, use amount paid
          statusData[status].amount += amountPaid
        } else if (status === "NP") {
          // For unpaid transactions, use total amount (what's owed)
          statusData[status].amount += totalAmount
        }
      }
    })
    
    // Calculate date range from transactions
    let earliestDate: Date | null = null
    let latestDate: Date | null = null
    
    transactions.forEach((transaction: any) => {
      const dateIn = new Date(transaction.date_in)
      if (!earliestDate || dateIn < earliestDate) {
        earliestDate = dateIn
      }
      if (!latestDate || dateIn > latestDate) {
        latestDate = dateIn
      }
    })
    
    // Build response data
    const salesBreakdownData = [
      {
        status: "Unpaid",
        transactions: statusData.NP.count,
        amount: statusData.NP.amount,
        fill: "#FF2056"
      },
      {
        status: "Partially Paid", 
        transactions: statusData.PARTIAL.count,
        amount: statusData.PARTIAL.amount,
        fill: "#78e8a1ff"
      },
      {
        status: "Paid",
        transactions: statusData.PAID.count,
        amount: statusData.PAID.amount,
        fill: "#FACC15"
      }
    ]
    
    // Include date range in response
    const response = {
      data: salesBreakdownData,
      dateRange: {
        earliest: earliestDate,
        latest: latestDate,
        totalTransactions: transactions.length
      }
    }
    
    return res.status(200).json(response)
  } catch (err) {
    console.error("Error fetching sales breakdown:", err)
    return res.status(500).json({ error: "Failed to fetch sales breakdown" })
  }
}

// Helper function to assign colors to services
function getServiceColor(serviceId: string): string {
  const colorMap: { [key: string]: string } = {
    "SERVICE-1": "#FF2056",
    "SERVICE-2": "#FACC15", 
    "SERVICE-3": "#FB923C",
    "COLOR-RENEWAL": "#8B5CF6"
  }
  return colorMap[serviceId] || "#888888"
}
