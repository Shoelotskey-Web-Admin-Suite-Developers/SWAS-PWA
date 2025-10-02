import { BranchMeta } from '@/utils/analytics/branchMeta';

export interface DynamicPairedRow {
  date: string;
  [key: string]: any; // dynamic branch keys + totals
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RevenueDataOptions {
  lookbackDays?: number;       // how many past actual days to include (default 7)
  includeToday?: boolean;      // include today's actual row if present (default true)
  strictPastOnly?: boolean;    // if true, never include today's partial actual even if exists
  fullRange?: boolean;         // if true, ignore lookbackDays and build full consecutive range from earliest to lastActualDate
}

export async function getPairedRevenueDataDynamic(
  branchMeta: BranchMeta[],
  options: RevenueDataOptions = {}
): Promise<DynamicPairedRow[]> {
  const {
    lookbackDays = 7,
    includeToday = true,
    strictPastOnly = false,
    fullRange = false,
  } = options;

  const base = API_BASE_URL && API_BASE_URL.length > 0 ? API_BASE_URL.replace(/\/$/, '') : 'http://localhost:5000';
  const debugMode = typeof window !== 'undefined' && window.location.search.includes('revDebug');

  const [actualRes, forecastRes] = await Promise.all([
    fetch(`${base}/api/analytics/daily-revenue`).catch(e => { throw new Error('Network error daily revenue: '+e); }),
    fetch(`${base}/api/analytics/forecast`).catch(e => { throw new Error('Network error forecast: '+e); }),
  ]);
  if (!actualRes.ok) throw new Error('Failed to fetch daily revenue');
  if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
  const actualRaw: any[] = await actualRes.json();
  const forecastRaw: any[] = await forecastRes.json();
  if (debugMode) {
    try { console.log('[revDebug] fetched actualRaw=', actualRaw.length, 'forecastRaw=', forecastRaw.length); } catch(_){}
  }
  // forecastRaw now expected (after backend normalization) to be an array of
  // { date: 'yyyy-MM-dd', total: number, branches: { [branch_id]: value } }
  // but we keep robust extraction for transitional or legacy shapes.

  function extract(record: any, branch_id: string): number | null {
    if (!record) return null;
    if (typeof record[branch_id] === 'number') return record[branch_id];
    if (record.branches) {
      const br = record.branches;
      if (Array.isArray(br)) {
        for (const e of br) {
          if (!e) continue;
          const ids = [e.branch_id, e.code, e.id, e.branch, e.name];
            if (ids.some(id => typeof id === 'string' && id.toUpperCase() === branch_id.toUpperCase())) {
              const val = e.value ?? e.amount ?? e.total ?? e.revenue;
              if (typeof val === 'number') return val;
            }
        }
      } else if (typeof br === 'object') {
        if (typeof br[branch_id] === 'number') return br[branch_id];
        // try case variants
        const alt = br[branch_id.toLowerCase()] ?? br[branch_id.toUpperCase()];
        if (typeof alt === 'number') return alt;
      }
    }
    const codePart = branch_id.split('-')[0];
    for (const k of Object.keys(record)) {
      if (k.toUpperCase().startsWith(codePart.toUpperCase()) && typeof record[k] === 'number') return record[k];
    }
    return null;
  }

  const normDate = (d: any) => {
    try {
      // If already ISO date string of length 10 use directly
      if (typeof d === 'string') {
        // Accept formats like YYYY-MM-DDTHH:mm:ssZ
        if (d.length >= 10) return d.slice(0,10);
      }
      return new Date(d).toISOString().slice(0,10);
    } catch {
      return String(d).slice(0,10);
    }
  };

  const actualSorted = [...actualRaw]
    .map(r => ({...r, _normDate: normDate(r.date)}))
    .sort((a,b) => a._normDate.localeCompare(b._normDate));

  const todayStr = normDate(new Date());

  // Determine last actual date to anchor window
  const eligibleActual = actualSorted.filter(r => {
    if (strictPastOnly) return r._normDate < todayStr;
    if (!includeToday) return r._normDate < todayStr;
    return r._normDate <= todayStr;
  });
  const lastActualDate = eligibleActual.length ? eligibleActual[eligibleActual.length - 1]._normDate : todayStr;

  // Decide date span
  let windowDates: string[] = [];
  if (fullRange && eligibleActual.length) {
    const firstDate = eligibleActual[0]._normDate;
    const start = new Date(firstDate);
    const end = new Date(lastActualDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      windowDates.push(normDate(d));
    }
  } else {
    for (let i = lookbackDays - 1; i >= 0; i--) {
      const d = new Date(lastActualDate);
      d.setDate(d.getDate() - i);
      windowDates.push(normDate(d));
    }
  }
  // Build latestWindow by matching existing actuals for those dates
  const actualMap = new Map(eligibleActual.map(r=> [r._normDate, r]));
  const missingDates: string[] = [];
  const latestWindow = windowDates.map(ds => {
    const found = actualMap.get(ds);
    if (!found) missingDates.push(ds);
    return found || { _normDate: ds, date: ds, total: 0, branches: {}, __filler: true };
  });
  if (debugMode) {
  try { console.log('[revDebug] calendarWindow=', windowDates, 'missingFilled=', missingDates, 'mode=', fullRange ? 'fullRange' : `last-${lookbackDays}`); } catch(_){}
  }
  const forecastMap = new Map<string, any>();
  forecastRaw.forEach(f => {
    const ds = normDate(f.date);
    forecastMap.set(ds, f);
  });

  function buildRow(dateStr: string, a?: any, f?: any): DynamicPairedRow {
    const row: DynamicPairedRow = { date: dateStr };
    let actualTotal = 0; let forecastTotal = 0;
    for (const meta of branchMeta) {
      if (meta.branch_id === 'TOTAL') continue;
      const val = a ? extract(a, meta.branch_id) : null;
      const fval = f ? extract(f, meta.branch_id) : null;
      if (val != null) { row[meta.dataKey] = val; actualTotal += Number(val)||0; }
      if (fval != null) { row[meta.forecastKey] = fval; forecastTotal += Number(fval)||0; }
    }
    // Only show total for rows that have actual data; hide (null) for forecast-only rows
    if (a) {
      row.total = actualTotal; // allow zero
    } else {
      row.total = null;
    }
    row.totalFC = forecastTotal;
    // Legacy compatibility
    const legacy: Record<string,string> = { 'SMVAL-B-NCR':'SMVal','VAL-B-NCR':'Val','SMGRA-B-NCR':'SMGra' };
    for (const meta of branchMeta) {
      const legacyKey = legacy[meta.branch_id];
      if (legacyKey && row[meta.dataKey] != null) row[legacyKey] = row[meta.dataKey];
      if (legacyKey && row[meta.forecastKey] != null) row[legacyKey+'FC'] = row[meta.forecastKey];
    }
    return row;
  }

  const rows: DynamicPairedRow[] = [];
  latestWindow.forEach(a => {
    rows.push(buildRow(a._normDate, a.total !== undefined ? a : undefined, forecastMap.get(a._normDate)));
  });

  // Forecast should start at the day after lastActualDate for clarity
  const forecastStartDay = new Date(lastActualDate);
  forecastStartDay.setDate(forecastStartDay.getDate() + 1);
  const forecastStartStr = normDate(forecastStartDay);
  forecastRaw.forEach(f => {
    const ds = normDate(f.date);
    if (ds >= forecastStartStr && !rows.some(r => r.date === ds)) {
      rows.push(buildRow(ds, undefined, f));
    }
  });
  rows.sort((a,b) => a.date.localeCompare(b.date));
  if (debugMode) {
    try { console.log('[revDebug] final rows=', rows.map(r=>({date:r.date,total:r.total,totalFC:r.totalFC}))); } catch(_){}
  }
  return rows;
}
