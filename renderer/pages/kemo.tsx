"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dayjs, { Dayjs } from "dayjs";

type OrderItem = {
  itemName: string;
  size: string;
  quantity: number;
  price: number;
  freeAddons?: string[];
  paidAddons?: { name: string; price: number }[];
};

type OrderType = {
  _id: string;
  num: number;
  client: string;
  total_price: number;
  order: OrderItem[];
  createAt: number;
};

type DataType = {
  total_cash: number;
  orders: OrderType[];
};

export default function KemoPage() {
  const [step, setStep] = useState<"auth" | "result">("auth");
  const [password, setPassword] = useState("");
  const [date, setDate] = useState<Dayjs>(dayjs().subtract(8, "hour"));
  const [data, setData] = useState<DataType | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async (selectedDateObj: Dayjs) => {
    const formattedDate = selectedDateObj.format("D-M-YYYY");
    try {
      const result = await window.electron.getOrdersByDate(formattedDate);
      setData(result);
      setStep("result");
    } catch (err) {
      console.error(err);
      setErrorMessage("حدث خطأ أثناء جلب البيانات");
    }
  };

  const handlePasswordSubmit = () => {
    if (password === "kemokamal1234") {
      const initialDate = dayjs().subtract(8, "hour");
      setDate(initialDate);
      fetchData(initialDate);
    } else {
      setErrorMessage("كلمة المرور غير صحيحة");
    }
  };

  const changeDate = (direction: "add" | "subtract") => {
    const newDate = date[direction](1, "day");
    setDate(newDate);
    fetchData(newDate);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white py-10 px-4 flex items-center justify-center">
      {step === "auth" && (
        <div className="bg-neutral-800 shadow-lg rounded-2xl p-6 w-full max-w-md space-y-4">
          <h2 className="text-2xl font-semibold text-center">
            أدخل كلمة المرور
          </h2>
          <Input
            type="password"
            placeholder="كلمة المرور"
            className="w-full border border-neutral-700 bg-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 rounded-md px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            onClick={handlePasswordSubmit}
            className="w-full bg-neutral-600 hover:bg-neutral-700 text-white"
          >
            دخول
          </Button>
          {errorMessage && (
            <div className="text-red-500 text-center mt-4">{errorMessage}</div>
          )}
        </div>
      )}

      {step === "result" && data && (
        <div className="w-full max-w-4xl space-y-6">
          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={() => changeDate("subtract")}
              className="bg-neutral-700 hover:bg-neutral-600"
            >
              اليوم السابق
            </Button>
            <h2 className="text-xl font-semibold">
              التاريخ الحالي: {date.format("D-M-YYYY")}
            </h2>
            <Button
              onClick={() => changeDate("add")}
              className="bg-neutral-700 hover:bg-neutral-600"
            >
              اليوم التالي
            </Button>
          </div>

          <h2 className="text-2xl font-bold text-center">
            إجمالي الكاش: {data.total_cash} جنيه
          </h2>

          <div className="space-y-4">
            {data.orders.map((order) => (
              <div
                key={order._id}
                className="bg-neutral-800 border border-neutral-700 rounded-xl shadow p-4 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">
                      رقم الطلب: {order.num}
                    </p>
                    <p className="text-sm">
                      {order.client === "null"
                        ? "اوردر فرع"
                        : "العميل: " + order.client + " ديلفري"}
                    </p>
                    <p className="text-sm">
                      {(() => {
                        const date = new Date(order.createAt);
                        const time = date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return `at: ${time}`;
                      })()}
                    </p>
                    <p className="text-sm">
                      السعر الكلي: {order.total_price} جنيه
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-neutral-500 hover:bg-neutral-700"
                    onClick={() => toggleExpand(order._id)}
                  >
                    {expandedOrderId === order._id
                      ? "إخفاء التفاصيل"
                      : "عرض التفاصيل"}
                  </Button>
                </div>

                {expandedOrderId === order._id && (
                  <div className="mt-3 space-y-3 border-t border-neutral-600 pt-3">
                    {order.order.map((item, index) => (
                      <div
                        key={index}
                        className="bg-neutral-700 p-3 rounded-md border border-neutral-600"
                      >
                        <p>
                          <strong>اسم الصنف:</strong> {item.itemName}
                        </p>
                        <p>
                          <strong>الحجم:</strong>{" "}
                          {item.size
                            .replace("xl", "تربل")
                            .replace("large", "دبل")
                            .replace("normal", "عادي")}
                        </p>
                        <p>
                          <strong>الكمية:</strong> {item.quantity}
                        </p>
                        <p>
                          <strong>السعر:</strong> {item.price}
                        </p>
                        {(item.freeAddons?.length ?? 0) > 0 && (
                          <p>
                            <strong>إضافات مجانية:</strong>{" "}
                            {(item.freeAddons ?? []).join(", ")}
                          </p>
                        )}

                        {(item.paidAddons?.length ?? 0) > 0 && (
                          <p>
                            <strong>إضافات مدفوعة:</strong>{" "}
                            {(item.paidAddons ?? [])
                              .map((add) => `${add.name} (${add.price})`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
