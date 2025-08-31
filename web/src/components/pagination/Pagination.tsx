import { getPageWindow } from "@/common/utils/pagination";
import styles from "./Pagination.module.scss";
import { Meta } from "@/common/types/api/api.types";

type PaginationProps = {
  meta?: Meta;
  page: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({ meta, page, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const current = Math.min(Math.max(1, page), totalPages);

  const disabledPrev = current <= 1;
  const disabledNext = current >= totalPages;

  const pages = getPageWindow(current, totalPages, 5);

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <div className={styles.info}>
        <span>Total: {meta?.totalItems ?? 0}</span>
        <span>
          Página {current} de {totalPages}
        </span>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.navBtn}
          onClick={() => onPageChange(1)}
          disabled={disabledPrev}
          aria-label="Primeira página"
          title="Primeira página"
        >
          «
        </button>
        <button
          className={styles.navBtn}
          onClick={() => onPageChange(current - 1)}
          disabled={disabledPrev}
          aria-label="Página anterior"
          title="Página anterior"
        >
          ‹
        </button>

        <div className={styles.pages}>
          {pages.map((p, idx) =>
            p === -1 ? (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={p}
                className={`${styles.pageBtn} ${
                  p === current ? styles.active : ""
                }`}
                onClick={() => onPageChange(p)}
                aria-current={p === current ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className={styles.navBtn}
          onClick={() => onPageChange(current + 1)}
          disabled={disabledNext}
          aria-label="Próxima página"
          title="Próxima página"
        >
          ›
        </button>
        <button
          className={styles.navBtn}
          onClick={() => onPageChange(totalPages)}
          disabled={disabledNext}
          aria-label="Última página"
          title="Última página"
        >
          »
        </button>
      </div>
    </nav>
  );
};
