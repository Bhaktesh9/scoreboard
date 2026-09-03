function DisplayPage() {
  return (
    <div className="display-page">
      <header className="display-header">
        <div>
          <span className="live-indicator">● LIVE</span>
          <h1>Cricket Live</h1>
        </div>

        <div className="match-info">
          <span>Friendly Match</span>
        </div>
      </header>

      <main className="scoreboard">
        <section className="team-section">
          <p className="innings-label">1st INNINGS</p>

          <h2>Team A</h2>

          <div className="score">
            0<span>/0</span>
          </div>

          <p className="overs">0.0 Overs</p>
        </section>

        <section className="batting-section">
          <h3>BATTERS</h3>

          <div className="player-row">
            <span>Player 1 *</span>
            <strong>0</strong>
          </div>

          <div className="player-row">
            <span>Player 2</span>
            <strong>0</strong>
          </div>
        </section>

        <section className="bowling-section">
          <h3>BOWLER</h3>

          <div className="bowler-info">
            <strong>Bowler 1</strong>
            <span>0 - 0 - 0 - 0</span>
          </div>
        </section>

        <section className="recent-balls">
          <h3>LAST 6 BALLS</h3>

          <div className="balls">
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
            <span>-</span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DisplayPage;