"use client";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

export default function page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [coins, setCoins] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [dataType, setDataType] = useState("coin");

  const setDataTypeHandler = () => {
    if (dataType === "coin") {
      setDataType("stock");
    } else {
      setDataType("coin");
    }
  };
  const API_KEY = process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY;
  const API_KEY2 = process.env.NEXT_PUBLIC_CRYPTO_COMPARE_API_KEY;

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          `https://min-api.cryptocompare.com/data/all/coinlist?api_key=${API_KEY2}`
        );
        if (response.data && response.data.Data) {
          setCoins(Object.values(response.data.Data));
        } else {
          setCoins([]);
        }
      } catch (error) {
        console.error("Error fetching coins:", error);
      }
    };

    fetchCoins();
  }, [API_KEY2]);
  const memorizedCoins = useMemo(() => coins, [coins]);

  useEffect(() => {
    const fetchStockList = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${API_KEY}`
        );
        const parsedData = Papa.parse(response.data, { header: true });
        setStockData(parsedData.data);
      } catch (error) {
        console.error("Error fetching stock list:", error);
      }
    };

    fetchStockList();
  }, [API_KEY]);
  const memoizedStockData = useMemo(() => stockData, [stockData]);

  const filteredCoins = useMemo(() => {
    if (!searchQuery) return [];
    return memorizedCoins
      .filter((coin) =>
        coin.FullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10);
  }, [memorizedCoins, searchQuery]);

  const filteredStockData = useMemo(() => {
    if (!searchQuery) return [];
    return memoizedStockData
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        // stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10);
  }, [memoizedStockData, searchQuery]);

  return (
    <div className=" pt-[25px]">
      <div>
        <h1 className="text-[#0059DE] text-[30px] font-bold text-center">
          Trackit
        </h1>
        <p className="italic text-center mt-[-5px]">
          Your one stop shop for price tracking.......
        </p>
      </div>
      <div>
        <button
          className="bg-[#0059DE] text-white w-[150px] h-[40px] rounded-[10px] mt-[40px] block m-auto"
          onClick={setDataTypeHandler}
        >
          {dataType === "coin" ? "Switch to Stock" : "Switch to Coin"}
        </button>
        <p className="text-center text-[#D50630">
          display is currently set to {dataType === "coin" ? " coin" : "stock"}
        </p>
      </div>
      <input
        type="text"
        className="bg-inherit border border-[#4A4A4A] h-[35px] w-[300px] rounded-[10px] mt-[40px] px-[10px] block m-auto"
        placeholder={` Input ${
          dataType === "coin" ? "coin" : "stock"
        } to search `}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="mt-[20px]">
        {dataType === "coin" ? (
          filteredCoins.length > 0 ? (
            filteredCoins.map((coin) => (
              <p key={coin.Id}>
                {coin.FullName} ({coin.Symbol})
              </p>
            ))
          ) : (
            <p>No coins searched</p>
          )
        ) : filteredStockData.length > 0 ? (
          filteredStockData.map((stock, index) => (
            <p key={index}>
              {stock.name} ({stock.symbol})
            </p>
          ))
        ) : (
          <p>No stocks searched</p>
        )}
      </div>
    </div>
  );
}
