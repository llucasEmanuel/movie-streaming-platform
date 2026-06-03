import type { Movie } from '../types';

const PLACEHOLDER = 'https://via.placeholder.com/300x450.png?text=Poster';

export function MovieCard({ movie }: { movie: Movie }) {
  const src = movie.img_url || PLACEHOLDER;

  return (
    <div className="movie-card">
      <div className="poster-wrapper">
        <img src={src} alt={movie.title} className="movie-poster" />
        {movie.isPopular && (
          <span className="popular-badge popular-overlay">Popular</span>
        )}
      </div>
    </div>
  );
}