const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  getClubMatches,
  getScorecard,
  getSquad,
} = require("./services/stumps");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ------------------------------------
// BASIC HEALTH CHECK
// ------------------------------------

app.get("/", (req, res) => {
  res.json({
    message: "Cricket Scoreboard API is running!",
  });
});


// ------------------------------------
// BACKEND HEALTH CHECK
// ------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is working",
  });
});


// ------------------------------------
// GET CLUB MATCHES
// ------------------------------------

app.get("/api/matches", async (req, res) => {
  try {
    const matches = await getClubMatches();

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error("Error getting matches:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ------------------------------------
// GET SCORECARD
// ------------------------------------

app.get("/api/matches/:matchId/scorecard", async (req, res) => {
  try {
    const { matchId } = req.params;

    const scorecard = await getScorecard(matchId);

    res.json({
      success: true,
      data: scorecard,
    });
  } catch (error) {
    console.error("Error getting scorecard:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ------------------------------------
// GET SQUAD
// ------------------------------------

app.get("/api/matches/:matchId/squad", async (req, res) => {
  try {
    const { matchId } = req.params;

    const squad = await getSquad(matchId);

    res.json({
      success: true,
      data: squad,
    });
  } catch (error) {
    console.error("Error getting squad:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// ------------------------------------
// START SERVER
// ------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});