"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import Papa from "papaparse";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StockChart({ symbol = "AAPL" }) {
  const [stockSymbol, setStockSymbol] = useState(symbol);
  const [stockData, setStockData] = useState([]);
  const [stockData2, setStockData2] = useState([]);
  const [stockDetails, setStockDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY;

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${API_KEY}`
        );
        const timeSeries = response.data["Time Series (Daily)"];

        if (timeSeries) {
          const formattedData = Object.keys(timeSeries).map((date) => ({
            date,
            close: parseFloat(timeSeries[date]["4. close"]),
            volume: parseInt(timeSeries[date]["5. volume"]),
          }));

          setStockData(formattedData.slice(0, 7)); // Get the last 7 days of data

          // Extract latest price info
          const latestDay = Object.keys(timeSeries)[0];
          setStockDetails({
            currentPrice: parseFloat(timeSeries[latestDay]["4. close"]),
            volume: parseInt(timeSeries[latestDay]["5. volume"]),
            open: parseFloat(timeSeries[latestDay]["1. open"]),
            close: parseFloat(timeSeries[latestDay]["4. close"]),
          });
        } else {
          setStockData([]);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        setError("Failed to fetch stock data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [stockSymbol, API_KEY]);

  const chartData = {
    labels: stockData.map((item) => item.date),
    datasets: [
      {
        label: `${stockSymbol} Closing Price`,
        data: stockData.map((item) => item.close),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.2,
      },
    ],
  };
 
  useEffect(() => {
    const fetchStockList = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${API_KEY}`
        );
        console.log(response);
        
        const parsedData = Papa.parse(response.data, { header: true });
        setStockData2(parsedData.data);
        
      } catch (error) {
        console.error("Error fetching stock list:", error);
      }
    };

    fetchStockList();
  }, [API_KEY]);
  const memoizedStockData = useMemo(() => stockData2, [stockData2]);
  
  const filteredStockData = useMemo(() => {
      if (!stockSymbol) return [];
      return memoizedStockData
        .filter(
          (stock) =>
            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
          // stock.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10);
    }, [memoizedStockData, stockSymbol]);
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Stock Chart: {stockSymbol}</h2>

      <input
        type="text"
        placeholder="Enter stock symbol (e.g. TSLA)"
        value={stockSymbol}
        onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
        className="border p-2 rounded w-full max-w-md mx-auto block mb-4 text-black"
      />
      {filteredStockData.length > 0 ? (
          filteredStockData.map((stock, index) => (
            <p key={index} onClick={()=> setStockSymbol(stock.symbol)} >
            {stock.name}
            </p>
          ))
        ) : (
          <p>No stocks searched</p>
        )}

      {loading && <p className="text-center">Loading stock data...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {stockDetails.currentPrice && (
        <div className="text-center mb-4">
          <p><strong>Current Price:</strong> {stockDetails.currentPrice.toFixed(2)}</p>
          <p><strong>Trading Volume:</strong> {stockDetails.volume.toLocaleString()}</p>
          <p><strong>24 Hour Price Change:</strong> {(stockDetails.close - stockDetails.open).toFixed(2)}</p>
        </div>
      )}

      {stockData.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={400} />
        </div>
      )}
    </div>
  );
}

