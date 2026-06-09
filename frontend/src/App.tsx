import { useState } from "react";
// ✨ Importamos o Navigate aqui para os redirecionamentos de segurança
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "./App.css";

import { WelcomePage } from "./pages/Welcome/WelcomePage";
import { LoginPage } from "./pages/Login/LoginPage";
import { HomePage } from "./pages/Home/HomePage";
import { MinhasPlaylistsPage } from "./pages/MinhasPlaylists/MinhasPlaylistsPage";
import { HistoryPage } from "./pages/History/HistoryPage";
import { MovieDetailsPage } from "./pages/MovieDetails/MovieDetailsPage";
import { Register } from "./pages/Register/register";
import { AccountPage } from "./pages/Account/AccountPage";
import { RecomendadosPage } from "./pages/Recomendados/RecomendadosPage";

import type { LoggedUser, Movie } from "./types";

const STORAGE_KEY = "cinema_logged_user";

function getStoredUser(): LoggedUser | null {
  const storedUser = localStorage.getItem(STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as LoggedUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function App() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(
    getStoredUser,
  );

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  function handleLogin(user: LoggedUser) {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    navigate("/");
  }

  // ✨ NOVA FUNÇÃO: Faz o login e envia diretamente para as playlists!
  function handleRegisterSuccess(user: LoggedUser) {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    navigate("/"); 
  }

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setSelectedMovie(null);
    navigate("/");
  }

  function handleGoToSignup() {
    navigate("/register");
  }

  // --- FLUXO NÃO AUTENTICADO ---
  if (!currentUser) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
              onGoToSignup={handleGoToSignup}
            />
          }
        />

        <Route
          path="/register"
          element={
            <Register 
              onLogin={handleRegisterSuccess} /*  Passamos a nova função aqui! */
              onGoToHome={() => navigate("/")} /*  Destino correto */
              onGoToLogin={() => navigate("/login")} 
            />
          }
        />

        <Route
          path="*"
          element={
            <WelcomePage
              onGoToLogin={() => navigate("/login")}
              onGoToSignup={handleGoToSignup}
            />
          }
        />
      </Routes>
    );
  }

  const currentUserId = currentUser.id;

  // --- FLUXO AUTENTICADO ---
  return (
    <Routes>
      {/* Rota /register apagada daqui para não causar conflitos com utilizadores logados */}

      <Route
        path="/"
        element={
          <HomePage
            userId={currentUserId}
            onGoToPlaylists={() => navigate("/playlists")}
            onGoToHome={() => navigate("/")}
            onGoToHistory={() => navigate("/history")}
            onGoToRecommendations={() => navigate("/recommendations")}
            onSelectMovie={(movie) => {
              setSelectedMovie(movie);
              navigate(`/movies/${movie.id}`);
            }}
            onGoToProfile={() => navigate("/perfil")}
          />
        }
      />

      <Route
        path="/playlists"
        element={
          <MinhasPlaylistsPage
            userId={currentUserId}
            onGoToHome={() => navigate("/")}
            onGoToRecommendations={() => navigate("/recommendations")}
          />
        }
      />

      <Route
        path="/history"
        element={
          <HistoryPage
            userId={currentUserId}
            onGoToHome={() => navigate("/")}
            onGoToPlaylists={() => navigate("/playlists")}
            onGoToHistory={() => navigate("/history")}
            onGoToProfile={() => navigate("/perfil")}
            onGoToRecommendations={() => navigate("/recommendations")}
          />
        }
      />

      <Route
        path="/recommendations"
        element={
          <RecomendadosPage
            userId={currentUserId}
            onGoToHome={() => navigate("/")}
            onGoToPlaylists={() => navigate("/playlists")}
            onGoToHistory={() => navigate("/history")}
            onGoToProfile={() => navigate("/perfil")} 
            onGoToRecommendations={() => navigate("/recommendations")}
            onSelectMovie={(movie) => {
              setSelectedMovie(movie);
              navigate(`/movies/${movie.id}`);
            }}
          />
        }
      />

      <Route
        path="/movies/:id"
        element={
          selectedMovie ? (
            <MovieDetailsPage
              movie={selectedMovie}
              userId={currentUserId}
              onGoBack={() => navigate(-1)}
            />
          ) : (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
              <p className="text-gray-400 font-semibold text-lg">
                Filme não selecionado.
              </p>

              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-[#FFC107] text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Voltar para a Página Principal
              </button>
            </div>
          )
        }
      />

      <Route
        path="/perfil"
        element={
          <AccountPage
            userId={currentUserId}
            onGoToHome={() => navigate("/")}
            onGoToPlaylists={() => navigate("/playlists")}
            onGoToHistory={() => navigate("/history")}
            onLogout={handleLogout}
          />
        }
      />

      {/* ✨ Rota de segurança: se tentar entrar em local proibido, é redirecionado para a Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;