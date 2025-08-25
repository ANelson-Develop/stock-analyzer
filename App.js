import React, { useState } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = ["blue", "red", "green", "orange", "purple"];

function App() {
  const [tickers, setTickers] = useState("");
  const [data, setData] = useState(null);
  const [range, setRange] = useState("1Y");

  const fetchStock = async (selectedRange = range) => {
    if (!tickers) return;
    const res = await axios.get(
      `http://localhost:5000/api/stock/${tickers}?range=${selectedRange}`
    );
    setData(res.data);
    setRange(selectedRange);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📈 Stock Analyzer (Comparison Dashboard)</h1>
      <input
        type="text"
        placeholder="Enter tickers (e.g. AAPL,MSFT,GOOG)"
        value={tickers}
        onChange={(e) => setTickers(e.target.value)}
        style={{ width: "300px" }}
      />
      <button onClick={() => fetchStock()}>Fetch</button>

      {data && (
        <div>
          {/* Range Selector */}
          <div style={{ marginBottom: "10px" }}>
            {["1M", "6M", "1Y", "5Y"].map((r) => (
              <button
                key={r}
                onClick={() => fetchStock(r)}
                style={{
                  marginRight: "5px",
                  backgroundColor: r === range ? "lightblue" : "white",
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Stock Price Comparison Chart */}
          <Line
            data={{
              labels: Object.values(data)[0].history.map((h) =>
                h.date.substring(0, 10)
              ),
              datasets: Object.keys(data).map((ticker, i) => ({
                label: ticker,
                data: data[ticker].history.map((h) => h.close),
                borderColor: COLORS[i % COLORS.length],
                fill: false,
              })),
            }}
          />

          {/* Financial Metrics Table */}
          <h2 style={{ marginTop: "20px" }}>📊 Financial Metrics</h2>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>P/E Ratio</th>
                <th>EBITDA</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(data).map((ticker) => (
                <tr key={ticker}>
                  <td>{ticker}</td>
                  <td>
                    {data[ticker].summary.defaultKeyStatistics?.forwardPE || "N/A"}
                  </td>
                  <td>
                    {data[ticker].summary.financialData?.ebitda?.fmt || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quarterly EPS Comparison */}
          <h2 style={{ marginTop: "20px" }}>📊 Quarterly EPS Comparison</h2>
          <Bar
            data={{
              labels:
                data[Object.keys(data)[0]].summary.earnings?.earningsChart?.quarterly.map(
                  (q) => q.date
                ) || [],
              datasets: Object.keys(data).map((ticker, i) => ({
                label: `${ticker} EPS`,
                data:
                  data[ticker].summary.earnings?.earningsChart?.quarterly.map(
                    (q) => q.actual?.raw || 0
                  ) || [],
                backgroundColor: COLORS[i % COLORS.length],
              })),
            }}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "Quarterly EPS (Reported)",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
