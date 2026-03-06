#!/usr/bin/env python3
"""Update BTC-EUR monthly close data file from CoinGecko automatically."""

from __future__ import annotations

import argparse
import calendar
import datetime as dt
import json
import re
import sys
import urllib.request
from pathlib import Path

DATA_FILE = Path("assets/js/btc-powerlaw-data.js")
API_URL = (
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart"
    "?vs_currency=eur&days=max&interval=daily"
)


def fetch_daily_prices() -> list[tuple[dt.date, float]]:
    req = urllib.request.Request(
        API_URL,
        headers={"User-Agent": "bitcoinlenscodex-monthly-close-updater/1.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as response:  # noqa: S310
        payload = json.loads(response.read().decode("utf-8"))

    prices = payload.get("prices")
    if not isinstance(prices, list):
        raise RuntimeError("CoinGecko response bevat geen geldige 'prices' array")

    out: list[tuple[dt.date, float]] = []
    for item in prices:
        if not isinstance(item, list) or len(item) < 2:
            continue
        timestamp_ms, price = item[0], item[1]
        try:
            date = dt.datetime.utcfromtimestamp(float(timestamp_ms) / 1000).date()
            close = float(price)
        except (TypeError, ValueError):
            continue
        out.append((date, close))

    out.sort(key=lambda x: x[0])
    return out


def month_end_prices(prices: list[tuple[dt.date, float]]) -> list[tuple[str, float]]:
    latest_per_month: dict[tuple[int, int], tuple[dt.date, float]] = {}
    for date, close in prices:
        latest_per_month[(date.year, date.month)] = (date, close)

    rows: list[tuple[str, float]] = []
    for (year, month), (date, close) in sorted(latest_per_month.items()):
        last_day = calendar.monthrange(year, month)[1]
        if date.day != last_day:
            continue  # skip huidige/incomplete maand
        rows.append((date.isoformat(), round(close, 1)))

    rows.sort(reverse=True)
    return rows


def render_data_file(rows: list[tuple[str, float]]) -> str:
    lines = [
        "// assets/js/btc-powerlaw-data.js",
        "// Maandelijkse BTC closes (EUR)",
        "",
        "window.btcMonthlyCloses = [",
    ]
    for date, price in rows:
        lines.append(f'  {{ date: "{date}", price: {price:.1f} }},')
    lines.append("];")
    lines.append("")
    return "\n".join(lines)


def extract_current_row_count(text: str) -> int:
    return len(re.findall(r"\{\s*date:\s*\"\d{4}-\d{2}-\d{2}\"", text))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--write",
        action="store_true",
        help="Schrijf de nieuwe data effectief weg naar assets/js/btc-powerlaw-data.js",
    )
    args = parser.parse_args()

    if not DATA_FILE.exists():
        raise SystemExit(f"Data file niet gevonden: {DATA_FILE}")

    existing = DATA_FILE.read_text(encoding="utf-8")
    existing_rows = extract_current_row_count(existing)

    daily = fetch_daily_prices()
    rows = month_end_prices(daily)
    rendered = render_data_file(rows)

    print(f"Huidige aantal maandrijen: {existing_rows}")
    print(f"Nieuwe aantal maandrijen: {len(rows)}")
    if rows:
        print(f"Nieuwste maandclose uit API: {rows[0][0]} -> {rows[0][1]:.1f}")

    if rendered == existing:
        print("Geen wijzigingen nodig.")
        return 0

    if not args.write:
        print("Wijzigingen gedetecteerd. Run opnieuw met --write om te updaten.")
        return 2

    DATA_FILE.write_text(rendered, encoding="utf-8")
    print(f"Bestand bijgewerkt: {DATA_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
