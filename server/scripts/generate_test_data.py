#!/usr/bin/env python3
"""
generate_test_data.py

Generate synthetic test data for transactions, line_items, customers, and payments.

Usage:
  python generate_test_data.py --count 1000 --out-dir ./output --seed 42

Requires:
  pip install faker

This script mirrors the project's ID formats and field shapes based on the
server/src models and controllers. It does NOT insert into MongoDB; it only
writes four JSON files.
"""
from __future__ import annotations

import argparse
import json
import random
import uuid
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta
from faker import Faker
from typing import Dict, List, Optional

fake = Faker()


def pad(n: int, width: int = 5) -> str:
    return str(n).zfill(width)


@dataclass
class Customer:
    cust_id: str
    cust_name: str
    cust_bdate: Optional[str]
    cust_address: Optional[str]
    cust_email: Optional[str]
    cust_contact: Optional[str]
    total_services: int = 0
    total_expenditure: float = 0.0


@dataclass
class LineItemService:
    service_id: str
    quantity: int


@dataclass
class LineItem:
    line_item_id: str
    transaction_id: str
    priority: str
    cust_id: str
    services: List[LineItemService]
    storage_fee: float
    branch_id: str
    shoes: str
    current_location: str
    current_status: str
    due_date: Optional[str]
    latest_update: str
    before_img: Optional[str]
    after_img: Optional[str]


@dataclass
class Transaction:
    transaction_id: str
    line_item_id: List[str]
    branch_id: str
    date_in: str
    received_by: str
    date_out: Optional[str]
    cust_id: str
    no_pairs: int
    no_released: int
    total_amount: float
    discount_amount: float
    amount_paid: float
    payment_status: str
    payments: List[str]
    payment_mode: Optional[str]


@dataclass
class Payment:
    payment_id: str
    transaction_id: str
    payment_amount: float
    payment_mode: str
    payment_date: str


class Generator:
    def __init__(self, count: int = 1000, seed: Optional[int] = None, out_dir: str = "./", end_date: Optional[datetime] = None):
        self.count = count
        self.out_dir = out_dir
        if seed is not None:
            random.seed(seed)
            Faker.seed(seed)

        # mimic branches present in the app
        self.branches = [
            {"branch_id": "SMVAL-B-NCR", "branch_code": "SMVAL", "branch_number": 2},
            {"branch_id": "VAL-B-NCR", "branch_code": "VAL", "branch_number": 3},
            {"branch_id": "SMGRA-B-NCR", "branch_code": "SMGRA", "branch_number": 4},
        ]

        # simple service catalog fallback (service_id -> base_price)
        self.services_catalog = {
            "SERVICE-1": 325.0,
            "SERVICE-2": 450.0,
            "SERVICE-3": 575.0,
            "SERVICE-4": 125.0,
            "SERVICE-5": 125.0,
            "SERVICE-6": 225.0,
            "SERVICE-7": 150.0,
            "SERVICE-8": 275.0,
            "SERVICE-9": 375.0,
        }

        # in-memory counters to simulate generator behavior in controllers
        self.trx_counters_by_ym_branch: Dict[str, int] = defaultdict(int)
        self.payment_counters_by_branch: Dict[str, int] = defaultdict(int)
        self.customer_counters_by_branch: Dict[int, int] = defaultdict(int)

        # storage for output
        self.customers: Dict[str, Customer] = {}
        self.transactions: List[Transaction] = []
        self.line_items: List[LineItem] = []
        self.payments: List[Payment] = []
        # new datasets
        self.promos: List[dict] = []
        self.unavailability: List[dict] = []
        # Date window: last 3 months up to end_date (inclusive). Default end_date is provided by CLI.
        # We'll compute start_date as end_date - 90 days to approximate 3 months.
        if end_date is None:
            end_date = datetime(2025, 9, 23)
        self.end_date: datetime = end_date
        self.start_date: datetime = self.end_date - timedelta(days=90)

    # mirror generateTransactionId from controller
    def generate_transaction_id(self, branch_code: str, now: datetime) -> str:
        yearMonth = f"{now.year}-{str(now.month).zfill(2)}"
        key = f"{yearMonth}-{branch_code}"
        self.trx_counters_by_ym_branch[key] += 1
        return f"{yearMonth}-{pad(self.trx_counters_by_ym_branch[key])}-{branch_code}"

    # mirror generateLineItemId
    def generate_line_item_id(self, transaction_id: str, line_index: int) -> str:
        parts = transaction_id.split("-")
        year = parts[0]
        month = parts[1]
        trxIncrement = parts[2]
        branchCode = "-".join(parts[3:])
        return f"{year}-{month}-{trxIncrement}-{str(line_index+1).zfill(3)}-{branchCode}"

    # mirror generatePaymentId style: PAY-<increment>-<branch_code>
    def generate_payment_id(self, branch_code: str) -> str:
        self.payment_counters_by_branch[branch_code] += 1
        return f"PAY-{self.payment_counters_by_branch[branch_code]}-{branch_code}"

    def generate_customer_id(self, branch_number: int) -> str:
        self.customer_counters_by_branch[branch_number] += 1
        return f"CUST-{branch_number}-{self.customer_counters_by_branch[branch_number]}"

    def pick_branch(self) -> dict:
        return random.choice(self.branches)

    # promo id: PROMO-<3 digit>
    def generate_promo_id(self, idx: int) -> str:
        return f"PROMO-{str(idx).zfill(3)}"

    # unavailability id: UNAV-<3 digit>
    def generate_unavailability_id(self, idx: int) -> str:
        return f"UNAV-{str(idx).zfill(3)}"

    def maybe_reuse_customer(self, branch_number: int) -> Customer:
        # 70% chance to reuse an existing customer
        if self.customers and random.random() < 0.7:
            return random.choice(list(self.customers.values()))
        # otherwise create new
        cid = self.generate_customer_id(branch_number)
        name = fake.name()
        cust = Customer(
            cust_id=cid,
            cust_name=name,
            cust_bdate=str(fake.date_of_birth(minimum_age=18, maximum_age=80)),
            cust_address=fake.address(),
            cust_email=fake.unique.email(),
            cust_contact=fake.phone_number(),
        )
        self.customers[cid] = cust
        return cust

    def generate_one(self, now: datetime) -> None:
        branch = self.pick_branch()
        branch_code = branch["branch_code"]
        branch_id = branch["branch_id"]
        branch_number = branch["branch_number"]

        # check unavailability for this branch on this date
        date_str = str(now.date())
        # find unavailability entries matching branch and date
        u_list = [u for u in self.unavailability if u["branch_id"] == branch_id and u["date_unavailable"] == date_str]
        if u_list:
            # if any full day unavailability -> skip creating transactions
            if any(u.get("type") == "Full Day" for u in u_list):
                return
            # partial day -> reduce chance of transaction for this timestamp
            # we'll skip about 40-70% depending on partial duration
            if any(u.get("type") == "Partial Day" for u in u_list):
                if random.random() < 0.6:
                    return

        # customer (reuse or new)
        customer = self.maybe_reuse_customer(branch_number)

        # transaction id
        trx_id = self.generate_transaction_id(branch_code, now)

        # number of line items 1..3
        # promos on this branch/date increase likelihood of more line items and higher amounts
        promo_list = [p for p in self.promos if p["branch_id"] == branch_id and date_str in p["promo_dates"]]
        promo_boost = 1.0
        if promo_list:
            # each promo increases transaction size and frequency modestly
            promo_boost = 1.3 + 0.2 * (len(promo_list) - 1)

        num_line_items = random.randint(1, 3)
        if random.random() < 0.25 * promo_boost:
            num_line_items += 1
        created_line_ids: List[str] = []
        no_pairs = 0
        total_amount = 0.0

        for li_idx in range(num_line_items):
            line_id = self.generate_line_item_id(trx_id, li_idx)
            created_line_ids.append(line_id)

            # services: pick 1 service per line item, quantity 1..5
            svc_id = random.choice(list(self.services_catalog.keys()))
            qty = random.randint(1, 5)
            # promo increases quantity occasionally
            if promo_list and random.random() < 0.3:
                qty = min(8, int(qty * promo_boost))
            unit_price = self.services_catalog[svc_id]
            total_price = round(unit_price * qty, 2)

            line = LineItem(
                line_item_id=line_id,
                transaction_id=trx_id,
                priority=random.choice(["Normal", "Rush"]),
                cust_id=customer.cust_id,
                services=[LineItemService(service_id=svc_id, quantity=qty)],
                storage_fee=0.0,
                branch_id=branch_id,
                shoes=fake.word(),
                current_location=random.choice(["Hub", "Branch"]),
                current_status="Queued",
                due_date=None,
                latest_update=str(now),
                before_img=None,
                after_img=None,
            )

            self.line_items.append(line)
            no_pairs += qty
            total_amount += total_price

        # apply promo multiplier to total_amount
        total_amount = round(total_amount * promo_boost, 2)

        # decide status
        status = random.choices(["PAID", "PARTIAL", "NP"], weights=[0.6, 0.2, 0.2])[0]
        # map to Transaction.payment_status enum and our textual status
        payment_status = status

        amount_paid = total_amount if payment_status == "PAID" else (round(total_amount * random.uniform(0.2, 0.8), 2) if payment_status == "PARTIAL" else 0.0)

        # pick payment mode
        payment_mode = random.choice(["Cash", "GCash", "Bank", "Other"]) if amount_paid > 0 else None

        payments_list: List[str] = []
        if amount_paid > 0:
            payment_id = self.generate_payment_id(branch_code)
            payments_list.append(payment_id)
            payment = Payment(
                payment_id=payment_id,
                transaction_id=trx_id,
                payment_amount=amount_paid,
                payment_mode=payment_mode or "Cash",
                payment_date=str(now),
            )
            self.payments.append(payment)

        date_in = str(now - timedelta(days=random.randint(0, 30)))
        date_out = str(now) if payment_status == "PAID" else None

        trx = Transaction(
            transaction_id=trx_id,
            line_item_id=created_line_ids,
            branch_id=branch_id,
            date_in=date_in,
            received_by=fake.name(),
            date_out=date_out,
            cust_id=customer.cust_id,
            no_pairs=no_pairs,
            no_released=0,
            total_amount=total_amount,
            discount_amount=0.0,
            amount_paid=amount_paid,
            payment_status=payment_status,
            payments=payments_list,
            payment_mode=payment_mode,
        )

        # update customer totals
        customer.total_services += no_pairs
        customer.total_expenditure = round(customer.total_expenditure + total_amount, 2)

        self.transactions.append(trx)

    def generate(self):
        # pick random dates between start_date and end_date for each transaction
        total_days = (self.end_date - self.start_date).days
        # first, generate promos and unavailability across the date range
        self._generate_promos_and_unavailability()

        # create transactions taking promos/unavailability into account
        for i in range(self.count):
            # choose a random offset from start_date
            offset = random.randint(0, total_days)
            dt = self.start_date + timedelta(days=offset)
            # randomize time within the day
            dt = dt + timedelta(seconds=random.randint(0, 86399))
            # check unavailability for this branch/date (we will pick branch inside generate_one)
            self.generate_one(dt)

    def _generate_promos_and_unavailability(self):
        # Create a few promos per branch (more frequent than unavailability)
        date_cursor = self.start_date
        all_dates = [(self.start_date + timedelta(days=i)) for i in range((self.end_date - self.start_date).days + 1)]

        promo_idx = 1
        unav_idx = 1

        # frequency: promos roughly every ~10-20 days per branch
        for branch in self.branches:
            # generate 3-6 promo windows per branch in the date range
            num_promos = random.randint(3, 6)
            for _ in range(num_promos):
                # pick start day and length (1-7 days)
                start = random.choice(all_dates)
                length = random.randint(1, 7)
                dates = [start + timedelta(days=d) for d in range(length) if start + timedelta(days=d) <= self.end_date]
                if not dates:
                    continue
                promo = {
                    "promo_id": self.generate_promo_id(promo_idx),
                    "promo_title": f"{branch['branch_code']} Promo {promo_idx}",
                    "promo_description": random.choice(["Rainy season promo", "Weekend special", "Back-to-school"]),
                    "promo_dates": [str(d) for d in dates],
                    "promo_duration": f"{dates[0].date()} - {dates[-1].date()}",
                    "branch_id": branch["branch_id"],
                }
                self.promos.append(promo)
                promo_idx += 1

            # generate unavailability events at a monthly rate: 0-2 per month per branch
            # build list of months in the date range
            import calendar

            month_cursor = self.start_date.replace(day=1)
            months = []
            while month_cursor <= self.end_date:
                months.append((month_cursor.year, month_cursor.month))
                # advance month
                if month_cursor.month == 12:
                    month_cursor = month_cursor.replace(year=month_cursor.year + 1, month=1)
                else:
                    month_cursor = month_cursor.replace(month=month_cursor.month + 1)

            for (y, m) in months:
                # pick 0-2 unavailability events for this branch in this month
                num_unav_month = random.choices([0, 1, 2], weights=[0.6, 0.3, 0.1])[0]
                if num_unav_month == 0:
                    continue

                # determine bounds for days in this month clipped to start_date/end_date
                first_day = max(self.start_date.date(), datetime(y, m, 1).date())
                last_day_of_month = calendar.monthrange(y, m)[1]
                last_day = min(self.end_date.date(), datetime(y, m, last_day_of_month).date())
                if first_day > last_day:
                    continue

                for _ in range(num_unav_month):
                    day = first_day + timedelta(days=random.randint(0, (last_day - first_day).days))
                    typ = random.choices(["Full Day", "Partial Day"], weights=[0.3, 0.7])[0]
                    if typ == "Full Day":
                        ua = {
                            "unavailability_id": self.generate_unavailability_id(unav_idx),
                            "branch_id": branch["branch_id"],
                            "date_unavailable": str(day),
                            "type": typ,
                            "time_start": None,
                            "time_end": None,
                            "note": random.choice(["Holiday", "Maintenance", "Inventory"]),
                        }
                    else:
                        start_hour = random.randint(8, 14)
                        dur = random.randint(2, 6)
                        end_hour = min(18, start_hour + dur)
                        ua = {
                            "unavailability_id": self.generate_unavailability_id(unav_idx),
                            "branch_id": branch["branch_id"],
                            "date_unavailable": str(day),
                            "type": typ,
                            "time_start": f"{str(start_hour).zfill(2)}:00",
                            "time_end": f"{str(end_hour).zfill(2)}:00",
                            "note": random.choice(["Partial maintenance", "Team meeting", "Short holiday"]),
                        }
                    self.unavailability.append(ua)
                    unav_idx += 1

    def dump(self):
        out = self.out_dir.rstrip("/\\")
        # ensure path exists
        import os

        os.makedirs(out, exist_ok=True)

        tx_path = os.path.join(out, "transactions.json")
        li_path = os.path.join(out, "line_items.json")
        cu_path = os.path.join(out, "customers.json")
        pay_path = os.path.join(out, "payments.json")
        promos_path = os.path.join(out, "promos.json")
        unav_path = os.path.join(out, "unavailability.json")

        with open(tx_path, "w", encoding="utf-8") as f:
            json.dump([asdict(t) for t in self.transactions], f, indent=2, ensure_ascii=False)

        with open(li_path, "w", encoding="utf-8") as f:
            json.dump([asdict(li) for li in self.line_items], f, indent=2, ensure_ascii=False)

        with open(cu_path, "w", encoding="utf-8") as f:
            json.dump([asdict(c) for c in self.customers.values()], f, indent=2, ensure_ascii=False)

        with open(pay_path, "w", encoding="utf-8") as f:
            json.dump([asdict(p) for p in self.payments], f, indent=2, ensure_ascii=False)

        # dump promos and unavailability as JSON with model-like shapes
        with open(promos_path, "w", encoding="utf-8") as f:
            json.dump(self.promos, f, indent=2, ensure_ascii=False)

        with open(unav_path, "w", encoding="utf-8") as f:
            json.dump(self.unavailability, f, indent=2, ensure_ascii=False)

        return tx_path, li_path, cu_path, pay_path


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--count", type=int, default=1000)
    p.add_argument("--out-dir", type=str, default="./output")
    p.add_argument("--seed", type=int, default=None)
    p.add_argument("--end-date", type=str, default="2025-09-23", help="End date (YYYY-MM-DD) for generated transactions; start is 3 months before this date")
    return p.parse_args()


def main():
    args = parse_args()
    # parse end date
    try:
        end_date = datetime.strptime(args.end_date, "%Y-%m-%d") if hasattr(args, 'end_date') and args.end_date else None
    except Exception:
        print(f"Invalid end-date format: {args.end_date}. Use YYYY-MM-DD")
        return

    gen = Generator(count=args.count, seed=args.seed, out_dir=args.out_dir, end_date=end_date)
    print(f"Generating {args.count} transactions...")
    gen.generate()
    tx_path, li_path, cu_path, pay_path = gen.dump()
    print("Done. Files written:")
    print(tx_path)
    print(li_path)
    print(cu_path)
    print(pay_path)


if __name__ == "__main__":
    main()
