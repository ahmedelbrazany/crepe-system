"use client";
import React from "react";

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

export default function HomePage() {
  const [status, setStatus] = useState("");
  const stat = async () => {
    const result = await window.electron.fetchData();
    console.log(result);
    let msg = `قاعدة البيانات: ${result.status === "connected" ? "جاهزة" : "مش جاهزة"} - عدد الطابعات: ${result.printers}`;
    setStatus(msg);
  };
  useEffect(() => {
    stat();
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Kemo Crepe</title>
      </Head>
      <div className="grid grid-cols-1 text-2xl w-full text-center">
        <h1>
          مرحبا بك في <span className="highlight-yellow">كيمو</span> كريب سيستم
        </h1>
        <h3> {status} </h3>
        <div className="selectRouteHome mt-4">
          <Link href="/orders">
            <button className="custom-button"> الاوردرات </button>
          </Link>
          <Link href="/menu">
            <button className="custom-button"> المنيو </button>
          </Link>
          <Link href="/clients/search">
            <button className="custom-button"> العملاء </button>
          </Link>
          <Link href="/kemo">
            <button className="custom-button"> صفحة لكيمو </button>
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
}
