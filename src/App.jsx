import { BrowserRouter, Routes, Route } from "react-router-dom";
import MatchesPage from "./pages/MatchesPage";
import MatchPage from "./pages/MatchPage";
import ScoreboardPage from "./pages/ScoreboardPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<MatchesPage />} />

        <Route
          path="/display/:matchId"
          element={<MatchPage />}
        />

        <Route
          path="/scoreboard/:matchId"
          element={<ScoreboardPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;