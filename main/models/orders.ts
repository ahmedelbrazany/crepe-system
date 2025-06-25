import mongoose, { Schema, Model, Connection, Document } from "mongoose";

interface IOrder extends Document {
  _id: string; // ID Child
  total_price: number;
  createAt: number;
  date: string;
  num: number;
  order: any[];
  client: string;
  deliveryTax: number;
}

const ordersSchema = new Schema<IOrder>({
  _id: { type: String, required: true },
  total_price: { type: Number, required: true },
  createAt: { type: Number, required: true },
  date: { type: String, required: true },
  num: { type: Number, required: true },
  order: [{ type: Schema.Types.Mixed, required: true }],
  client: { type: String, required: true },
  deliveryTax: { type: Number, required: true },
});

export default (connection: Connection): Model<IOrder> =>
  connection.model<IOrder>("Orders", ordersSchema, "orders");
