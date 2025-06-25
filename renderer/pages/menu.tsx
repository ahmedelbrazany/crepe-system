"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Save } from "lucide-react";

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

const MenuEditor: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const loadMenus = async () => {
    try {
      const result = await window.electron.fetchMenu();
      setCategories(result || []);
    } catch (err) {
      console.error("Error fetching menu:", err);
    }
  };

  const onSave = async () => {
    try {
      const result = await window.electron.saveMenu(
        JSON.parse(JSON.stringify(categories))
      );
      if (result?.success) setSaveStatus("✅ Menu saved to DB");
      else setSaveStatus("❌ Failed to save: " + result?.error);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("❌ Save error");
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      {
        id: Date.now(),
        name: "صنف جديد",
        items: [],
        sharedAddons: [],
      },
    ]);
  };

  const handleDeleteCategory = (catIndex: number) => {
    const newCategories = categories.filter((_, index) => index !== catIndex);
    setCategories(newCategories);
  };

  const handleAddItem = (catIndex: number) => {
    const newCategories = [...categories];
    newCategories[catIndex].items.push({
      id: Date.now(),
      name: "منتج جديد",
      baseIngredients: [],
      sizePrices: { normal: 0 },
    });
    setCategories(newCategories);
  };

  const handleDeleteItem = (catIndex: number, itemIndex: number) => {
    const newCategories = [...categories];
    newCategories[catIndex].items = newCategories[catIndex].items.filter(
      (_, index) => index !== itemIndex
    );
    setCategories(newCategories);
  };

  const handleAddAddon = (catIndex: number) => {
    const newCategories = [...categories];
    newCategories[catIndex].sharedAddons.push({ name: "", price: 0 });
    setCategories(newCategories);
  };

  const handleDeleteAddon = (catIndex: number, addonIndex: number) => {
    const newCategories = [...categories];
    newCategories[catIndex].sharedAddons = newCategories[
      catIndex
    ].sharedAddons.filter((_, index) => index !== addonIndex);
    setCategories(newCategories);
  };

  const updateItem = (
    catIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => {
    const newCats = [...categories];
    const item = newCats[catIndex].items[itemIndex];
    if (field === "baseIngredients") {
      item.baseIngredients = value.split(",").map((i: string) => i.trim());
    } else if (field.startsWith("size-")) {
      const size = field.split("-")[1] as keyof MenuItem["sizePrices"];
      item.sizePrices[size] = parseFloat(value) || 0;
    } else {
      (item as any)[field] = value;
    }
    setCategories(newCats);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold text-center">تعديل المنيو</h1>
      <div className="flex gap-4 justify-center">
        <Button onClick={handleAddCategory} className="bg-zinc-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> اضافة صنف
        </Button>
        <Button
          onClick={onSave}
          variant="outline"
          className="border-zinc-500 text-white"
        >
          <Save className="mr-2 h-4 w-4" /> حفظ المنيو
        </Button>
      </div>
      {saveStatus && (
        <div className="text-center text-green-400 text-sm font-medium">
          {saveStatus}
        </div>
      )}

      {categories.map((cat, catIndex) => (
        <Card
          key={cat.id}
          className="bg-zinc-800 border border-zinc-700 text-white"
        >
          <CardContent className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <Input
                value={cat.name}
                onChange={(e) => {
                  const newCats = [...categories];
                  newCats[catIndex].name = e.target.value;
                  setCategories(newCats);
                }}
                placeholder="اسم الصنف"
                className="bg-zinc-700 border-zinc-500"
              />
              <Button
                onClick={() => handleDeleteCategory(catIndex)}
                className="bg-red-600 text-white text-sm"
              >
                <Trash className="mr-2 h-4 w-4" /> حذف الصنف
              </Button>
            </div>
            <div className="space-y-4">
              {cat.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="p-3 border border-zinc-600 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        updateItem(catIndex, itemIndex, "name", e.target.value)
                      }
                      placeholder="اسم المنتج"
                      className="bg-zinc-700 border-zinc-500"
                    />
                    <Button
                      onClick={() => handleDeleteItem(catIndex, itemIndex)}
                      className="bg-red-600 text-white text-sm"
                    >
                      <Trash className="mr-2 h-4 w-4" /> حذف المنتج
                    </Button>
                  </div>
                  <Input
                    value={item.baseIngredients?.join(", ")}
                    onChange={(e) =>
                      updateItem(
                        catIndex,
                        itemIndex,
                        "baseIngredients",
                        e.target.value
                      )
                    }
                    placeholder="اسم الاضافات العادية (بانيه, بطاطس,)"
                    className="bg-zinc-700 border-zinc-500"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      value={item.sizePrices?.normal || ""}
                      onChange={(e) =>
                        updateItem(
                          catIndex,
                          itemIndex,
                          "size-normal",
                          e.target.value
                        )
                      }
                      placeholder="عادي"
                      className="bg-zinc-700 border-zinc-500"
                    />
                    <Input
                      type="number"
                      value={item.sizePrices?.large || ""}
                      onChange={(e) =>
                        updateItem(
                          catIndex,
                          itemIndex,
                          "size-large",
                          e.target.value
                        )
                      }
                      placeholder="دبل"
                      className="bg-zinc-700 border-zinc-500"
                    />
                    <Input
                      type="number"
                      value={item.sizePrices?.xl || ""}
                      onChange={(e) =>
                        updateItem(
                          catIndex,
                          itemIndex,
                          "size-xl",
                          e.target.value
                        )
                      }
                      placeholder="تربل"
                      className="bg-zinc-700 border-zinc-500"
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={() => handleAddItem(catIndex)}
                className="bg-zinc-700 text-white text-sm"
              >
                <Plus className="mr-2 h-4 w-4" /> اضافة منتج
              </Button>
            </div>
            <h3 className="text-lg font-semibold mt-4">الاضافات المدفوعة</h3>
            {cat.sharedAddons.map((addon, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={addon.name}
                  onChange={(e) => {
                    const newCats = [...categories];
                    newCats[catIndex].sharedAddons[index].name = e.target.value;
                    setCategories(newCats);
                  }}
                  placeholder="اسم الاضافة"
                  className="bg-zinc-700 border-zinc-500"
                />
                <Input
                  type="number"
                  value={addon.price}
                  onChange={(e) => {
                    const newCats = [...categories];
                    newCats[catIndex].sharedAddons[index].price =
                      parseFloat(e.target.value) || 0;
                    setCategories(newCats);
                  }}
                  placeholder="سعر الاضافة"
                  className="bg-zinc-700 border-zinc-500"
                />
                <Button
                  onClick={() => handleDeleteAddon(catIndex, index)}
                  className="bg-red-600 text-white text-sm"
                >
                  <Trash className="mr-2 h-4 w-4" /> حذف الاضافة
                </Button>
              </div>
            ))}
            <Button
              onClick={() => handleAddAddon(catIndex)}
              className="bg-zinc-700 text-white text-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> اضافة مدفوعة
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MenuEditor;
