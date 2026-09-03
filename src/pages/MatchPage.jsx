import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function MatchPage() {
  const { matchId } = useParams();

  const [match, setMatch] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatch() {
      try {
        setLoading(true);
        setError("");

        const matchesResponse = await fetch(
          "http://localhost:5000/api/matches"
        );

        if (!matchesResponse.ok) {
          throw new Error("Failed to load matches");
        }

        const matchesData = await matchesResponse.json();

        const foundMatch = matchesData.data.find(
          (item) => item.matchId === matchId
        );

        if (!foundMatch) {
          throw new Error("Match not found");
        }

        setMatch(foundMatch);

        const scorecardResponse = await fetch(
          `http://localhost:5000/api/matches/${matchId}/scorecard`
        );

        if (scorecardResponse.ok) {
          const scorecardData = await scorecardResponse.json();
          setScorecard(scorecardData.data);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-message">
          Loading match...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="match-page">

      <header className="match-header">
        <div>
          <p className="tournament-name">
            {match.tournamentName}
          </p>

          <h1>{match.matchTitle}</h1>
        </div>

        <div className="match-status">
          {match.matchStatus}
        </div>
      </header>

      <section className="match-info">

        <div className="info-item">
          <span>FORMAT</span>
          <strong>{match.matchFormat}</strong>
        </div>

        <div className="info-item">
          <span>DATE</span>
          <strong>{match.matchDate}</strong>
        </div>

        <div className="info-item">
          <span>TIME</span>
          <strong>{match.matchTime}</strong>
        </div>

      </section>

      <section className="teams-section">

        {match.teams.map((team) => (
          <div className="team-card" key={team.teamId}>

            <h2>{team.teamName}</h2>

            <div className="team-score">
              {team.teamScore || "Yet to bat"}
            </div>

          </div>
        ))}

      </section>

      <section className="scorecard-section">

        <h2>Scorecard</h2>

        {scorecard?.innnings?.length === 0 && (
          <div className="no-score">
            <h3>Match has not started</h3>
            <p>
              Live scorecard information will appear here
              once the match begins.
            </p>
          </div>
        )}

        {!scorecard && (
          <div className="no-score">
            <h3>No scorecard available</h3>
          </div>
        )}

      </section>

    </div>
  );
}

export default MatchPage;