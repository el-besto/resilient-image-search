import type { ReactNode } from 'react';
import Pagination from '../components/Pagination';
import SearchForm from '../components/SearchForm';
import { useUrlSearchState } from '../hooks/use-url-search-state';
import { ApiError } from '../lib/api';
import { pluralize } from '../lib/format';
import { usePhotoSearch } from '../lib/search-query';
import type { Photo } from '../lib/types';

function SearchStatus({ children }: { children: string }) {
  return (
    <p className="search__status" role="status">
      {children}
    </p>
  );
}

function SearchError({
  error,
  retrying,
  onRetry,
}: {
  error: unknown;
  retrying: boolean;
  onRetry: () => void;
}) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong. Try again.';

  return (
    <div className="search__error" role="alert">
      <p>{message}</p>
      <button type="button" disabled={retrying} onClick={onRetry}>
        {retrying ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  );
}

function ResultsList({ photos }: { photos: Photo[] }) {
  return (
    <ul className="grid">
      {photos.map((photo) => (
        <li key={photo.id} className="grid__item">
          <img className="grid__img" src={photo.thumbUrl} alt={photo.contentDescription ?? ''} />
        </li>
      ))}
    </ul>
  );
}

export default function SearchPage() {
  const { committedQuery, draft, hasPendingDraft, page, setDraft, setPage, submit } =
    useUrlSearchState();
  const search = usePhotoSearch(committedQuery, page);
  const retry = () => void search.refetch();
  const initialLoading = committedQuery.length > 0 && !search.data && search.isPending;

  let resultsContent: ReactNode = null;

  if (!committedQuery) {
    resultsContent = <SearchStatus>Enter a search term to begin.</SearchStatus>;
  } else if (initialLoading) {
    resultsContent = <SearchStatus>{`Loading page ${page} for “${committedQuery}”…`}</SearchStatus>;
  } else if (!search.data && search.isError) {
    resultsContent = (
      <SearchError error={search.error} retrying={search.isFetching} onRetry={retry} />
    );
  } else if (search.data) {
    const refreshFailed = search.isError;

    resultsContent = (
      <>
        {search.isFetching && !refreshFailed && (
          <SearchStatus>{`Refreshing page ${page} for “${committedQuery}”…`}</SearchStatus>
        )}
        {refreshFailed && (
          <SearchError error={search.error} retrying={search.isFetching} onRetry={retry} />
        )}
        {search.data.results.length === 0 ? (
          <SearchStatus>{`No results found for “${committedQuery}”.`}</SearchStatus>
        ) : (
          <>
            <p className="search__count">
              {pluralize(search.data.results.length, 'result')} on this page
            </p>
            <ResultsList photos={search.data.results} />
          </>
        )}
        <Pagination
          disabled={hasPendingDraft}
          page={page}
          totalPages={search.data.totalPages}
          onPageChange={setPage}
        />
      </>
    );
  }

  return (
    <div className="search">
      <h1>Search the image library</h1>
      <SearchForm draft={draft} onDraftChange={setDraft} onSubmit={submit} />
      <section
        className={`search__results${initialLoading ? ' search__results--loading' : ''}`}
        aria-labelledby="search-results-heading"
      >
        <h2 id="search-results-heading">Results</h2>
        {resultsContent}
      </section>
    </div>
  );
}
