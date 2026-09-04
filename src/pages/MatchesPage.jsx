import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://scoreboard-uuvq.onrender.com";

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadMatches() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/matches`);

      if (!response.ok) {
        throw new Error("Failed to load matches");
      }

      const result = await response.json();

      setMatches(result.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const liveMatches = matches.filter((match) => {
    const status = match.matchStatus?.toLowerCase();

    return status === "in progress" || status === "live";
  });

  const upcomingMatches = matches.filter(
    (match) => match.matchStatus?.toLowerCase() === "scheduled"
  );

  const otherMatches = matches.filter((match) => {
    const status = match.matchStatus?.toLowerCase();

    return !["in progress", "live", "scheduled"].includes(status);
  });

  function openMatch(matchId) {
    window.location.href = `/scoreboard/${matchId}`;
  }

  function getStatusLabel(match) {
    const status = match.matchStatus?.toLowerCase();

    if (status === "in progress" || status === "live") {
      return "LIVE";
    }

    if (status === "scheduled") {
      return "UPCOMING";
    }

    return match.matchStatus || "COMPLETED";
  }

  function getTeamScore(team) {
    return team?.teamScore || "";
  }

  function renderMatchCard(match) {
    const team1 = match.teams?.[0];
    const team2 = match.teams?.[1];

    const isLive =
      match.matchStatus?.toLowerCase() === "in progress" ||
      match.matchStatus?.toLowerCase() === "live";

    return (
      <article
        className={`match-card ${isLive ? "match-card-live" : ""}`}
        key={match.matchId}
        onClick={() => openMatch(match.matchId)}
      >
        <div className="match-card-header">
          <div className="match-meta">
            <span className="match-format-badge">
              {match.matchFormat || "MATCH"}
            </span>

            <span className="match-date">
              {match.matchDate || "Date unavailable"}
            </span>
          </div>

          <div
            className={`match-status ${
              isLive ? "match-status-live" : ""
            }`}
          >
            {isLive && <span className="status-live-dot"></span>}

            {getStatusLabel(match)}
          </div>
        </div>

        <div className="match-card-content">
          <div className="match-team match-team-left">
            <div className="team-name">
              {team1?.teamName || "Team 1"}
            </div>

            {getTeamScore(team1) && (
              <div className="team-score">
                {getTeamScore(team1)}
              </div>
            )}
          </div>

          <div className="match-vs">
            <span>VS</span>
          </div>

          <div className="match-team match-team-right">
            <div className="team-name">
              {team2?.teamName || "Team 2"}
            </div>

            {getTeamScore(team2) && (
              <div className="team-score">
                {getTeamScore(team2)}
              </div>
            )}
          </div>
        </div>

        <div className="match-card-footer">
          <div className="match-time">
            {match.matchTime || "Time unavailable"}
          </div>

          <button
            className="view-match-button"
            onClick={(event) => {
              event.stopPropagation();
              openMatch(match.matchId);
            }}
          >
            VIEW SCORECARD
            <span>→</span>
          </button>
        </div>
      </article>
    );
  }

  function renderSection(title, sectionMatches, live = false) {
    if (sectionMatches.length === 0) {
      return null;
    }

    return (
      <section className="matches-section">
        <div className="section-heading">
          <div className="section-heading-left">
            {live && <span className="section-live-dot"></span>}

            <h2>{title}</h2>
          </div>

          <span className="section-count">
            {sectionMatches.length}
          </span>
        </div>

        <div className="matches-list">
          {sectionMatches.map(renderMatchCard)}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="matches-page">
        <div className="matches-background-glow"></div>

        <div className="matches-loading">
          <div className="loading-spinner"></div>

          <div className="loading-title">
            LOADING MATCHES
          </div>

          <p>
            Fetching the latest cricket fixtures...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-page">
        <div className="matches-background-glow"></div>

        <div className="matches-error">
          <div className="error-icon">!</div>

          <span className="error-label">
            CONNECTION ERROR
          </span>

          <h2>Unable to load matches</h2>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={loadMatches}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  const tournamentName =
    matches[0]?.tournamentName || "Cricket Matches";

  return (
    <div className="matches-page">
      <div className="matches-background-glow"></div>

      <header className="matches-header">
        <div className="brand">
          <div className="brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="brand-copy">
            <span className="brand-label">
              CRICKET LIVE
            </span>

            <h1>Matches</h1>
          </div>
        </div>

        <button
          className="refresh-button"
          onClick={loadMatches}
          title="Refresh matches"
        >
          <span className="refresh-icon">↻</span>
          <span>Refresh</span>
        </button>
      </header>

      <main className="matches-container">
        <section className="matches-hero">
          <div className="hero-content">
            <span className="section-label">
              LIVE SCORE CENTRE
            </span>

            <h2>{tournamentName}</h2>

            <p>
              Follow live scores, upcoming fixtures and
              match results.
            </p>
          </div>

          <div className="hero-stat">
            <strong>{matches.length}</strong>
            <span>MATCHES</span>
          </div>
        </section>

        {renderSection(
          "LIVE NOW",
          liveMatches,
          true
        )}

        {renderSection(
          "UPCOMING MATCHES",
          upcomingMatches
        )}

        {renderSection(
          "MATCH RESULTS",
          otherMatches
        )}

        {matches.length === 0 && (
          <div className="no-matches">
            <div className="no-matches-icon">🏏</div>

            <span>NO FIXTURES</span>

            <h2>No matches available</h2>

            <p>
              There are currently no matches to display.
            </p>
          </div>
        )}
      </main>

      <footer className="matches-footer">
        <span>CRICKET LIVE</span>

        <span className="footer-divider">•</span>

        <span>LIVE MATCH CENTRE</span>
      </footer>
    </div>
  );
}

export default MatchesPage;