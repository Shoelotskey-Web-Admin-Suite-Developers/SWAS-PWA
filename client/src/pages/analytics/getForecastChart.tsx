export interface DailyRevenueItem {
  date: string
  SMVal?: number
  Val?: number
  SMGra?: number
}

export interface DailyRevenueForecastItem {
  date: string
  SMValFC: number
  ValFC: number
  SMGraFC: number
}

export async function getPairedRevenueData() {
  // 1. Fetch both JSON files
  const [actualRes, forecastRes] = await Promise.all([
    fetch("/dummy-data/daily_revenue.json"),
    fetch("/dummy-data/daily_revenue_forecast.json")
  ])

  if (!actualRes.ok || !forecastRes.ok) {
    throw new Error("Failed to fetch one or both data sources")
  }

  const actualData: DailyRevenueItem[] = await actualRes.json()
  const forecastData: DailyRevenueForecastItem[] = await forecastRes.json()

  // 2. Get the latest 7 days from actual data
  const latestActual = actualData.slice(-7)

  // 3. Pair actual + forecast for the first 7 days
  const pairedFirst7 = latestActual.map(actual => {
    const forecast = forecastData.find(f => f.date === actual.date)
    return {
      date: actual.date,
      SMVal: actual.SMVal,
      Val: actual.Val,
      SMGra: actual.SMGra,
      SMValFC: forecast?.SMValFC,
      ValFC: forecast?.ValFC,
      SMGraFC: forecast?.SMGraFC
    }
  })

  // 4. Get the remaining forecast-only days
  const forecastOnly = forecastData
    .filter(f => !latestActual.some(a => a.date === f.date))
    .map(forecast => ({
      date: forecast.date,
      SMValFC: forecast.SMValFC,
      ValFC: forecast.ValFC,
      SMGraFC: forecast.SMGraFC
    }))

  // 5. Return combined array
  return [...pairedFirst7, ...forecastOnly]
}
