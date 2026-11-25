import { useEffect, useState } from "react";
import { api } from "../../features/auth/services/api";

type Result<T> = { items: T[]; page: number; totalPages: number; total: number; summary?: Record<string, number> };

export function usePagedList<T>(path: string, scope = "") {
  const [search, updateSearch] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api.get<Result<T>>(path, { params: { page, search, scope }, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) { setResult(data); setPage(data.page); }
      })
      .catch(() => {
        if (!controller.signal.aborted) { setError("Erro ao carregar registros."); setResult(null); }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, page, search, revision, scope]);
  function setSearch(value: string) { updateSearch(value); setPage(1); }
  return { items: result?.items ?? [], total: result?.total ?? 0, totalPages: result?.totalPages ?? 0,
    summary: result?.summary, page: result?.page ?? page, setPage, search, setSearch, loading, error,
    refresh: () => setRevision(value => value + 1) };
}
