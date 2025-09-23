#!/usr/bin/env python3
"""
daily_revenue_to_json.py

Convert daily_revenue.csv to a JSON array where each element is:
{ "date": "YYYY-MM-DD", "BRANCH1": amount, "BRANCH2": amount, "total": sum }

Usage:
  python daily_revenue_to_json.py --csv server/scripts/output/daily_revenue.csv --out server/scripts/output/daily_revenue.json
"""
import argparse
import csv
import json
import os
from collections import defaultdict
from typing import Dict


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--csv', required=True)
    p.add_argument('--out', required=True)
    return p.parse_args()


def main():
    args = parse_args()
    rows_by_date = defaultdict(dict)
    branches_set = set()

    with open(args.csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            date = r.get('date')
            branch = r.get('branch_id')
            total_revenue = float(r.get('total_revenue') or 0)
            rows_by_date[date][branch] = round(total_revenue, 2)
            branches_set.add(branch)

    # Build JSON array
    out_list = []
    for date in sorted(rows_by_date.keys()):
        entry: Dict[str, float] = {'date': date}
        total = 0.0
        for b in sorted(branches_set):
            val = rows_by_date[date].get(b, 0.0)
            entry[b] = round(val, 2)
            total += val
        entry['total'] = round(total, 2)
        out_list.append(entry)

    os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(out_list, f, indent=2)

    print(f'Wrote {len(out_list)} records to {args.out}')


if __name__ == '__main__':
    main()
