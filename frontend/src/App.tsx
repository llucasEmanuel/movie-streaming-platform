import { useState } from "react";
import "./App.css";
import { HomePage } from "./pages/Home/HomePage";
import { MinhasPlaylistsPage } from "./pages/MinhasPlaylists/MinhasPlaylistsPage";

type CurrentPage = "home" | "playlists";

function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>("home");

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

  return (
    <HomePage
      userId={currentUser.id}
      onGoToPlaylists={() => setCurrentPage("playlists")}
    />
  );
}

export default App;