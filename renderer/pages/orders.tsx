"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, X } from "lucide-react";

interface Ingredient {
  name: string;
  price: number;
}

interface MenuItem {
  id: number;
  name: string;
  baseIngredients: string[];
  sizePrices: {
    normal?: number;
    large?: number;
    xl?: number;
  };
}

interface Category {
  id: number;
  name: string;
  items: MenuItem[];
  sharedAddons: Ingredient[];
}

interface OrderItem {
  categoryName: string;
  itemName: string;
  size: "normal" | "large" | "xl";
  price: number;
  quantity: number;
  freeAddons: string[];
  paidAddons: Ingredient[];
}

const OrderPage: React.FC = () => {
  const [defaultNumber, setDefaultNumber] = useState<string | null>(null);
  const [deliveryTax, setDeliveryTax] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<"normal" | "large" | "xl">(
    "normal"
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedFreeAddons, setSelectedFreeAddons] = useState<string[]>([]);
  const [selectedPaidAddons, setSelectedPaidAddons] = useState<Ingredient[]>(
    []
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(30);
  const [displayNumber, setDisblayNumber] = useState<string | null>(null);
  const [displayName, setDisblayName] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [adress, setAdress] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const num = params.get("number");
      const ad = params.get("adress");
      if (!num) return;
      setDefaultNumber(num);
      setDeliveryTax(20);
      if (ad) setAdress(ad);
      console.log(ad);
    }
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && orderItems.length > 0) {
        handleSubmitOrder();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [orderItems]);
  useEffect(() => {
    const fetchMenu = async () => {
      const result = await window.electron.fetchMenu();
      setCategories(result || []);
    };
    fetchMenu();
    console.log(defaultNumber);
  }, []);

  const handleAddToOrder = () => {
    if (!selectedItem || !selectedCategory) return;
    const basePrice = selectedItem.sizePrices[selectedSize] || 0;
    const addonsPrice = selectedPaidAddons.reduce((sum, a) => sum + a.price, 0);
    const order: OrderItem = {
      categoryName: selectedCategory.name,
      itemName: selectedItem.name,
      size: selectedSize,
      price: basePrice + addonsPrice,
      quantity,
      freeAddons: selectedFreeAddons,
      paidAddons: selectedPaidAddons,
    };
    setOrderItems([...orderItems, order]);
    resetForm();
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedItem(null);
    setSelectedSize("normal");
    setQuantity(1);
    setSelectedFreeAddons([]);
    setSelectedPaidAddons([]);
  };
  console.log(defaultNumber);

  const handleSubmitOrder = async () => {
    try {
      const result = await window.electron.sendOrder({
        orderItems,
        defaultNumber,
        deliveryTax,
        estimatedTime,
        displayNumber,
        displayName,
        notes,
      });
      if (result?.success) {
        setOrderItems([]);
        setSaveStatus("✅ تم حفظ الاوردر");
        setDefaultNumber(null);
        setDeliveryTax(0);
        setDisblayName(null);
        setNotes(null);
        const newUrl = window.location.pathname; // إبقاء نفس المسار بدون معلمات
        window.history.replaceState({}, "", newUrl);
      } else {
        setSaveStatus("❌ خطأ في حفظ الاوردر");
      }
    } catch (err) {
      console.error("Error sending order:", err);
      setSaveStatus("❌ خطأ في حفظ الاوردر");
    }
  };

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return itemsTotal + deliveryTax;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-white">
      <h1 className="text-3xl font-bold text-center">انشاء اوردر</h1>
      {defaultNumber ? (
        <h2 className="text-3xl font-bold text-center">
          {" "}
          للعميل : {defaultNumber}
        </h2>
      ) : null}
      {adress ? <h2>العنوان: {adress}</h2> : null}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full ${selectedCategory?.id === cat.id ? "bg-green-600" : "bg-zinc-700"}`}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {selectedCategory && (
        <>
          <h2 className="text-xl font-semibold">
            المنتجات في {selectedCategory.name}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {selectedCategory.items.map((item) => (
              <Card
                key={item.id}
                className="bg-zinc-800 p-4 cursor-pointer hover:ring ring-zinc-500"
                onClick={() => setSelectedItem(item)}
              >
                <CardContent>
                  <p className="text-lg font-bold">{item.name}</p>
                  <p className="text-sm opacity-70">
                    {item.baseIngredients.join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {selectedItem && (
        <div className="bg-zinc-800 border border-zinc-600 p-4 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">
            المنتج المختار: {selectedItem.name}
          </h2>
          <div className="flex gap-3">
            {Object.entries(selectedItem.sizePrices).map(
              ([size, price]) =>
                price &&
                price > 0 && (
                  <Button
                    key={size}
                    onClick={() => setSelectedSize(size as any)}
                    className={
                      selectedSize === size ? "bg-green-600" : "bg-zinc-700"
                    }
                  >
                    {size
                      .toUpperCase()
                      .replace("XL", "تربل")
                      .replace("LARGE", "دبل")
                      .replace("NORMAL", "عادي")}{" "}
                    - {price}ج
                  </Button>
                )
            )}
          </div>

          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            placeholder="الكمية"
            className="bg-zinc-700 border-zinc-500 w-32"
          />

          <h3 className="font-semibold mt-2">نوع الطلب (عادي او بدون)</h3>
          <div className="flex flex-wrap gap-2">
            {selectedItem.baseIngredients.map((ing) => (
              <Button
                key={ing}
                variant="outline"
                onClick={() =>
                  setSelectedFreeAddons((prev) =>
                    prev.includes(ing)
                      ? prev.filter((i) => i !== ing)
                      : [...prev, ing]
                  )
                }
                className={
                  selectedFreeAddons.includes(ing)
                    ? "bg-green-600"
                    : "bg-zinc-700"
                }
              >
                {ing}
              </Button>
            ))}
          </div>

          <h3 className="font-semibold mt-2">اختر اضافة مدفوعة</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategory &&
              selectedCategory.sharedAddons.map((addon) => (
                <Button
                  key={addon.name}
                  variant="outline"
                  onClick={() => {
                    const exists = selectedPaidAddons.find(
                      (a) => a.name === addon.name
                    );
                    setSelectedPaidAddons((prev) =>
                      exists
                        ? prev.filter((a) => a.name !== addon.name)
                        : [...prev, addon]
                    );
                  }}
                  className={
                    selectedPaidAddons.find((a) => a.name === addon.name)
                      ? "bg-green-600"
                      : "bg-zinc-700"
                  }
                >
                  {addon.name} ({addon.price}ج)
                </Button>
              ))}
          </div>

          <Button className="bg-green-700" onClick={handleAddToOrder}>
            <Plus className="mr-2 h-4 w-4" /> اضافة للاوردر
          </Button>
        </div>
      )}

      {orderItems.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-2xl font-semibold">:الاوردر</h2>
          {orderItems.map((order, idx) => (
            <div
              key={idx}
              className="bg-zinc-700 rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {order.itemName} ({order.size.toUpperCase()}) ×{" "}
                  {order.quantity}
                </p>
                <p className="text-sm">Free: {order.freeAddons.join(", ")}</p>
                <p className="text-sm">
                  Paid: {order.paidAddons.map((a) => a.name).join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">
                  {order.price * order.quantity}ج
                </span>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemoveOrderItem(idx)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {defaultNumber !== null ? (
            <div className="flex items-center gap-4">
              <label className="font-semibold">سعر التوصيل (ج):</label>
              <Input
                type="number"
                className="bg-zinc-700 border-zinc-500 w-32"
                value={deliveryTax}
                onChange={(e) => setDeliveryTax(Number(e.target.value))}
              />
            </div>
          ) : null}
          <h3 className="font-semibold mt-4">وقت التأخير (بالدقائق)</h3>
          <div className="flex gap-2">
            {[15, 20, 30, 45, 60].map((time) => (
              <Button
                key={time}
                onClick={() => setEstimatedTime(time)}
                className={
                  estimatedTime === time ? "bg-green-600" : "bg-zinc-700"
                }
              >
                {time} دقيقة
              </Button>
            ))}
          </div>
          <div className="text-right font-bold text-xl">
            الإجمالي الكلي: {calculateTotal()}ج
          </div>
          <Input
            placeholder="ملاحظة للاوردر"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full"
          />
          {!defaultNumber ? (
            <Input
              placeholder="اسم الزبون"
              value={displayName}
              onChange={(e) => setDisblayName(e.target.value)}
              className="w-full"
            />
          ) : null}
          {!defaultNumber ? (
            <Input
              placeholder="رقم الزبون"
              value={displayNumber}
              onChange={(e) => setDisblayNumber(e.target.value)}
              className="w-full"
            />
          ) : null}
          <Button className="bg-green-700 w-full" onClick={handleSubmitOrder}>
            <Save className="mr-2 h-4 w-4" /> تأكيد الاوردر
          </Button>

          {saveStatus && (
            <p className="text-center text-green-400 mt-2">{saveStatus}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderPage;
