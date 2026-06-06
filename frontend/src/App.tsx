import { useState } from "react";
import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { MinhasPlaylistsPage } from "./pages/MinhasPlaylists/MinhasPlaylistsPage";
import { MovieDetailsPage } from "./pages/MovieDetails/MovieDetailsPage";
import type { Movie } from "./types";

type CurrentPage = "home" | "playlists" | "movie-details";

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
      onSelectMovie={(movie) => {
        setSelectedMovie(movie);
        setCurrentPage("movie-details");
      }}
    />
  );
}

export default App;