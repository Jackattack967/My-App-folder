"use client";

import { useCallback, useSyncExternalStore } from "react";

// Small localStorage-backed store. Every component using the same key
// stays in sync, and a memory copy keeps things working when storage is
// blocked (private mode, full quota).

const listeners = new Set<() => void>();
const memory = new Map<string, string>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function read<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;

  let value = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Storage unavailable: the memory copy still works for this visit.
  }
  cache.set(key, { raw, value });
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Like useState, but saved in the browser. `fallback` is used until the
 * first save, which is how each tool opens with example content.
 * The third value is true while the fallback is still showing.
 */
export function useStored<T>(
  key: string,
  fallback: T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const isDefault = useSyncExternalStore(
    subscribe,
    () => readRaw(key) === null,
    () => true,
  );

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      write(key, next instanceof Function ? next(prev) : next);
    },
    [key, fallback],
  );

  return [value, set, isDefault];
}

const noopSubscribe = () => () => {};

/** False during server render and hydration, true after. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
