"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveItemStatus, type SaveResult } from "@/app/mentoria/[slug]/actions";
import type { ItemStatus, MenteeState } from "@/app/data/mentoria/types";

export type SyncState = "idle" | "saving" | "saved" | "error";

const TEXT_DEBOUNCE_MS = 700;
const REFRESH_MS = 60_000;

/**
 * Local copy of the shared state with optimistic writes. Text fields save after a
 * short pause. The page re-fetches on focus and every minute, so each side sees
 * the other's changes without reloading; refreshes wait while a save is pending.
 */
export function useMentoriaState<S extends MenteeState>(slug: string, initial: S) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [sync, setSync] = useState<SyncState>("idle");
  const inFlight = useRef(0);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const busy = () => inFlight.current > 0 || timers.current.size > 0;

  // Fresh server data after router.refresh(); ignored while we have unsaved edits.
  useEffect(() => {
    if (!busy()) setState(initial);
  }, [initial]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible" && !busy()) router.refresh();
    };
    const id = setInterval(refresh, REFRESH_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const warn = (e: BeforeUnloadEvent) => {
      if (busy()) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("beforeunload", warn);
    };
  }, [router]);

  const run = useCallback(async (save: () => Promise<SaveResult>, rollback?: () => void) => {
    inFlight.current++;
    setSync("saving");
    try {
      const r = await save();
      if (!r.ok) throw new Error("rejected");
      setSync("saved");
    } catch {
      rollback?.();
      setSync("error");
    } finally {
      inFlight.current--;
    }
  }, []);

  const statusOf = useCallback((id: string): ItemStatus => state.progress[id] ?? "pendiente", [state.progress]);

  const setItem = useCallback(
    (id: string, next: ItemStatus) => {
      const prev = state.progress[id] ?? "pendiente";
      setState((s) => ({ ...s, progress: { ...s.progress, [id]: next } }));
      run(
        () => saveItemStatus(slug, id, next),
        () => setState((s) => ({ ...s, progress: { ...s.progress, [id]: prev } })),
      );
    },
    [run, slug, state.progress],
  );

  /** Apply a change now and run `save` once the user pauses (one timer per key). */
  const setDebounced = useCallback(
    (key: string, apply: (s: S) => S, save: () => Promise<SaveResult>) => {
      setState(apply);
      const t = timers.current.get(key);
      if (t) clearTimeout(t);
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key);
          run(save);
        }, TEXT_DEBOUNCE_MS),
      );
    },
    [run],
  );

  /** Apply a change now and save it now. */
  const setNow = useCallback(
    (apply: (s: S) => S, save: () => Promise<SaveResult>, rollback: (s: S) => S) => {
      setState(apply);
      run(save, () => setState(rollback));
    },
    [run],
  );

  return { state, sync, statusOf, setItem, setDebounced, setNow };
}
