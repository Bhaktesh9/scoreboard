import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import {
  getInnings,
  getCurrentInnings,
  getTeamScore,
  getBatsmen,
  getBowlers,
  getExtras,
} from "../utils/scoreUtils";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function ScoreboardPage() {
  const { matchId } = useParams();

  const [match, setMatch] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ================================
  // LOAD SCOREBOARD
  // ================================

  const loadScoreboard = useCallback(
    async (signal) => {
      try {
        // ================================
        // GET MATCH INFORMATION
        // ================================

        const matchesResponse = await fetch(
          `${API_BASE}/api/matches`,
          {
            signal,
          }
        );

        if (!matchesResponse.ok) {
          throw new Error("Failed to load matches");
        }

        const matchesData = await matchesResponse.json();

        const foundMatch = matchesData.data?.find(
          (item) => item.matchId === matchId
        );

        if (!foundMatch) {
          setMatch(null);
          setError(null);
          setLoading(false);
          return;
        }

        setMatch(foundMatch);

        // ================================
        // GET LIVE SCORECARD
        // ================================

        const scorecardResponse = await fetch(
          `${API_BASE}/api/matches/${matchId}/scorecard`,
          {
            signal,
          }
        );

        if (!scorecardResponse.ok) {
          throw new Error("Failed to load scorecard");
        }

        const scorecardData = await scorecardResponse.json();

        setScorecard(scorecardData.data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        // AbortError means a newer request replaced this one.
        if (err.name === "AbortError") {
          return;
        }

        console.error("Scoreboard error:", err);

        setError(
          "Live scores are temporarily unavailable"
        );
      } finally {
        setLoading(false);
      }
    },
    [matchId]
  );

  // ================================
  // LIVE REFRESH
  // ================================

  useEffect(() => {
    if (!matchId) return;

    let controller = new AbortController();

    loadScoreboard(controller.signal);

    const interval = setInterval(() => {
      // Cancel previous request before starting
      // the next request.
      controller.abort();

      controller = new AbortController();

      loadScoreboard(controller.signal);
    }, 1000);

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [matchId, loadScoreboard]);

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="scoreboard-screen">
        <div className="scoreboard-loading">
          Loading scoreboard...
        </div>
      </div>
    );
  }

  // ================================
  // MATCH NOT FOUND
  // ================================

  if (!match) {
    return (
      <div className="scoreboard-screen">
        <div className="scoreboard-loading">
          Match not found
        </div>
      </div>
    );
  }

  // ================================
  // SCORE DATA
  // ================================

  const innings = getInnings(scorecard);

  const currentInnings =
    getCurrentInnings(scorecard);

  const currentScore =
    getTeamScore(currentInnings);

  const batsmen =
    getBatsmen(currentInnings);

  const bowlers =
    getBowlers(currentInnings);

  const extras =
    getExtras(currentInnings);

  // ================================
  // SECOND INNINGS
  // ================================

  // ================================
// SECOND INNINGS CHASE / RESULT
// ================================

const secondInnings = innings[1];

let chaseInfo = null;
let matchResult = null;

if (innings.length >= 2 && secondInnings) {
  const firstInnings = innings[0];
  const firstScore = getTeamScore(firstInnings);
  const secondScore = getTeamScore(secondInnings);

  const isSecondInnings =
    currentInnings?.inningsNo === secondInnings?.inningsNo;

  // ========================================
  // API CONFIRMS MATCH IS COMPLETED
  // ========================================

  if (
    match.matchStatus?.toLowerCase() === "completed" &&
    match.matchResult
  ) {
    matchResult = {
      winner: null,
      text: match.matchResult,
    };
  }

  // ========================================
  // SECOND INNINGS IS STILL LIVE
  // ========================================

  else if (isSecondInnings) {
    const target = firstScore.runs + 1;

    const runsNeeded = Math.max(
      target - secondScore.runs,
      0
    );

    // YOUR CURRENT MATCHES ARE 6 OVERS
    const TOTAL_OVERS = 6;
    const TOTAL_MATCH_BALLS = TOTAL_OVERS * 6;

    const ballsBowled = secondScore.balls ?? 0;

    const ballsRemaining = Math.max(
      TOTAL_MATCH_BALLS - ballsBowled,
      0
    );

    // Chasing team reaches target
    if (secondScore.runs >= target) {
      const wicketsRemaining = Math.max(
        10 - secondScore.wickets,
        0
      );

      matchResult = {
        winner: secondInnings.battingTeamName,
        text: `${secondInnings.battingTeamName.toUpperCase()} WIN BY ${wicketsRemaining} WICKETS`,
      };
    }

    // 6 overs completed or all wickets lost
    else if (
      ballsRemaining === 0 ||
      secondScore.wickets >= 10
    ) {
      const runsWonBy =
        firstScore.runs - secondScore.runs;

      if (runsWonBy === 0) {
        matchResult = {
          winner: null,
          text: "MATCH TIED",
        };
      } else {
        matchResult = {
          winner: firstInnings.battingTeamName,
          text: `${firstInnings.battingTeamName.toUpperCase()} WIN BY ${runsWonBy} RUNS`,
        };
      }
    }

    // Match still in progress
    else {
      chaseInfo = {
        runsNeeded,
        ballsRemaining,
        target,
      };
    }
  }
}

  // ================================
  // RENDER
  // ================================

  return (
    <div className="scoreboard-screen">

      {/* ================================
          HEADER
      ================================= */}

      <div className="scoreboard-tournament">
        {match.tournamentName}
      </div>

      <div className="scoreboard-title">
        {match.matchTitle}
      </div>

      <div className="scoreboard-status">
        {match.matchStatus}
      </div>

      {/* Persistent error strip.
          Keeps the previous good score visible
          if a refresh temporarily fails. */}

      {error && (
        <div className="scoreboard-error">
          {error}
        </div>
      )}

      {/* ================================
          LIVE TEAM SCORES
      ================================= */}

      <div className="scoreboard-teams">
        {innings.map((inning) => {
          const inningScore =
            getTeamScore(inning);

          return (
            <div
              className="scoreboard-team"
              key={inning.inningsNo}
            >
              <h2>
                {inning.battingTeamName}
              </h2>

              <div className="scoreboard-score">
                {inningScore.runs}/
                {inningScore.wickets}
              </div>

              <div className="scoreboard-overs">
                {inningScore.overs} OV
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================
          MAIN LIVE SCORECARD
      ================================= */}

      <div className="scoreboard-main">

        {currentInnings ? (
          <>
            {/* ================================
                CURRENT INNINGS
            ================================= */}

            <div className="innings-heading">

              <div className="innings-heading-main">

                <h1>
                  {currentInnings.battingTeamName}
                </h1>

                <div className="large-score">
                  {currentScore.runs}/
                  {currentScore.wickets}
                </div>

                <div className="large-overs">
                  {currentScore.overs} overs
                </div>

              </div>

              {/* =================================
                  CHASE PILL

                  IMPORTANT:
                  This ONLY renders when chaseInfo
                  exists, which only happens during
                  the SECOND INNINGS.
              ================================== */}

              {chaseInfo && (
                <div className="chase-pill">

                  <span className="pill-runs">
                    {chaseInfo.runsNeeded}
                  </span>

                  <span className="pill-label">
                    off{" "}
                    {chaseInfo.ballsRemaining}{" "}
                    balls
                  </span>

                </div>
              )}

            </div>

            {/* ================================
                BATSMEN
            ================================= */}

            <div className="current-batsmen">

              <h2>BATSMEN</h2>

              <div className="score-table-header">
                <span>PLAYER</span>
                <span>R</span>
                <span>B</span>
                <span>SR</span>
              </div>

              {batsmen.length > 0 ? (
                batsmen.map((player) => (
                  <div
                    className="batsman-row"
                    key={player.profileId}
                  >
                    <span className="batsman-name">
                      {player.playerName}

                      {player.dismissalStatus ===
                        "batting" && (
                        <strong> *</strong>
                      )}
                    </span>

                    <span>
                      {player.runs ?? 0}
                    </span>

                    <span>
                      {player.balls ?? 0}
                    </span>

                    <span>
                      {player.strikeRate ??
                        "0.00"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-score-row">
                  No batting data available
                </div>
              )}

            </div>

            {/* ================================
                BOWLER
            ================================= */}

            <div className="current-bowler">

              <h2>BOWLER</h2>

              <div className="score-table-header">
                <span>PLAYER</span>
                <span>O</span>
                <span>R</span>
                <span>W</span>
              </div>

              {bowlers.length > 0 ? (
                bowlers.map((player) => (
                  <div
                    className="bowler-row"
                    key={player.profileId}
                  >
                    <span>
                      {player.playerName}
                    </span>

                    <span>
                      {player.overs ?? "0.0"}
                    </span>

                    <span>
                      {player.runsConceded ?? 0}
                    </span>

                    <span>
                      {player.wickets ?? 0}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-score-row">
                  No bowling data available
                </div>
              )}

            </div>

            {/* ================================
                EXTRAS
            ================================= */}

            <div className="extras">

              <strong>EXTRAS</strong>

              <span>
                {extras.total}
              </span>

            </div>

            {/* ================================
                EXTRA BREAKDOWN
            ================================= */}

            <div className="extras-breakdown">

              <span>
                WD: {extras.wides}
              </span>

              <span>
                NB: {extras.noBalls}
              </span>

              <span>
                B: {extras.byes}
              </span>

              <span>
                LB: {extras.legByes}
              </span>

            </div>

          </>
        ) : (

          /* ================================
             NO INNINGS
          ================================= */

          <div className="match-not-started">

            <h1>
              MATCH NOT STARTED
            </h1>

            <p>
              Live score will appear here
              when the match begins.
            </p>

          </div>
        )}

      </div>

      {/* ========================================
          MATCH RESULT
      ======================================== */}

      {matchResult && (
        <div className="match-result">

          <div className="result-trophy">
            🏆
          </div>

          <div className="result-label">
            MATCH RESULT
          </div>

          <div className="result-text">
            {matchResult.text}
          </div>

        </div>
      )}

      {/* ================================
          FOOTER
      ================================= */}

      <div className="scoreboard-footer">

        <span>
          {match.matchFormat}
        </span>

        <span>
          {match.matchDate}
        </span>

        <span>
          {match.matchTime}
        </span>

        <span>
          LIVE • AUTO REFRESH 1s
        </span>

      </div>

    </div>
  );
}

export default ScoreboardPage;

