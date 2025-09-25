"use client"

import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, File } from "lucide-react"
import { getPairedRevenueData } from "@/utils/api/getForecastChart"
import { getDailyRevenue } from "@/utils/api/getDailyRevenue"
import { getMonthlyRevenue } from "@/utils/api/getMonthlyRevenue"
import { format } from "date-fns"
import * as XLSX from 'xlsx'



export function ExportButton() {
  
  const exportToExcel = async () => {
    try {
      // Fetch daily revenue, monthly growth, and forecast data
      const [salesOverTimeData, monthlyGrowthData, forecastData] = await Promise.all([
        getDailyRevenue(),
        getMonthlyRevenue(),
        getPairedRevenueData()
      ])

      // Create a new workbook
      const workbook = XLSX.utils.book_new()

      // Calculate daily averages for performance analysis
      const validDailyData = salesOverTimeData.filter(item => item.total && item.total > 0)
      const totalRevenue = validDailyData.reduce((sum, item) => sum + (item.total || 0), 0)
      const dailyAverage = validDailyData.length > 0 ? totalRevenue / validDailyData.length : 0
      
      const smValAvg = validDailyData.reduce((sum, item) => sum + (item.SMVal || 0), 0) / validDailyData.length
      const valAvg = validDailyData.reduce((sum, item) => sum + (item.Val || 0), 0) / validDailyData.length
      const smGraAvg = validDailyData.reduce((sum, item) => sum + (item.SMGra || 0), 0) / validDailyData.length

      // Sheet 1: Sales Over Time with Daily Performance
      const salesData = salesOverTimeData.map((item) => {
        const dailyTotal = item.total || 0
        const vsAverage = dailyTotal > 0 ? ((dailyTotal - dailyAverage) / dailyAverage * 100) : 0
        const performance = dailyTotal >= dailyAverage * 1.1 ? 'Above Average' : 
                           dailyTotal >= dailyAverage * 0.9 ? 'Average' : 'Below Average'
        
        return {
          'Date': item.date,
          'SM Valenzuela': item.SMVal || 0,
          'SM Val vs Avg': item.SMVal ? (((item.SMVal - smValAvg) / smValAvg * 100).toFixed(2) + '%') : '0%',
          'Valenzuela': item.Val || 0,
          'Val vs Avg': item.Val ? (((item.Val - valAvg) / valAvg * 100).toFixed(2) + '%') : '0%',
          'SM Grand': item.SMGra || 0,
          'SM Grand vs Avg': item.SMGra ? (((item.SMGra - smGraAvg) / smGraAvg * 100).toFixed(2) + '%') : '0%',
          'Total Daily Revenue': dailyTotal,
          'Daily Average': dailyAverage.toFixed(2),
          'Vs Daily Average': vsAverage.toFixed(2) + '%',
          'Performance': performance
        }
      })

      const salesWorksheet = XLSX.utils.json_to_sheet(salesData)
      
      // Format the sales worksheet
      const salesRange = XLSX.utils.decode_range(salesWorksheet['!ref'] || 'A1')
      
      // Add column widths
      salesWorksheet['!cols'] = [
        { width: 12 }, // Date
        { width: 15 }, // SM Valenzuela
        { width: 12 }, // SM Val vs Avg
        { width: 12 }, // Valenzuela
        { width: 12 }, // Val vs Avg
        { width: 12 }, // SM Grand
        { width: 15 }, // SM Grand vs Avg
        { width: 18 }, // Total Daily Revenue
        { width: 15 }, // Daily Average
        { width: 15 }, // Vs Daily Average
        { width: 15 }  // Performance
      ]

      // Format headers (row 1)
      for (let col = salesRange.s.c; col <= salesRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!salesWorksheet[cellAddress]) continue
        
        salesWorksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          },
          alignment: { horizontal: "center", vertical: "center" }
        }
      }

      // Format data rows
      for (let row = 1; row <= salesRange.e.r; row++) {
        for (let col = salesRange.s.c; col <= salesRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!salesWorksheet[cellAddress]) continue

          // Base formatting for all cells
          if (!salesWorksheet[cellAddress].s) salesWorksheet[cellAddress].s = {}
          
          // Add borders
          salesWorksheet[cellAddress].s.border = {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } }
          }

          // Number formatting for currency columns
          if (col === 1 || col === 3 || col === 5 || col === 7 || col === 8) { // Revenue columns
            salesWorksheet[cellAddress].s.numFmt = "#,##0.00"
          }
          
          // Center alignment for percentage and performance columns
          if (col === 2 || col === 4 || col === 6 || col === 9 || col === 10) { // Percentage columns
            salesWorksheet[cellAddress].s.alignment = { horizontal: "center" }
          }

          // Performance column conditional formatting
          if (col === 10) { // Performance column
            const value = salesWorksheet[cellAddress].v
            if (value === "Above Average") {
              salesWorksheet[cellAddress].s.fill = { fgColor: { rgb: "D1FAE5" } }
              salesWorksheet[cellAddress].s.font = { color: { rgb: "065F46" } }
            } else if (value === "Below Average") {
              salesWorksheet[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
              salesWorksheet[cellAddress].s.font = { color: { rgb: "991B1B" } }
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, salesWorksheet, 'Sales Over Time')

      // Sheet 2: Monthly Growth Analysis
      const monthlyData = monthlyGrowthData.map((item, index) => {
        const prevMonth = index > 0 ? monthlyGrowthData[index - 1] : null
        const growthRate = prevMonth ? 
          ((item.total - prevMonth.total) / prevMonth.total * 100).toFixed(2) + '%' : 
          'N/A'
        
        return {
          'Month': item.month,
          'SM Valenzuela': item.SMVal,
          'Valenzuela': item.Val,
          'SM Grand': item.SMGra,
          'Total Monthly Revenue': item.total,
          'Growth Rate (%)': growthRate
        }
      })

      const monthlyWorksheet = XLSX.utils.json_to_sheet(monthlyData)
      
      // Format the monthly worksheet
      const monthlyRange = XLSX.utils.decode_range(monthlyWorksheet['!ref'] || 'A1')
      
      // Add column widths for monthly sheet
      monthlyWorksheet['!cols'] = [
        { width: 12 }, // Month
        { width: 15 }, // SM Valenzuela
        { width: 12 }, // Valenzuela
        { width: 12 }, // SM Grand
        { width: 20 }, // Total Monthly Revenue
        { width: 15 }  // Growth Rate
      ]

      // Format headers (row 1)
      for (let col = monthlyRange.s.c; col <= monthlyRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!monthlyWorksheet[cellAddress]) continue
        
        monthlyWorksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "059669" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          },
          alignment: { horizontal: "center", vertical: "center" }
        }
      }

      // Format data rows
      for (let row = 1; row <= monthlyRange.e.r; row++) {
        for (let col = monthlyRange.s.c; col <= monthlyRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!monthlyWorksheet[cellAddress]) continue

          // Base formatting for all cells
          if (!monthlyWorksheet[cellAddress].s) monthlyWorksheet[cellAddress].s = {}
          
          // Add borders
          monthlyWorksheet[cellAddress].s.border = {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } }
          }

          // Number formatting for currency columns
          if (col === 1 || col === 2 || col === 3 || col === 4) { // Revenue columns
            monthlyWorksheet[cellAddress].s.numFmt = "#,##0.00"
          }
          
          // Center alignment for growth rate column
          if (col === 5) { // Growth Rate column
            monthlyWorksheet[cellAddress].s.alignment = { horizontal: "center" }
          }

          // Growth rate conditional formatting
          if (col === 5) { // Growth Rate column
            const value = monthlyWorksheet[cellAddress].v
            if (typeof value === 'string' && value.includes('%')) {
              const percentage = parseFloat(value.replace('%', ''))
              if (percentage > 0) {
                monthlyWorksheet[cellAddress].s.font = { color: { rgb: "059669" } }
              } else if (percentage < 0) {
                monthlyWorksheet[cellAddress].s.font = { color: { rgb: "DC2626" } }
              }
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, monthlyWorksheet, 'Monthly Growth')

      // Sheet 3: Forecast vs Actual Analysis
      const forecastComparisonData = forecastData.map((item: any) => {
        const hasActual = (item.SMVal != null) || (item.Val != null) || (item.SMGra != null)
        const actualTotal = hasActual ? (Number(item.SMVal ?? 0) + Number(item.Val ?? 0) + Number(item.SMGra ?? 0)) : null
        const forecastTotal = (Number(item.SMValFC ?? 0) + Number(item.ValFC ?? 0) + Number(item.SMGraFC ?? 0))
        
        const smValVariance = item.SMVal && item.SMValFC ? (((item.SMVal - item.SMValFC) / item.SMValFC) * 100).toFixed(2) + '%' : 'N/A'
        const valVariance = item.Val && item.ValFC ? (((item.Val - item.ValFC) / item.ValFC) * 100).toFixed(2) + '%' : 'N/A'
        const smGraVariance = item.SMGra && item.SMGraFC ? (((item.SMGra - item.SMGraFC) / item.SMGraFC) * 100).toFixed(2) + '%' : 'N/A'
        const totalVariance = actualTotal && forecastTotal ? (((actualTotal - forecastTotal) / forecastTotal) * 100).toFixed(2) + '%' : 'N/A'
        
        return {
          'Date': item.date,
          'SM Val Actual': item.SMVal || 0,
          'SM Val Forecast': item.SMValFC || 0,
          'SM Val Variance': smValVariance,
          'Val Actual': item.Val || 0,
          'Val Forecast': item.ValFC || 0,
          'Val Variance': valVariance,
          'SM Grand Actual': item.SMGra || 0,
          'SM Grand Forecast': item.SMGraFC || 0,
          'SM Grand Variance': smGraVariance,
          'Total Actual': actualTotal || 0,
          'Total Forecast': forecastTotal,
          'Total Variance': totalVariance,
          'Accuracy': actualTotal ? (100 - Math.abs(((actualTotal - forecastTotal) / forecastTotal) * 100)).toFixed(1) + '%' : 'N/A'
        }
      })

      const forecastWorksheet = XLSX.utils.json_to_sheet(forecastComparisonData)
      
      // Format the forecast worksheet
      const forecastRange = XLSX.utils.decode_range(forecastWorksheet['!ref'] || 'A1')
      
      // Add column widths for forecast sheet
      forecastWorksheet['!cols'] = [
        { width: 12 }, // Date
        { width: 15 }, // SM Val Actual
        { width: 15 }, // SM Val Forecast
        { width: 15 }, // SM Val Variance
        { width: 15 }, // Val Actual
        { width: 15 }, // Val Forecast
        { width: 15 }, // Val Variance
        { width: 15 }, // SM Grand Actual
        { width: 15 }, // SM Grand Forecast
        { width: 15 }, // SM Grand Variance
        { width: 15 }, // Total Actual
        { width: 15 }, // Total Forecast
        { width: 15 }, // Total Variance
        { width: 12 }  // Accuracy
      ]

      // Format headers (row 1)
      for (let col = forecastRange.s.c; col <= forecastRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!forecastWorksheet[cellAddress]) continue
        
        forecastWorksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "7C3AED" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          },
          alignment: { horizontal: "center", vertical: "center" }
        }
      }

      // Format data rows
      for (let row = 1; row <= forecastRange.e.r; row++) {
        for (let col = forecastRange.s.c; col <= forecastRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!forecastWorksheet[cellAddress]) continue

          // Base formatting for all cells
          if (!forecastWorksheet[cellAddress].s) forecastWorksheet[cellAddress].s = {}
          
          // Add borders
          forecastWorksheet[cellAddress].s.border = {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } }
          }

          // Number formatting for currency columns (actual and forecast)
          if ([1, 2, 4, 5, 7, 8, 10, 11].includes(col)) {
            forecastWorksheet[cellAddress].s.numFmt = "#,##0.00"
          }
          
          // Center alignment for variance and accuracy columns
          if ([3, 6, 9, 12, 13].includes(col)) {
            forecastWorksheet[cellAddress].s.alignment = { horizontal: "center" }
          }

          // Variance column conditional formatting
          if ([3, 6, 9, 12].includes(col)) { // Variance columns
            const value = forecastWorksheet[cellAddress].v
            if (typeof value === 'string' && value.includes('%') && value !== 'N/A') {
              const percentage = parseFloat(value.replace('%', ''))
              if (Math.abs(percentage) <= 5) { // Within 5% is good
                forecastWorksheet[cellAddress].s.fill = { fgColor: { rgb: "D1FAE5" } }
                forecastWorksheet[cellAddress].s.font = { color: { rgb: "065F46" } }
              } else if (Math.abs(percentage) > 20) { // Over 20% is concerning
                forecastWorksheet[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
                forecastWorksheet[cellAddress].s.font = { color: { rgb: "991B1B" } }
              }
            }
          }

          // Accuracy column conditional formatting
          if (col === 13) { // Accuracy column
            const value = forecastWorksheet[cellAddress].v
            if (typeof value === 'string' && value.includes('%') && value !== 'N/A') {
              const accuracy = parseFloat(value.replace('%', ''))
              if (accuracy >= 95) {
                forecastWorksheet[cellAddress].s.fill = { fgColor: { rgb: "D1FAE5" } }
                forecastWorksheet[cellAddress].s.font = { color: { rgb: "065F46" } }
              } else if (accuracy < 80) {
                forecastWorksheet[cellAddress].s.fill = { fgColor: { rgb: "FEE2E2" } }
                forecastWorksheet[cellAddress].s.font = { color: { rgb: "991B1B" } }
              }
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, forecastWorksheet, 'Forecast Analysis')

      // Sheet 4: Report Summary & Descriptions
      const summaryData = [
        { 'Section': 'ANALYTICS REPORT SUMMARY', 'Description': '', 'Value': '' },
        { 'Section': '', 'Description': '', 'Value': '' },
        { 'Section': 'Report Information', 'Description': '', 'Value': '' },
        { 'Section': 'Generated Date', 'Description': format(new Date(), 'PPPP'), 'Value': '' },
        { 'Section': 'Data Period', 'Description': `${validDailyData.length} days of sales data`, 'Value': '' },
        { 'Section': 'Branches Included', 'Description': 'SM Valenzuela, Valenzuela, SM Grand Central', 'Value': '' },
        { 'Section': '', 'Description': '', 'Value': '' },
        { 'Section': 'Sheet Descriptions', 'Description': '', 'Value': '' },
        { 'Section': 'Sales Over Time', 'Description': 'Daily revenue with performance vs averages', 'Value': 'Performance indicators and variance analysis' },
        { 'Section': 'Monthly Growth', 'Description': 'Monthly totals with growth rate calculations', 'Value': 'Month-over-month percentage changes' },
        { 'Section': 'Forecast Analysis', 'Description': 'Actual vs forecasted revenue comparison', 'Value': 'Variance analysis and accuracy metrics' },
        { 'Section': '', 'Description': '', 'Value': '' },
        { 'Section': 'Key Metrics', 'Description': '', 'Value': '' },
        { 'Section': 'Daily Average Revenue', 'Description': `₱${dailyAverage.toFixed(2)}`, 'Value': `Based on ${validDailyData.length} days` },
        { 'Section': 'Total Revenue (Period)', 'Description': `₱${totalRevenue.toLocaleString()}`, 'Value': 'All branches combined' },
        { 'Section': 'SM Valenzuela Avg', 'Description': `₱${smValAvg.toFixed(2)}`, 'Value': 'Daily average' },
        { 'Section': 'Valenzuela Avg', 'Description': `₱${valAvg.toFixed(2)}`, 'Value': 'Daily average' },
        { 'Section': 'SM Grand Avg', 'Description': `₱${smGraAvg.toFixed(2)}`, 'Value': 'Daily average' },
        { 'Section': '', 'Description': '', 'Value': '' },
        { 'Section': 'Performance Classifications', 'Description': '', 'Value': '' },
        { 'Section': 'Above Average', 'Description': '≥110% of average revenue', 'Value': 'Green highlighting' },
        { 'Section': 'Average', 'Description': '90-110% of average revenue', 'Value': 'Standard formatting' },
        { 'Section': 'Below Average', 'Description': '<90% of average revenue', 'Value': 'Red highlighting' },
        { 'Section': '', 'Description': '', 'Value': '' },
        { 'Section': 'Forecast Accuracy', 'Description': '', 'Value': '' },
        { 'Section': 'Excellent', 'Description': '≥95% accuracy', 'Value': 'Green highlighting' },
        { 'Section': 'Good', 'Description': '80-94% accuracy', 'Value': 'Standard formatting' },
        { 'Section': 'Needs Improvement', 'Description': '<80% accuracy', 'Value': 'Red highlighting' },
      ]

      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
      
      // Add column widths for summary sheet
      summaryWorksheet['!cols'] = [
        { width: 25 }, // Section
        { width: 40 }, // Description
        { width: 30 }  // Value
      ]

      // Format summary sheet
      const summaryRange = XLSX.utils.decode_range(summaryWorksheet['!ref'] || 'A1')
      
      for (let row = 0; row <= summaryRange.e.r; row++) {
        for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!summaryWorksheet[cellAddress]) continue

          if (!summaryWorksheet[cellAddress].s) summaryWorksheet[cellAddress].s = {}
          
          // Header row styling
          if (row === 0) {
            summaryWorksheet[cellAddress].s = {
              font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "1F2937" } },
              alignment: { horizontal: "center", vertical: "center" }
            }
          }
          // Section headers
          else if (summaryWorksheet[cellAddress].v && col === 0 && 
                   ['Report Information', 'Sheet Descriptions', 'Key Metrics', 'Performance Classifications', 'Forecast Accuracy'].includes(summaryWorksheet[cellAddress].v)) {
            summaryWorksheet[cellAddress].s = {
              font: { bold: true, size: 12, color: { rgb: "1F2937" } },
              fill: { fgColor: { rgb: "F3F4F6" } },
              alignment: { horizontal: "left", vertical: "center" }
            }
          }
          // Regular content
          else {
            summaryWorksheet[cellAddress].s = {
              font: { size: 10 },
              alignment: { horizontal: "left", vertical: "center", wrapText: true }
            }
          }
        }
      }

      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Report Summary')

      // Generate Excel file and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
      })
      
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `analytics-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting Excel:", error)
    }
  }

  const exportToJSON = async () => {
    try {
      const rawData = await getPairedRevenueData()
      
      // Process data
      const exportData = rawData.map((item: any) => {
        const hasActual = (item.SMVal != null) || (item.Val != null) || (item.SMGra != null)
        return {
          date: item.date,
          actual: {
            SMValenzuela: Number(item.SMVal ?? 0),
            Valenzuela: Number(item.Val ?? 0),
            SMGrand: Number(item.SMGra ?? 0),
            total: hasActual ? (Number(item.SMVal ?? 0) + Number(item.Val ?? 0) + Number(item.SMGra ?? 0)) : null,
          },
          forecast: {
            SMValenzuela: Number(item.SMValFC ?? 0),
            Valenzuela: Number(item.ValFC ?? 0),
            SMGrand: Number(item.SMGraFC ?? 0),
            total: Number(item.SMValFC ?? 0) + Number(item.ValFC ?? 0) + Number(item.SMGraFC ?? 0),
          }
        }
      })

      // Create JSON content
      const jsonContent = JSON.stringify({
        exportDate: new Date().toISOString(),
        dataPoints: exportData.length,
        data: exportData
      }, null, 2)

      // Download JSON
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `analytics-data-${format(new Date(), "yyyy-MM-dd")}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting JSON:", error)
    }
  }

  const generateReport = async () => {
    try {
      const rawData = await getPairedRevenueData()
      
      // Process data for report
      const processedData = rawData.map((item: any) => {
        const hasActual = (item.SMVal != null) || (item.Val != null) || (item.SMGra != null)
        return {
          ...item,
          total: hasActual ? (Number(item.SMVal ?? 0) + Number(item.Val ?? 0) + Number(item.SMGra ?? 0)) : null,
        }
      })
      
      const actualRows = processedData.filter((d: any) => d.total != null)
      
      // Calculate analytics
      const totalRevenue = actualRows.reduce((sum, row) => sum + Number(row.total ?? 0), 0)
      const avgDailyRevenue = totalRevenue / actualRows.length
      
      const branchTotals = {
        SMVal: actualRows.reduce((sum, row) => sum + Number(row.SMVal ?? 0), 0),
        Val: actualRows.reduce((sum, row) => sum + Number(row.Val ?? 0), 0),
        SMGra: actualRows.reduce((sum, row) => sum + Number(row.SMGra ?? 0), 0),
      }

      // Create report content
      const reportContent = `
SWAS Analytics Report
Generated: ${format(new Date(), "PPPP")}
==================================================

SUMMARY METRICS
- Total Revenue: ₱${totalRevenue.toLocaleString()}
- Average Daily Revenue: ₱${Math.round(avgDailyRevenue).toLocaleString()}
- Data Period: ${actualRows.length} days
- Report Period: ${actualRows[0]?.date} to ${actualRows[actualRows.length - 1]?.date}

BRANCH PERFORMANCE
- SM Valenzuela: ₱${branchTotals.SMVal.toLocaleString()} (${(branchTotals.SMVal/totalRevenue*100).toFixed(1)}%)
- Valenzuela: ₱${branchTotals.Val.toLocaleString()} (${(branchTotals.Val/totalRevenue*100).toFixed(1)}%)  
- SM Grand: ₱${branchTotals.SMGra.toLocaleString()} (${(branchTotals.SMGra/totalRevenue*100).toFixed(1)}%)

DAILY BREAKDOWN
${actualRows.map(row => 
  `${row.date}: ₱${Number(row.total).toLocaleString()}`
).join('\n')}

==================================================
This report was automatically generated by SWAS Analytics.
      `.trim()

      // Download report
      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `analytics-report-${format(new Date(), "yyyy-MM-dd")}.txt`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <File className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateReport}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}