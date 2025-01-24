"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
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

export default function CryptoChart({ coin = "BTC" }) {
  const [cryptoSymbol, setCryptoSymbol] = useState(coin);
  const [cryptoData, setCryptoData] = useState([]);
  const [cryptoDetails, setCryptoDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [Coin, setCoin] = useState([]);  // Initialize as an empty array

  const API_KEY = process.env.NEXT_PUBLIC_CRYPTO_COMPARE_API_KEY;

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      setError(null);
      try {
        const historyResponse = await axios.get(
          `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${cryptoSymbol}&tsym=USD&limit=6&api_key=${API_KEY}`
        );

        const detailsResponse = await axios.get(
          `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${cryptoSymbol}&tsyms=USD&api_key=${API_KEY}`
        );

        if (
          historyResponse.data &&
          historyResponse.data.Data &&
          historyResponse.data.Data.Data &&
          detailsResponse.data &&
          detailsResponse.data.RAW
        ) {
          const formattedData = historyResponse.data.Data.Data.map((entry) => ({
            date: new Date(entry.time * 1000).toISOString().split("T")[0],
            close: entry.close,
            open: entry.open,
            volume: entry.volumeto,
          }));

          setCryptoData(formattedData);

          const marketData = detailsResponse.data.RAW[cryptoSymbol].USD;
          setCryptoDetails({
            currentPrice: marketData.PRICE,
            openPrice: marketData.OPENDAY,
            marketCap: marketData.MKTCAP,
            volume: marketData.VOLUME24HOURTO,
          });
        } else {
          setCryptoData([]);
        }
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setError("Failed to fetch cryptocurrency data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, [cryptoSymbol, API_KEY]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          `https://min-api.cryptocompare.com/data/all/coinlist?api_key=${API_KEY}`
        );
        if (response.data && response.data.Data) {
          setCoin(Object.values(response.data.Data));
        } else {
          setCoin([]);
        }
      } catch (error) {
        console.error("Error fetching coins:", error);
      }
    };

    fetchCoins();
  }, [API_KEY]);

  const memorizedCoins = useMemo(() => Array.isArray(Coin) ? Coin : [], [Coin]);

  const filteredCoins = useMemo(() => {
    if (!cryptoSymbol.trim() || !memorizedCoins.length) return [];
    return memorizedCoins
      .filter(
        (coin) =>
          coin.FullName?.toLowerCase().includes(cryptoSymbol.trim().toLowerCase()) ||
          coin.Symbol?.toLowerCase().includes(cryptoSymbol.trim().toLowerCase())
      )
      .slice(0, 10);
  }, [memorizedCoins, cryptoSymbol]);

  const chartData = {
    labels: cryptoData.map((item) => item.date),
    datasets: [
      {
        label: `${cryptoSymbol}/USD Closing Price`,
        data: cryptoData.map((item) => item.close),
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Crypto Chart: {cryptoSymbol}/USD</h2>

      <input
        type="text"
        placeholder="Enter coin symbol (e.g. ETH)"
        value={cryptoSymbol}
        onChange={(e) => setCryptoSymbol(e.target.value.toUpperCase())}
        className="border p-2 rounded w-full max-w-md mx-auto block mb-4 text-black"
      />
      
      {filteredCoins.length > 0 ? (
            filteredCoins.map((coin) => (
              <p key={coin.Id} onClick={() => setCryptoSymbol(coin.Symbol)} >
                {coin.FullName}
              </p>
            ))
          ) : (
            <p>No coins searched</p>
          )
        }
      {loading && <p className="text-center">Loading cryptocurrency data...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {cryptoDetails.currentPrice && (
        <div className="text-center mb-4">
          <p><strong>Current Price:</strong> ${cryptoDetails.currentPrice.toFixed(2)}</p>
          <p><strong>Open Price:</strong> ${cryptoDetails.openPrice.toFixed(2)}</p>
          <p>
            <strong>24 Hours Price Change:</strong>
             <span className={`font-bold ${cryptoDetails.currentPrice - cryptoDetails.openPrice < 0 ? "text-red-500" : "text-green-500"}`}>
              {(cryptoDetails.currentPrice - cryptoDetails.openPrice).toFixed(2)}
             </span>
          </p>
          <p><strong>Market Cap:</strong> ${cryptoDetails.marketCap.toLocaleString()}</p>
          <p><strong>24H Volume:</strong> ${cryptoDetails.volume.toLocaleString()}</p>
        </div>
      )}

      {cryptoData.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} height={400} />
        </div>
      )}
    </div>
  );
}
