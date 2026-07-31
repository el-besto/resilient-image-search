import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SEARCH_DEBOUNCE_MS = 500;

function normalizeSearchQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function readPage(value: string | null): number {
  const page = Number(value ?? 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function useUrlSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const committedQuery = normalizeSearchQuery(searchParams.get('query') ?? '');
  const page = readPage(searchParams.get('page'));
  const [draft, setDraft] = useState(committedQuery);
  const timerRef = useRef<number | undefined>(undefined);

  const clearPendingCommit = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const commitQuery = useCallback(
    (value: string, replace: boolean) => {
      const query = normalizeSearchQuery(value);
      const next = new URLSearchParams(searchParams);

      if (query) {
        next.set('query', query);
        next.set('page', '1');
      } else {
        next.delete('query');
        next.delete('page');
      }

      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace });
      }
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    setDraft(committedQuery);
  }, [committedQuery]);

  useEffect(() => {
    clearPendingCommit();

    if (normalizeSearchQuery(draft) === committedQuery) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      commitQuery(draft, true);
    }, SEARCH_DEBOUNCE_MS);

    return clearPendingCommit;
  }, [clearPendingCommit, commitQuery, committedQuery, draft]);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      clearPendingCommit();
      commitQuery(draft, false);
    },
    [clearPendingCommit, commitQuery, draft],
  );

  const hasPendingDraft = useMemo(
    () => normalizeSearchQuery(draft) !== committedQuery,
    [committedQuery, draft],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      if (hasPendingDraft || nextPage === page || nextPage < 1) {
        return;
      }

      const next = new URLSearchParams(searchParams);
      next.set('page', String(nextPage));
      setSearchParams(next, { replace: false });
    },
    [hasPendingDraft, page, searchParams, setSearchParams],
  );

  return {
    committedQuery,
    draft,
    hasPendingDraft,
    page,
    setDraft,
    setPage,
    submit,
  };
}
