export function getInnings(scorecard) {
  return scorecard?.innnings || [];
}

export function getCurrentInnings(scorecard) {
  const innings = getInnings(scorecard);

  if (innings.length === 0) {
    return null;
  }

  // Look from the latest innings backwards.
  // This allows the scoreboard to automatically
  // switch from the 1st innings to the 2nd innings.
  const activeInnings = [...innings]
    .reverse()
    .find(
      (inning) =>
        inning.totalBalls > 0 ||
        inning.teamScore !== null
    );

  return activeInnings || innings[0];
}

export function getTeamScore(innings) {
  if (!innings) {
    return {
      runs: 0,
      wickets: 0,
      overs: "0.0",
      balls: 0,
    };
  }

  return {
    runs: innings.teamScore ?? 0,
    wickets: innings.wickets ?? 0,
    overs: innings.overs ?? "0.0",
    balls: innings.totalBalls ?? 0,
  };
}

export function getBatsmen(innings) {
  const players = innings?.battingPlayers || [];

  // Only show players who are currently batting
  return players.filter(
    (player) => player.dismissalStatus === "batting"
  );
}

export function getBowlers(innings) {
  const players = innings?.bowlingPlayers || [];

  if (players.length === 0) {
    return [];
  }

  const currentBowler = [...players].sort(
    (a, b) => (b.bowlOrder ?? 0) - (a.bowlOrder ?? 0)
  )[0];

  return [currentBowler];
}
export function getExtras(innings) {
  const extras = innings?.inningsExtras;

  return {
    total: extras?.total ?? 0,
    wides: extras?.wides ?? 0,
    noBalls: extras?.noBalls ?? 0,
    byes: extras?.byes ?? 0,
    legByes: extras?.legByes ?? 0,
    penalty: extras?.penalty ?? 0,
  };
}

export function formatScore(innings) {
  const score = getTeamScore(innings);

  return `${score.runs}/${score.wickets}`;
}

export function formatOvers(innings) {
  const score = getTeamScore(innings);

  return `${score.overs} OV`;
}

export function isInningsStarted(innings) {
  if (!innings) {
    return false;
  }

  return (
    innings.totalBalls > 0 ||
    innings.teamScore !== null
  );
}

export function isInningsComplete(innings) {
  if (!innings) {
    return false;
  }

  return (
    innings.dismissalStatus === "completed" ||
    innings.status === "completed"
  );
}