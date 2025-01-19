"use client";
import React from "react";
import { useState } from "react";   
export default function page() {
const [dataType, setDataType] = useState("coin");
const setDataTypeHandler = (type) => {
    if (dataType === "coin") {
      setDataType("stock");
    } else {
      setDataType("coin");
    }
}
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
        <p className="text-center text-[#D50630">display is currently set to {dataType === "coin" ? " coin" : "stock" }</p>
      </div>
      <input type="text" className="bg-inherit border border-[#4A4A4A] h-[35px] w-[300px] rounded-[10px] mt-[40px] px-[10px] block m-auto" placeholder={` Input ${dataType === "coin" ? "coin" : "stock" } to search `} />
    </div>
  );
}
