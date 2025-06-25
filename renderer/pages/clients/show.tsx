"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Pencil, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type ClientType = {
  _id: string;
  name: string;
  address: string;
  number: string;
};

const Page = () => {
  const router = useRouter();

  const [number, setNumber] = useState<string>("");
  const [client, setClient] = useState<ClientType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const handleGoToOrder = () => {
    if (!client) return;
    router.push(`/orders?number=${client._id}&adress=${client.address}`);
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const num = params.get("number") || "";
      setNumber(num);
    }
  }, []);

  useEffect(() => {
    if (number) {
      fetchClient(number);
    }
  }, [number]);

  const fetchClient = async (phone: string) => {
    try {
      const result = await window.electron.getClient(phone);
      if (result) {
        setClient(result);
        setErrorMessage("");
      } else {
        setClient(null);
        setErrorMessage("❌ لم يتم العثور على العميل!");
      }
    } catch (error) {
      console.error("❌ خطأ أثناء البحث عن العميل:", error);
      setErrorMessage("❌ حدث خطأ أثناء البحث!");
      setClient(null);
    }
  };

  const editClient = async () => {
    if (!client) return;
    try {
      await window.electron.updateClient(client._id, {
        name: client.name,
        address: client.address,
        number: client.number,
      });
      setStatusMessage("✅ تم تحديث بيانات العميل بنجاح!");
      setEditMode({});
    } catch (error) {
      console.error("❌ خطأ أثناء تعديل بيانات العميل:", error);
      setStatusMessage("❌ حدث خطأ أثناء تعديل البيانات!");
    }
  };

  const deleteClient = async () => {
    if (!client) return;
    try {
      await window.electron.deleteClient(client._id);
      setStatusMessage("✅ تم حذف العميل بنجاح!");
      setClient(null);
      setConfirmDelete(false);
    } catch (error) {
      console.error("❌ خطأ أثناء حذف العميل:", error);
      setStatusMessage("❌ حدث خطأ أثناء الحذف!");
    }
  };

  const toggleEdit = (field: keyof ClientType) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
    document.getElementById(`in${field}`)?.focus();
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(["enter"]);
      console.log(event.key);
      if (event.key === "Enter") {
        console.log(event.key === "Enter");
        handleGoToOrder();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">المعلومات عن {number}</h1>
      {statusMessage && (
        <p className="text-green-500 text-sm">{statusMessage}</p>
      )}
      {client ? (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">📋 بيانات العميل:</h2>
          <p>📞 رقم الهاتف: {client._id}</p>
          {(["number", "name", "address"] as (keyof ClientType)[]).map(
            (field) => (
              <p key={field} className="flex items-center space-x-2">
                {field === "number"
                  ? "📞 رقم الهاتف الثاني: "
                  : field === "name"
                    ? "👤 الاسم: "
                    : "📍 العنوان: "}
                {editMode[field] ? (
                  <Input
                    type="text"
                    id={`in${field}`}
                    value={client[field]}
                    onChange={(e) =>
                      setClient({ ...client, [field]: e.target.value })
                    }
                  />
                ) : (
                  <span>{client[field]}</span>
                )}
                <button
                  onClick={() => toggleEdit(field)}
                  className="text-blue-500"
                >
                  <Pencil size={16} />
                </button>
              </p>
            )
          )}
          {Object.values(editMode).some((isEditing) => isEditing) && (
            <button className="custom-button bg-green-500" onClick={editClient}>
              <Save size={16} className="inline-block" /> حفظ البيانات
            </button>
          )}
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-red-500">
                ⚠️ هل أنت متأكد أنك تريد حذف هذا العميل؟
              </p>
              <div className="flex space-x-2">
                <button
                  className="custom-button bg-gray-500"
                  onClick={() => setConfirmDelete(false)}
                >
                  إلغاء
                </button>
                <button
                  className="custom-button bg-red-500"
                  onClick={deleteClient}
                >
                  تأكيد الحذف
                </button>
              </div>
            </div>
          ) : (
            <button
              className="custom-button bg-red-500"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} className="inline-block" /> حذف العميل
            </button>
          )}
          <Link href={`/orders?number=${client._id}`}>
            <button className="custom-button">اضافة طلب جديد</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-red-500 text-sm">{errorMessage}</p>
          <Link href={`/clients/new?number=${number}`}>
            <button className="custom-button">اضغط هنا لإضافة العميل</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Page;
