// server.js
import express from "express";
import cors from "cors";
import yahooFinance from "yahoo-finance2";

const app = express();
app.use(cors());

function getStartDate(range) {
  const now = new Date();
  switch (range) {
    case "1M":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "6M":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "1Y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "5Y":
      return new Date(now.setFullYear(now.getFullYear() - 5));
    default:
      return new Date(now.setFullYear(now.getFullYear() - 1));
  }
}

app.get("/api/stock/:tickers", async (req, res) => {
  try {
    const { tickers } = req.params; // e.g. "AAPL,MSFT"
    const { range = "1Y" } = req.query;
    const startDate = getStartDate(range);

    const tickerList = tickers.split(",");

    const results = {};
    for (const ticker of tickerList) {
      const history = await yahooFinance.historical(ticker, {
        period1: startDate,
        interval: "1d",
      });

      const summary = await yahooFinance.quoteSummary(ticker, {
        modules: [
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "earnings",
        ],
      });

      results[ticker.toUpperCase()] = { history, summary };
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
