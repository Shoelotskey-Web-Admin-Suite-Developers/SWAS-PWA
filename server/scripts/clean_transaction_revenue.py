#!/usr/bin/env python3
"""
clean_transaction_revenue.py

Produce a cleaned CSV with columns: date_time,transaction_id,revenue,branch_id
from generated JSON/CSV files. Only completed transactions (date_out not null)
are included. Revenue is the sum of payments for the transaction.

Usage:
  python clean_transaction_revenue.py --transactions test_transactions.json --payments test_payments.json --out cleaned_transactions_revenue.csv
"""
from __future__ import annotations

import argparse
import csv
import json
import os
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List


def read_json(path: str) -> List[Dict[str, Any]]:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def parse_date(v):
    if v is None:
        return None
    if isinstance(v, datetime):
        return v
    try:
        # try ISO formats
        return datetime.fromisoformat(v)
    except Exception:
        # try some common formats
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                return datetime.strptime(v, fmt)
            except Exception:
                continue
    return None


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--transactions', required=True)
    p.add_argument('--payments', required=True)
    p.add_argument('--out', default='cleaned_transactions_revenue.csv')
    return p.parse_args()


def to_float(v):
    try:
        return float(v)
    except Exception:
        return 0.0


def main():
    args = parse_args()

    tx_rows = read_json(args.transactions)
    pay_rows = read_json(args.payments)

    # Sum payments by transaction_id
    payments_by_tx = defaultdict(float)
    for p in pay_rows:
        txid = p.get('transaction_id') or p.get('transactionId')
        if not txid:
            continue
        amt = to_float(p.get('payment_amount') or p.get('amount') or p.get('payment') or 0)
        payments_by_tx[str(txid)] += amt

    out_path = args.out
    os.makedirs(os.path.dirname(out_path) or '.', exist_ok=True)

    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['date_time', 'transaction_id', 'revenue', 'branch_id'])

        for r in tx_rows:
            date_out_raw = r.get('date_out')
            date_out_dt = parse_date(date_out_raw) if date_out_raw not in (None, '', 'null') else None
            if date_out_dt is None:
                continue

            txid = r.get('transaction_id') or r.get('transactionId')
            branch = r.get('branch_id') or r.get('branchId') or r.get('branch')
            revenue = round(payments_by_tx.get(str(txid), 0.0), 2)

            # Use ISO 8601 datetime string for date_time
            date_time_str = date_out_dt.isoformat()
            writer.writerow([date_time_str, str(txid), f"{revenue:.2f}", branch])

    print(f'Wrote cleaned CSV to {out_path}')


if __name__ == '__main__':
    main()
