export interface DailyRevenueItem {
  date: string
  SMVal?: number | null
  Val?: number | null
  SMGra?: number | null
}

export interface DailyRevenueForecastItem {
  date: string
  SMValFC?: number | null
  ValFC?: number | null
  SMGraFC?: number | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getPairedRevenueData() {
  // 1. Fetch both collections from server API (use API_BASE_URL if present)
  const base = API_BASE_URL && API_BASE_URL.length > 0
    ? API_BASE_URL.replace(/\/$/, "")
    : "http://localhost:5000"
  if (!API_BASE_URL) console.warn("VITE_API_BASE_URL not set — defaulting to http://localhost:5000 for analytics fetches")
  const actualUrl = `${base}/api/analytics/daily-revenue`
  const forecastUrl = `${base}/api/analytics/forecast`

  const [actualRes, forecastRes] = await Promise.all([
    fetch(actualUrl),
    fetch(forecastUrl),
  ])

  // If either returned non-OK, try to surface the body (HTML or error JSON)
  if (!actualRes.ok) {
    const body = await actualRes.text()
    throw new Error(`Failed to fetch daily revenue (${actualRes.status}): ${body.slice(0, 300)}`)
  }
  if (!forecastRes.ok) {
    const body = await forecastRes.text()
    throw new Error(`Failed to fetch forecast (${forecastRes.status}): ${body.slice(0, 300)}`)
  }

  // Ensure responses are JSON - if server returned HTML (e.g. index.html) this will help debug
  const contentTypeA = actualRes.headers.get("content-type") || ""
  const contentTypeF = forecastRes.headers.get("content-type") || ""
  if (!contentTypeA.includes("application/json")) {
    const text = await actualRes.text()
    throw new Error(`daily-revenue did not return JSON (content-type: ${contentTypeA}). Response preview: ${text.slice(0,300)}`)
  }
  if (!contentTypeF.includes("application/json")) {
    const text = await forecastRes.text()
    throw new Error(`forecast did not return JSON (content-type: ${contentTypeF}). Response preview: ${text.slice(0,300)}`)
  }

  // API returns DB records; transform into the expected shapes
  const actualDataRaw: any[] = await actualRes.json()
  const forecastDataRaw: any[] = await forecastRes.json()

  // Debug: log raw payloads so we can inspect actual key names in the browser console
  try {
    console.debug("daily-revenue raw sample", actualDataRaw.slice(0, 10))
  } catch (e) {
    /* ignore debug errors in non-browser env */
  }
  try {
    console.debug("forecast raw sample", forecastDataRaw.slice(0, 10))
  } catch (e) {
    /* ignore debug errors in non-browser env */
  }
  // also log the keys present on the first record to make mapping obvious
  if (actualDataRaw.length > 0) {
    try { console.debug("daily-revenue first keys", Object.keys(actualDataRaw[0])) } catch (e) {}
  }
  if (forecastDataRaw.length > 0) {
    try { console.debug("forecast first keys", Object.keys(forecastDataRaw[0])) } catch (e) {}
  }

  // Convert DB records into arrays of simple objects with date string and branch fields
  // Auto-detect branch code keys present in the data so mapping isn't hard-coded
  // Helper: find first matching branch value in a record using regex patterns
  function findBranchValue(r: any, patterns: RegExp[]): number | null | undefined {
    if (!r) return null
    const keys: string[] = []
    // collect top-level keys
    Object.keys(r || {}).forEach((k) => keys.push(k))
    // collect branch map keys if present
    if (r.branches && typeof r.branches === "object") {
      if (Array.isArray(r.branches)) {
        // array of branch objects: collect possible identifier keys and index keys
        r.branches.forEach((el: any, idx: number) => {
          if (el && typeof el === "object") {
            Object.keys(el).forEach((k) => keys.push(k))
            // also add a synthetic key for direct index access
            keys.push(String(idx))
          }
        })
      } else {
        Object.keys(r.branches).forEach((k) => keys.push(k))
      }
    }

    for (const pattern of patterns) {
      for (const k of keys) {
        if (pattern.test(k)) {
          // prefer branches map value if exists
          if (r.branches) {
            if (r.branches[k] !== undefined) return r.branches[k]
            if (Array.isArray(r.branches)) {
              // check elements for matching identifier or numeric index
              for (const el of r.branches) {
                if (!el || typeof el !== "object") continue
                // common shapes: { code: 'SMVAL-B-NCR', value: 123 } or { branch: 'SMVAL', amount: 123 }
                const valByCommon = el.value ?? el.amount ?? el.total ?? el["amountPhp"] ?? el["revenue"]
                const idCandidates = [el.code, el.branch, el.name, el.id]
                for (const idc of idCandidates) {
                  if (typeof idc === "string" && pattern.test(idc) && valByCommon !== undefined) return valByCommon
                }
                // also if any key on el matches the pattern and its value is numeric, return it
                for (const ek of Object.keys(el)) {
                  if (pattern.test(ek) && typeof el[ek] === "number") return el[ek]
                }
              }
            }
          }
          if (r[k] !== undefined) return r[k]
        }
      }
    }

    // fallback to explicit fields
    for (const k of ["SMVal", "Val", "SMGra"]) {
      if (r[k] !== undefined) return r[k]
    }

    return null
  }

  const patterns = {
    SMVal: [/SMVAL/i, /SM VAL/i],
    Val: [/\bVAL\b/i],
    SMGra: [/SMGRA/i, /SM GRA/i, /SM GRAND/i],
  }

  const actualData: DailyRevenueItem[] = actualDataRaw.map((r) => ({
    date: new Date(r.date).toISOString().slice(0, 10),
    SMVal: findBranchValue(r, patterns.SMVal as RegExp[]),
    Val: findBranchValue(r, patterns.Val as RegExp[]),
    SMGra: findBranchValue(r, patterns.SMGra as RegExp[]),
  }))

  const forecastData: DailyRevenueForecastItem[] = forecastDataRaw.map((r) => ({
    date: new Date(r.date).toISOString().slice(0, 10),
    SMValFC: findBranchValue(r, patterns.SMVal as RegExp[]) ?? undefined,
    ValFC: findBranchValue(r, patterns.Val as RegExp[]) ?? undefined,
    SMGraFC: findBranchValue(r, patterns.SMGra as RegExp[]) ?? undefined,
  }))

  // 2. Get the latest 7 days from actual data, excluding today
  // Ensure actualData is sorted chronologically
  const actualSorted = [...actualData].sort((a, b) => {
    const ta = Date.parse(a.date)
    const tb = Date.parse(b.date)
    if (!isNaN(ta) && !isNaN(tb)) return ta - tb
    return String(a.date).localeCompare(String(b.date))
  })

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const actualBeforeToday = actualSorted.filter(a => String(a.date) < todayStr)
  const latestActual = actualBeforeToday.slice(-7)

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
  // Keep paired actual+forecast first (in chronological order), then append forecast-only days
  // Combine paired and forecast-only, then sort globally so earliest dates appear first
  let combined = [...pairedFirst7, ...forecastOnly]
  // Merge entries by date, preferring actual values (SMVal/Val/SMGra) when duplicates exist
  const mergedByDate = new Map<string, any>()
  for (const it of combined) {
    const d = String(it.date)
    const existing = mergedByDate.get(d)
    if (!existing) {
      mergedByDate.set(d, { ...it })
      continue
    }

    // merge: prefer non-null actuals, and prefer non-null forecasts
    const merged: any = { ...existing }
    for (const k of Object.keys(it)) {
      const v = (it as any)[k]
      if (v != null) {
        // if existing has null/undefined, or this is an actual value for SMVal/Val/SMGra, replace
        if (merged[k] == null) merged[k] = v
        else if (/(SMVal|Val|SMGra)$/.test(k) && v != null) merged[k] = v
        else if (/(SMValFC|ValFC|SMGraFC)$/.test(k) && v != null) merged[k] = v
      }
    }
    mergedByDate.set(d, merged)
  }

  // Create final array and sort chronologically by timestamp (robust to formats)
  const finalCombined = Array.from(mergedByDate.values()).sort((a, b) => {
    const ta = Date.parse(a.date)
    const tb = Date.parse(b.date)
    if (!isNaN(ta) && !isNaN(tb)) return ta - tb
    return String(a.date).localeCompare(String(b.date))
  })

  combined = finalCombined

  // Helpful debug: log the combined payload so chart components can be verified
  console.debug("pairedRevenueData (sorted)", combined.slice(0, 50))

  // Log any items missing branch fields (helps identify mapping gaps)
  const missing = (combined as any[]).filter((it) => it.SMVal == null && it.Val == null && it.SMGra == null)
  if (missing.length) console.warn("pairedRevenueData: items with no branch values:", missing.map(m => m.date))

  return combined
}
