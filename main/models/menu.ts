import mongoose, { Schema, Model, Connection, Document } from "mongoose";

interface IIngredient {
  name: string;
  price: number;
}

interface IMenuItem {
  name: string;
  baseIngredients: string[];
  sizePrices: {
    normal: number;
    large: number;
    xl: number;
  };
}

interface ICategory extends Document {
  name: string;
  items: IMenuItem[];
  sharedAddons: IIngredient[];
}

const ingredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
});

const menuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true },
  baseIngredients: { type: [String], default: [] },
  sizePrices: {
    normal: { type: Number, default: 0 },
    large: { type: Number, default: 0 },
    xl: { type: Number, default: 0 },
  },
});

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    items: { type: [menuItemSchema], default: [] },
    sharedAddons: { type: [ingredientSchema], default: [] },
  },
  { timestamps: true }
);

export default (connection: Connection): Model<ICategory> =>
  connection.model<ICategory>("Menu", categorySchema, "menu");
