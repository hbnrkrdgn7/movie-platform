import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { api } from "../api/client";
import { useTranslation } from "react-i18next";
import MovieDetail from "../components/MovieDetail";
import i18n from "../i18n";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
}

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  
  const categories = [t('home'), t('movies'), t('series'), t('popular'), t('favorites')];
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";
  const API_KEY = "cbd398738d36d235dfc790387d06f12d";
  const BASE_URL = "https://api.themoviedb.org/3";

  const [selectedCategory, setSelectedCategory] = useState(t('home'));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  // Auth state listener - artık gerekli değil, sadece token kontrolü yap
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          // Önce local cache'den hızlıca göster
          const cachedUser = localStorage.getItem("user");
          if (cachedUser) {
            try {
              const u = JSON.parse(cachedUser);
              const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email?.split("@")[0] || "";
              setUserDisplayName(name);
            } catch {}
          }

          // Token varsa kullanıcı bilgilerini backend'den al (cache-buster ile)
          const response = await api.get(`/users/me?ts=${Date.now()}`);
          const userData = response.data;
          
          // Kullanıcı bilgilerini ayarla
          let fullName = "";
          if (userData.first_name && userData.last_name) {
            fullName = `${userData.first_name} ${userData.last_name}`.trim();
          } else if (userData.first_name) {
            // Sadece isim varsa, email'den soyisim çıkar
            const emailName = userData.email?.split("@")[0] || "";
            if (emailName.includes(".")) {
              const emailParts = emailName.split(".");
              const firstName = emailParts[0] || userData.first_name;
              const lastName = emailParts.slice(1).join(" ") || "";
              fullName = `${firstName} ${lastName}`.trim();
            } else {
              fullName = userData.first_name;
            }
          } else {
            // Hiç isim yoksa email'den çıkar
            const emailName = userData.email?.split("@")[0] || "";
            if (emailName.includes(".")) {
              const emailParts = emailName.split(".");
              const firstName = emailParts[0] || "";
              const lastName = emailParts.slice(1).join(" ") || "";
              fullName = `${firstName} ${lastName}`.trim();
            } else {
              fullName = emailName;
            }
          }
          
          setUserDisplayName(fullName || userData.email?.split("@")[0] || "");
          // Local cache'e yaz
          localStorage.setItem("user", JSON.stringify(userData));
          
          // Favorileri çek
          await fetchFavorites();
        } catch (error) {
          console.error("Token geçersiz, çıkış yapılıyor:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUserDisplayName("");
          setFavorites([]);
          navigate("/login");
        }
      } else {
        // Token yoksa login sayfasına yönlendir
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // Kullanıcı bilgilerini backend'den çek - artık gerekli değil
  // const fetchUserInfo = async (currentUser: any) => { ... };

  // Favorileri backend'den çek
  const fetchFavorites = async () => {
    console.log("Favoriler backend'den çekiliyor...");

    try {
      const response = await api.get("/favorites");
      console.log("Backend'den gelen favoriler:", response.data);
      
      // Backend'den gelen veriyi Movie formatına çevir
      const formattedFavorites: Movie[] = (response.data || []).map((fav: any) => ({
        id: fav.movie_id,
        title: fav.movie_title,
        poster_path: fav.movie_poster,
        overview: fav.movie_overview,
        release_date: fav.movie_release_date
      }));
      
      setFavorites(formattedFavorites);
    } catch (error) {
      console.error("Favoriler alınırken hata:", error);
      setFavorites([]);
    }
  };



  // Çıkış yap fonksiyonu
  const handleLogout = async () => {
    try {
      // JWT token'ı temizle
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("Kullanıcı çıkış yaptı");
      navigate("/login");
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (selectedCategory === t('favorites')) {
        setLoading(false);
        return;
      }

      let endpoint = "";
      switch (selectedCategory) {
        case t('movies'):
          endpoint = "/movie/popular";
          break;
        case t('series'):
          endpoint = "/tv/popular";
          break;
        case t('popular'):
          endpoint = "/trending/all/week";
          break;
        default:
          endpoint = "/movie/popular";
      }

      try {
  const response = await axios.get(`${BASE_URL}${endpoint}`, {
    params: {
      api_key: API_KEY,
      language: i18n.language === "en" ? "en-US" : "tr-TR",  // BURADA DİL KONTROLÜ
      page: 1,
    },
  });
  setMovies(response.data.results);
} catch (error) {
  console.error("API çağrısı hatası:", error);
  setMovies([]);
}


      setLoading(false);
    };

    fetchData();
  }, [selectedCategory, t]);

  const toggleFavorite = async (movie: Movie) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Kullanıcı giriş yapmamış, favori eklenemiyor");
      return;
    }

    console.log("Favori toggle ediliyor:", movie.title || movie.name);
    
    const exists = favorites.find((fav) => fav.id === movie.id);

    if (exists) {
      // Favoriden çıkar
      console.log("Favoriden çıkarılıyor:", movie.title || movie.name);
      try {
        await api.delete(`/favorites/${movie.id}`);
        setFavorites(favorites.filter((fav) => fav.id !== movie.id));
        console.log("Favori başarıyla silindi");
      } catch (error) {
        console.error("Favori silinirken hata:", error);
      }
    } else {
      // Favorilere ekle
      console.log("Favorilere ekleniyor:", movie.title || movie.name);
      try {
        const response = await api.post("/favorites", {
          movie_id: movie.id,
          movie_title: movie.title || movie.name,
          movie_poster: movie.poster_path,
          movie_overview: movie.overview,
          movie_release_date: movie.release_date || movie.first_air_date
        });
        
        // Backend'den gelen veriyi Movie formatına çevir
        const newFavorite: Movie = {
          id: response.data.movie_id,
          title: response.data.movie_title,
          poster_path: response.data.movie_poster,
          overview: response.data.movie_overview,
          release_date: response.data.movie_release_date
        };
        
        setFavorites([...favorites, newFavorite]);
        console.log("Favori başarıyla eklendi");
      } catch (error) {
        console.error("Favori eklenirken hata:", error);
      }
    }
  };

  const filteredMovies =
    selectedCategory === t('favorites')
      ? favorites
      : movies.filter((movie) => {
          const title = (movie.title || movie.name || "").toLowerCase();
          return title.includes(searchTerm.toLowerCase());
        });

  return (
    <div className="homepage-container">
      {/* Menü çubuğu */}
      <div className="menu-strip" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%"
      }}>
        {/* Sol taraf - Kategori butonları */}
        <div style={{ display: "flex", gap: "10px" }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`menu-button ${
                selectedCategory === category ? "selected" : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sağ taraf - Ayarlar dropdown ve Çıkış butonları */}
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ position: "relative" }}>
            <button
              className="settings-button"
              onMouseEnter={() => setShowSettingsDropdown(true)}
              onMouseLeave={() => setShowSettingsDropdown(false)}
              title={t('settings')}
            >
              ⚙ {t('settings')}
            </button>
            
            {showSettingsDropdown && (
              <div 
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                  minWidth: "200px"
                }}
                onMouseEnter={() => setShowSettingsDropdown(true)}
                onMouseLeave={() => setShowSettingsDropdown(false)}
              >
                <button
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 15px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  onClick={() => {
                    setShowSettingsDropdown(false);
                    navigate("/settings", { state: { section: "userInfo" } });
                  }}
                >
                  👤 {t('userInfo')}
                </button>
                <button
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 15px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    borderTop: "1px solid #eee"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  onClick={() => {
                    setShowSettingsDropdown(false);
                    navigate("/settings", { state: { section: "password" } });
                  }}
                >
                  🔒 {t('passwordUpdate')}
                </button>
                <button
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 15px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    borderTop: "1px solid #eee"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  onClick={() => {
                    setShowSettingsDropdown(false);
                    navigate("/settings", { state: { section: "language" } });
                  }}
                >
                  🌐 {t('languageSelection')}
                </button>
              </div>
            )}
          </div>
          
          <button
            className="logout-button"
            onClick={handleLogout}
            title={t('logout')}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "40px"
            }}
          >
            🚪 {t('logout')}
          </button>
        </div>
      </div>

      {/* Hoşgeldiniz + Arama kutusu */}
      <div
        className="welcome-box"
        style={{
          position: "relative",
          padding: 30,
          color: "white",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.7)",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            //backgroundImage: `url(${images})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(1.5) blur(1px)",
            zIndex: -1,
            borderRadius: 12,
          }}
        />
        <h2>{t('welcome')} {userDisplayName}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxWidth: "400px" }}>
    <label htmlFor="search">{t('searchLabel')}</label>
    <input
      id="search"
      type="text"
      placeholder={t('searchPlaceholder')}
      className="search-input"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      style={{ position: "relative", zIndex: 1 }}
    />
  </div>
      </div>

      {/* Film/Dizi listesi */}
      {loading ? (
        <p>{t('loading')}</p>
      ) : filteredMovies.length === 0 ? (
        <p>
          {selectedCategory === t('favorites')
            ? t('emptyFavorites')
            : t('noContent')}
        </p>
      ) : (
        <div className="content-container">
          {filteredMovies.map((movie) => {
            const title = movie.title || movie.name || t('noTitle');
            const poster = movie.poster_path
              ? `${IMAGE_BASE_URL}${movie.poster_path}`
              : null;

            return (
              <div key={movie.id} className="movie-card" style={{ cursor: 'pointer' }}>
                <div onClick={() => setSelectedMovie(movie)}>
                  {poster ? (
                    <img src={poster} alt={title} className="movie-poster" />
                  ) : (
                    <div className="no-poster">{t('noPoster')}</div>
                  )}
                  <div className="movie-info">
                    <h3>{title}</h3>
                    <p>
                      {t('releaseDate')}:{" "}
                      {movie.release_date || movie.first_air_date || t('unknown')}
                    </p>
                    <p>{movie.overview?.substring(0, 100)}...</p>
                  </div>
                </div>
                <button
                  className={`favorite-button ${
                    favorites.some((f) => f.id === movie.id) ? "favorited" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(movie);
                  }}
                  title={
                    favorites.some((f) => f.id === movie.id)
                      ? t('removeFromFavorites')
                      : t('addToFavorites')
                  }
                >
                  {favorites.some((f) => f.id === movie.id) ? "❤️" : "🤍"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Film/Dizi Detay Modal */}
      {selectedMovie && (
        <MovieDetail
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.some((f) => f.id === selectedMovie.id)}
        />
      )}
    </div>
  );
};

export default HomePage;