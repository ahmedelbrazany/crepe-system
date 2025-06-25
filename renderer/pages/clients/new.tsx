"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function AddClient() {
  const router = useRouter();

  const [defaultNumber, setDefaultNumber] = useState("");
  const [number, setNumber] = useState("");
  const [alt, setAlt] = useState("");
  const [name, setName] = useState("");
  const [adress, setAdress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // إنشاء مراجع لكل حقل إدخال

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const num = params.get("number") || "";
      setDefaultNumber(num);
      setNumber(num);
    }
  }, []);

  const handleInputChange = (index: string, value: string) => {
    if (index === "number") setNumber(value);
    else if (index === "name") setName(value);
    else if (index === "adress") setAdress(value);
    else if (index === "alt") setAlt(value);
  };

  const addClient = async () => {
    try {
      const result = await window.electron.addClient(number, name, adress, alt);
      if (result) {
        setErrorMessage("");
        router.push(`/clients/show?number=${number}`);
      } else {
        setErrorMessage("❌ حدث خطأ أثناء إضافة العميل");
      }
    } catch (error) {
      console.error("❌ خطأ أثناء إضافة العميل:", error);
      setErrorMessage("❌ حدث خطأ أثناء إضافة العميل!");
    }
  };

  const handleAddClient = async () => {
    if (!number.length) {
      setErrorMessage("❌ اكتب رقم العميل");
      document.getElementById("number")?.focus();
      return;
    }
    if (!alt.length) {
      setErrorMessage("❌ اكتب رقم احتياطي للعميل او 0");
      document.getElementById("alt")?.focus();
      return;
    }
    if (!name.length) {
      setErrorMessage("❌ اكتب اسم العميل");
      document.getElementById("name")?.focus();
      return;
    }
    if (!adress.length) {
      document.getElementById("adress")?.focus();
      setErrorMessage("❌ اكتب عنوان العميل");
      return;
    }
    setErrorMessage("");
    await addClient();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") handleAddClient();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [number, name, adress, alt]);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">إضافة عميل جديد</h1>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">رقم الهاتف</label>
          <Input
            id="number"
            placeholder="رقم الهاتف"
            value={number}
            onChange={(e) => handleInputChange("number", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">رقم احتياطي</label>
          <Input
            id="alt"
            placeholder="رقم احتياطي للشخص"
            value={alt}
            onChange={(e) => handleInputChange("alt", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">اسم العميل</label>
          <Input
            id="name"
            placeholder="اسم الشخص"
            value={name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">عنوان العميل</label>
          <Input
            id="adress"
            placeholder="عنوان الشخص"
            value={adress}
            onChange={(e) => handleInputChange("adress", e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <button className="custom-button" onClick={handleAddClient}>
        إضافة عميل
      </button>
    </div>
  );
}
