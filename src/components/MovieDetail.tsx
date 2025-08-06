import React from 'react';
import { useTranslation } from 'react-i18next';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
}

interface MovieDetailProps {
  movie: Movie;
  onClose: () => void;
  onToggleFavorite: (movie: Movie) => void;
  isFavorite: boolean;
}

const MovieDetail: React.FC<MovieDetailProps> = ({ movie, onClose, onToggleFavorite, isFavorite }) => {
  const { t } = useTranslation();
  
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const title = movie.title || movie.name || t('noTitle');
  const poster = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null;
  const releaseDate = movie.release_date || movie.first_air_date || t('unknown');
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const voteCount = movie.vote_count || 0;
  const popularity = movie.popularity ? Math.round(movie.popularity) : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 1
          }}
        >
          ✕
        </button>

        <div style={{ padding: '30px' }}>
          <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
            {/* Poster */}
            <div style={{ flexShrink: 0 }}>
              {poster ? (
                <img 
                  src={poster} 
                  alt={title} 
                  style={{
                    width: '300px',
                    height: '450px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                />
              ) : (
                <div style={{
                  width: '300px',
                  height: '450px',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontSize: '18px',
                  color: '#666'
                }}>
                  {t('noPoster')}
                </div>
              )}
            </div>

            {/* Bilgiler */}
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: '0 0 15px 0', 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                {title}
              </h1>

              {/* Favori Butonu */}
              <button
                onClick={() => onToggleFavorite(movie)}
                style={{
                  background: 'none',
                  border: '2px solid #007bff',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '20px',
                  color: isFavorite ? 'white' : '#007bff',
                  backgroundColor: isFavorite ? '#007bff' : 'transparent',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!isFavorite) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFavorite) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {isFavorite ? '❤️ Favorilerden Çıkar' : '🤍 Favorilere Ekle'}
              </button>

              {/* Detaylar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  marginBottom: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <strong>{t('releaseDate')}:</strong> {releaseDate}
                  </div>
                  <div>
                    <strong>Puan:</strong> ⭐ {rating}/10
                  </div>
                  <div>
                    <strong>Oylama:</strong> {voteCount} oy
                  </div>
                  <div>
                    <strong>Popülerlik:</strong> {popularity}
                  </div>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '18px',
                  color: '#333'
                }}>
                  Özet
                </h3>
                <p style={{ 
                  margin: 0, 
                  lineHeight: '1.6',
                  color: '#666',
                  fontSize: '16px'
                }}>
                  {movie.overview || 'Bu içerik için henüz açıklama bulunmuyor.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail; 