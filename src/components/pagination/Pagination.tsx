import styles from "./Pagination.module.css";
type Props = { page: number; totalPages: number; total: number; loading: boolean; setPage: (page: number) => void; label: string };
export function Pagination({ page, totalPages, total, loading, setPage, label }: Props) {
  if (!totalPages) return null;
  return (
    <nav className={styles.pagination} aria-label={label}>
      <button type="button" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
      <span aria-live="polite">Página {page} de {totalPages} · {total} {total === 1 ? "registro" : "registros"}</span>
      <button type="button" disabled={loading || page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</button>
    </nav>
  );
}
