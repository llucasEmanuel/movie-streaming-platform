import { useEffect, useState, useRef } from "react";
import { MovieCard } from "./MovieCard";
import { getRecommendations } from "../services/recommendationApi";
import type { Movie, RecommendationSection } from "../types";
import "./RecommendedSection.css";

interface RecommendedSectionProps {
  userId: string;
  onSelectMovie: (movie: Movie) => void;
  onAddToPlaylist?: (movie: Movie) => void;
}

export function RecommendedSection({ userId, onSelectMovie, onAddToPlaylist }: RecommendedSectionProps) {
  const [sections, setSections] = useState<RecommendationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRecommendations(userId);
        setSections(data);
      } catch (err) {
        console.error("Erro ao carregar recomendações:", err);
        setError("Não foi possível carregar as recomendações.");
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [userId]);

  const handleScroll = (index: number, direction: "left" | "right") => {
    const container = carouselsRef.current[index];
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (loading) {
    return (
      <div className="recommendations-loading">
        <p>Carregando recomendações personalizadas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-error">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="recommended-section-container">
      {sections.map((section, index) => {
        const showTitle = section.sectionTitle || "Recomendações Personalizadas";
        
        return (
          <section key={index} className="recommendation-row">
            {section.message && (
              <div className="recommendations-info-banner">
                <span className="info-icon">ℹ️</span>
                <p className="recommendations-info-message">{section.message}</p>
              </div>
            )}
            
            <div className="section-title-wrapper">
              <h2>{showTitle}</h2>
              <div className="section-title-line"></div>
            </div>

            {section.movies && section.movies.length > 0 ? (
              <div className="recommendations-carousel-wrapper">
                <button 
                  className="carousel-arrow left" 
                  onClick={() => handleScroll(index, "left")}
                  aria-label="Rolar para esquerda"
                >
                  ‹
                </button>
                <button 
                  className="carousel-arrow right" 
                  onClick={() => handleScroll(index, "right")}
                  aria-label="Rolar para direita"
                >
                  ›
                </button>

                <div 
                  ref={(el) => { carouselsRef.current[index] = el; }}
                  className="recommendations-carousel"
                >
                  {section.movies.map((movie) => (
                    <div key={movie.id} className="recommendations-carousel-item">
                      <MovieCard
                        movie={movie}
                        onSelectMovie={onSelectMovie}
                        onAddToPlaylist={onAddToPlaylist}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-recommendations-movies">Nenhum filme disponível nesta seção.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
