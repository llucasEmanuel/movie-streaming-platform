import { useState } from "react";
import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { MinhasPlaylistsPage } from "./pages/MinhasPlaylists/MinhasPlaylistsPage";

type CurrentPage = "home" | "playlists";

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>("home");

  if (currentPage === "playlists") {
    return <MinhasPlaylistsPage onGoToHome={() => setCurrentPage("home")} />;
  }

  return <HomePage onGoToPlaylists={() => setCurrentPage("playlists")} />;
}

export default App;