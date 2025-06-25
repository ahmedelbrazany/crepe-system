// app/clients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const Page = () => {
  const [number, setNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleGoToClientPage = () => {
    if (!number.trim()) {
      document.getElementById("number")?.focus();
      return setErrorMessage("❌ لم يتم العثور على العميل!");
    }
    router.push(`/clients/show?number=${number}`);
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleGoToClientPage();
  };

  useEffect(() => {
    document.getElementById("number")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleGoToClientPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [number]);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">اكتب رقم الهاتف</h1>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <label className="block text-sm font-medium">رقم الهاتف</label>
        <Input
          type="text"
          id="number"
          placeholder="رقم الهاتف"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full"
        />
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        <button className="custom-button" type="submit">
          البحث
        </button>
      </form>
    </div>
  );
};

export default Page;
