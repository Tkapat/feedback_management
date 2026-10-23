"use client";
import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import type { PageMeta } from "@/types";

export default function useFetch<T>(url: string | null, params?: Record<string, unknown>) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const key = JSON.stringify(params ?? {});
  const requestKey = `${url ?? ""}|${key}|${tick}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    const current = requestKey;
    let active = true;
    api
      .get(url, { params: JSON.parse(key) })
      .then((res) => {
        if (!active) return;
        setData(res.data.data as T);
        setMeta(res.data.meta ?? null);
        setError(null);
      })
      .catch((e) => {
        if (active) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (active) setLoadedKey(current);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const loading = !!url && loadedKey !== requestKey;
  return { data, meta, loading, error, reload };
}