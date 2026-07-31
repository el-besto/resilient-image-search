import type { Photo } from '../lib/types';

const INITIAL_EAGER_IMAGE_COUNT = 4;
const RESULT_IMAGE_SIZES = '(max-width: 30rem) 100vw, (max-width: 60rem) 50vw, 25vw';

function getLargerImageLabel(photo: Photo): string {
  return photo.contentDescription
    ? `View larger image: ${photo.contentDescription} (opens in a new tab)`
    : 'View larger image (opens in a new tab)';
}

export default function ResultsGallery({ photos }: { photos: Photo[] }) {
  return (
    // biome-ignore lint/a11y/noRedundantRoles: Preserve list semantics when CSS removes markers.
    <ul className="results-gallery" role="list">
      {photos.map((photo, index) => (
        <li key={photo.id} className="results-gallery__item">
          <figure className="results-gallery__figure">
            <a
              className="results-gallery__image-link"
              href={photo.fullUrl}
              target="_blank"
              rel="noopener"
            >
              <img
                className="results-gallery__image"
                src={photo.thumbUrl}
                srcSet={`${photo.thumbUrl} 400w, ${photo.fullUrl} 1080w`}
                sizes={RESULT_IMAGE_SIZES}
                width={photo.width}
                height={photo.height}
                alt={getLargerImageLabel(photo)}
                loading={index < INITIAL_EAGER_IMAGE_COUNT ? 'eager' : 'lazy'}
                decoding="async"
              />
            </a>
            <figcaption className="results-gallery__caption">
              Photo by <a href={photo.attribution.creatorUrl}>{photo.attribution.creatorName}</a> on{' '}
              <a href={photo.attribution.sourceUrl}>{photo.attribution.sourceName}</a>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
