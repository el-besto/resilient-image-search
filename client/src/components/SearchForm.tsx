import type { FormEvent } from 'react';

interface SearchFormProps {
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function SearchForm({ draft, onDraftChange, onSubmit }: SearchFormProps) {
  return (
    <form className="search__form" onSubmit={onSubmit}>
      <label className="search__label" htmlFor="image-search">
        Search images
      </label>
      <div className="search__form-controls">
        <input
          className="search__input"
          id="image-search"
          type="search"
          placeholder="Try “mountain lakes”"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
        />
        <button className="search__button" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}
