"""
Supabase client singleton.
Falls back to an in-memory store when SUPABASE_URL / SUPABASE_SERVICE_KEY
are not configured, so the demo runs without a database.
"""
from __future__ import annotations
import json
import uuid
from datetime import datetime, timezone
from typing import Any
from functools import lru_cache

from config import get_settings


# ── In-memory fallback store (used when Supabase is not configured) ────
class _InMemoryStore:
    """Thread-unsafe demo store. Good enough for a single-process hackathon demo."""

    def __init__(self) -> None:
        self._tables: dict[str, list[dict]] = {}

    def _get_table(self, table: str) -> list[dict]:
        return self._tables.setdefault(table, [])

    def insert(self, table: str, data: dict) -> dict:
        row = {**data}
        row.setdefault("id", str(uuid.uuid4()))
        row.setdefault("created_at", datetime.now(timezone.utc).isoformat())
        self._get_table(table).append(row)
        return row

    def select(self, table: str, filters: dict | None = None) -> list[dict]:
        rows = self._get_table(table)
        if not filters:
            return rows
        return [r for r in rows if all(r.get(k) == v for k, v in filters.items())]

    def select_one(self, table: str, id: str) -> dict | None:
        for row in self._get_table(table):
            if row.get("id") == id:
                return row
        return None

    def update(self, table: str, id: str, data: dict) -> dict | None:
        for row in self._get_table(table):
            if row.get("id") == id:
                row.update(data)
                row["updated_at"] = datetime.now(timezone.utc).isoformat()
                return row
        return None

    def delete(self, table: str, id: str) -> bool:
        table_rows = self._get_table(table)
        before = len(table_rows)
        self._tables[table] = [r for r in table_rows if r.get("id") != id]
        return len(self._tables[table]) < before


_mem_store = _InMemoryStore()


# ── DB client abstraction ──────────────────────────────────────────────
class DBClient:
    """
    Thin abstraction over Supabase.
    When Supabase credentials are absent, falls back to _InMemoryStore.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self._supabase = None
        self._mode = "memory"

        if settings.has_supabase:
            try:
                from supabase import create_client
                self._supabase = create_client(
                    settings.supabase_url, settings.supabase_service_key
                )
                self._mode = "supabase"
                print("[DB] Connected to Supabase")
            except Exception as e:
                print(f"[DB] Supabase init failed, using in-memory store: {e}")
        else:
            print("[DB] No Supabase credentials — using in-memory demo store (SIMULATED)")

    @property
    def mode(self) -> str:
        return self._mode

    # ── INSERT ─────────────────────────────────────────────────────────
    def insert(self, table: str, data: dict) -> dict:
        if self._supabase:
            try:
                res = self._supabase.table(table).insert(data).execute()
                return res.data[0] if res.data else data
            except Exception as e:
                print(f"[DB] Supabase insert error on {table}, using memory fallback: {e}")
        return _mem_store.insert(table, data)

    # ── SELECT MANY ────────────────────────────────────────────────────
    def select(self, table: str, filters: dict | None = None, limit: int = 200) -> list[dict]:
        if self._supabase:
            try:
                q = self._supabase.table(table).select("*")
                if filters:
                    for k, v in filters.items():
                        q = q.eq(k, v)
                res = q.limit(limit).execute()
                return res.data or []
            except Exception as e:
                print(f"[DB] Supabase select error on {table}, using memory fallback: {e}")
        return _mem_store.select(table, filters)

    # ── SELECT ONE ─────────────────────────────────────────────────────
    def select_one(self, table: str, id: str) -> dict | None:
        if self._supabase:
            try:
                res = self._supabase.table(table).select("*").eq("id", id).single().execute()
                return res.data
            except Exception as e:
                print(f"[DB] Supabase select_one error on {table}, using memory fallback: {e}")
        return _mem_store.select_one(table, id)

    # ── UPDATE ─────────────────────────────────────────────────────────
    def update(self, table: str, id: str, data: dict) -> dict | None:
        if self._supabase:
            try:
                res = self._supabase.table(table).update(data).eq("id", id).execute()
                return res.data[0] if res.data else None
            except Exception as e:
                print(f"[DB] Supabase update error on {table}, using memory fallback: {e}")
        return _mem_store.update(table, id, data)

    # ── RAW QUERY (Supabase only) ───────────────────────────────────────
    def rpc(self, fn: str, params: dict) -> Any:
        if self._supabase:
            return self._supabase.rpc(fn, params).execute().data
        raise NotImplementedError("RPC not available in memory mode")


@lru_cache
def get_db() -> DBClient:
    return DBClient()
