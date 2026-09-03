const STUMPS_BASE_URL = "https://api.stumpsapp.com";

async function stumpsRequest(endpoint) {
  const response = await fetch(`${STUMPS_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      apiKey: process.env.STUMPS_API_KEY,
      Token: process.env.STUMPS_TOKEN,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `STUMPS API error ${response.status}: ${errorText}`
    );
  }

  return response.json();
}

async function getClubMatches() {
  const clubId = process.env.STUMPS_CLUB_ID;

  if (!clubId) {
    throw new Error("STUMPS_CLUB_ID is not configured");
  }

  return stumpsRequest(`/clubs/id/${clubId}/matches`);
}

async function getScorecard(matchId) {
  return stumpsRequest(`/matches/id/${matchId}/scorecard`);
}

async function getSquad(matchId) {
  return stumpsRequest(`/matches/id/${matchId}/squad`);
}

module.exports = {
  getClubMatches,
  getScorecard,
  getSquad,
};