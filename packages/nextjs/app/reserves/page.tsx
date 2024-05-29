"use client";

import React, { useEffect, useState } from "react";
// import { NextUIProvider } from '@nextui-org/react';
// import CardComponent from '../../components/CardComponent';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { CalendarDate, DatePicker } from "@nextui-org/react";
import "~~/styles/table.css";

const Home = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const user_id = "xbWIIUFPHxUnNuNsKAzdxXunfPk2";
  const columns = [
    {
      key: "day",
      label: "Day",
    },
    {
      key: "open_time",
      label: "Open Time",
    },
    {
      key: "close_time",
      label: "Close Time",
    },
    {
      key: "tolerance_time",
      label: "Tolerance Time",
    },
    {
      key: "number_of_tables",
      label: "Number of Tables",
    },
    {
      key: "number_of_persons",
      label: "Number of Persons",
    },
  ];

  const fetchData = async () => {
    // Substitua pela URL da sua API
    const response = await fetch(
      "http://127.0.0.1:5001/hackton-chainlink/us-central1/getReservationsDays?user_id=" + user_id,
    );
    let result = await response.json();
    result = result.map((item: any, index: any) => {
      return {
        key: index,
        day: Number(item.day),
        open_time: new Date(item.data.open_time).toUTCString(),
        close_time: new Date(item.data.close_time).toUTCString(),
        reservation_time: item.data.reservation_time / 1000 / 60,
        tolerance_time: item.data.tolerance_time / 1000 / 60,
        number_of_tables: item.data.number_of_tables,
        number_of_persons: item.data.number_of_persons,
      };
    });

    setData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) return;

    // conver startDate.year, startDate.month, startDate.day to timestamp
    // eslint-disable-next-line prettier/prettier
  const start = new Date(startDate.year, startDate.month - 1, startDate.day).getTime();
    console.log("🚀 ~ handleFilter ~ start:", start);
    const end = new Date(endDate.year, endDate.month - 1, endDate.day).getTime();
    console.log("🚀 ~ handleFilter ~ end:", end);

    const filteredData = data.filter((item: any) => {
      const day = item.day;
      console.log("🚀 ~ filteredData ~ day:", day);
      return day >= start && day <= end;
    });

    setData(filteredData);
  };

  const clearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    fetchData();
  };

  const renderCell = React.useCallback((item: any, columnKey: any) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "day":
        const date = new Date(cellValue);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        const formattedDate = `${year}-${month}-${day}`;
        return <p className="text-bold text-sm capitalize">{formattedDate}</p>;
      default:
        return cellValue;
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-start flex-direction p-5">
      <div className="flex flex-row justify-center items-center space-y-4 mb-5 gap-5">
        <h1 className="text-2xl">Restaurant ID: {user_id}</h1>
      </div>

      <div className="flex flex-row justify-center items-center space-y-4 mb-5 gap-5">
        <div className="flex space-x-4">
          <DatePicker
            label="Data Inicial"
            value={startDate}
            onChange={(date: any) => {
              setStartDate(date);
            }}
          />
          <DatePicker
            label="Data Final"
            value={endDate}
            onChange={(date: any) => {
              setEndDate(date);
            }}
          />
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleFilter}>
          Filtrar
        </button>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={clearFilter}>
          Limpar filtro
        </button>
      </div>

      <Table>
        <TableHeader columns={columns}>
          {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={data}>
          {(item: any) => (
            <TableRow key={item.key} className="table-row">
              {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Home;
