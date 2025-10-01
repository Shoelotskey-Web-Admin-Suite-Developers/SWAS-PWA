# SWAS-PWA

## Dynamic Branch Analytics (Overview)

The analytics subsystem no longer relies on hard-coded branch identifiers. Branches are fetched from the database and converted into `BranchMeta` objects that drive:

- Daily revenue trend & sales-over-time charts
- Monthly growth chart
- Actual vs Forecast pairing & forecast analysis
- Excel / PDF export generation

Each `BranchMeta` includes:

| Field | Description |
|-------|-------------|
| `branch_id` | Raw branch identifier from DB (e.g. `SMVAL-B-NCR`). |
| `branch_name` | Human readable branch name. |
| `numericId` | Stable deterministic base36 hash of `branch_id` (used for keys). |
| `color` | Deterministic HSL color derived from hash. |
| `dataKey` | Dynamic key used for actual revenue values in chart/export rows. |
| `forecastKey` | Dynamic key used for forecast values (same branch, dashed line). |

A synthetic TOTAL meta (branch_id = `TOTAL`) is appended for aggregation purposes; its color is neutral and only the `dataKey` is used (no forecast line for total forecast-only days; total is truncated after last actual).

### Forecast Normalization

`GET /api/analytics/forecast` now returns an array of objects:

```jsonc
[
	{
		"date": "2024-09-21",
		"total": 123456,
		"branches": {
			"SMVAL-B-NCR": 40000,
			"VAL-B-NCR": 50000,
			"SMGRA-B-NCR": 33456
		}
	}
]
```

The frontend dynamic pairing utility (`getPairedRevenueDataDynamic`) consumes *both* daily actual and forecast endpoints and produces unified rows, inserting `null` for `total` on forecast-only rows so the cumulative total line visually stops at the last actual date.

### Deprecated Legacy Utilities

The former `getForecastChart.tsx` (regex / pattern based) has been removed. Any historical imports must be updated to:

```ts
import { getPairedRevenueDataDynamic } from '@/utils/api/getPairedRevenueDataDynamic'
```

If you see errors referencing `getPairedRevenueData`, you are using an outdated import path.

### Adding New Branches

1. Insert the new branch in the database (branches collection) with `type: 'B'`.
2. No code changes required; it will appear automatically in analytics & exports with a deterministic color.
3. Exports (Excel/PDF) will include the new branch columns and forecast metrics automatically.

### Deterministic Colors & IDs

Colors derive from a FNV-1a hash of `branch_id`, mapped into an HSL hue space with controlled saturation & lightness for visual consistency. Numeric IDs use the same hash (base36) to remain stable even if branch ordering changes.

### Remaining Static Areas (To Refactor)

Some service / sales breakdown endpoints still contain a hardcoded map for branch filtering. These are isolated and can be migrated to a dynamic approach by performing a DB lookup of branch documents and mapping query `branches` to `branch_id` values.

---
For further internal implementation details see inline comments in:

- `client/src/utils/analytics/branchMeta.ts`
- `client/src/utils/api/getPairedRevenueDataDynamic.ts`
- `server/src/controllers/analyticsController.ts` (forecast & monthly handlers)

Feel free to extend this section as new analytics features ship.