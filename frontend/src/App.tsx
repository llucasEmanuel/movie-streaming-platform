import { useState } from "react";
import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { MinhasPlaylistsPage } from "./pages/MinhasPlaylists/MinhasPlaylistsPage";
import { HistoryPage } from "./pages/History/HistoryPage"; 
import { MovieDetailsPage } from "./pages/MovieDetails/MovieDetailsPage";
import type { Movie } from "./types";

// 2. ADICIONADO "history" NAS OPÇÕES DE TELA
type CurrentPage = "home" | "playlists" | "history" | "movie-details";

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>("home");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const currentUser = {
    id: "Victoria",
    name: "Victoria",
  };

  if (currentPage === "playlists") {
    return (
      <MinhasPlaylistsPage
        userId={currentUser.id}
        onGoToHome={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "history") {
    return (
      <HistoryPage
        onGoToHome={() => setCurrentPage("home")}
        onGoToPlaylists={() => setCurrentPage("playlists")}
        onGoToHistory={() => setCurrentPage("history")}
      />
    );
  }
  if (currentPage === "movie-details" && selectedMovie) {
    return (
      <MovieDetailsPage
        movie={selectedMovie}
        userId={currentUser.id}
        onGoToHome={() => setCurrentPage("home")}
      />
    );
  }

  return (
    <HomePage
      userId={currentUser.id}
      onGoToPlaylists={() => setCurrentPage("playlists")}
      onGoToHome={() => setCurrentPage("home")}
      onGoToHistory={() => setCurrentPage("history")}
      onSelectMovie={(movie) => {
        setSelectedMovie(movie);
        setCurrentPage("movie-details");
      }}
    />
  );
}

export default App;