import { useState } from "react";
import "./KeepWatchingCard.css";

interface KeepWatchingCardProps {
  title: string;
  thumbnailUrl?: string | null;
  progressPercentage?: number; // Ex: 45 para 45%
  onClick?: () => void;
}

export function KeepWatchingCard({ title, thumbnailUrl, progressPercentage, onClick }: KeepWatchingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="keep-watching-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Imagem de Capa do Filme */}
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={title} className="keep-watching-thumbnail" />
      ) : (
        <div className="keep-watching-thumbnail keep-watching-thumbnail--fallback" aria-hidden="true" />
      )}

      {/* Overlay com transparência no Hover */}
      <div className={`keep-watching-overlay ${isHovered ? "visible" : ""}`}>
        {/* Símbolo Amarelo de Play Centralizado */}
        <div className="keep-watching-play-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Barra de Informações Inferior */}
      <div className="keep-watching-info">
        <h3 className="keep-watching-title">{title}</h3>
        
        {/* Retângulo com a % alinhado à direita */}
        {progressPercentage !== undefined && progressPercentage > 0 && (
          <div className="keep-watching-badge">
            {progressPercentage}%
          </div>
        )}
      </div>
    </div>
  );
}