import mongoose, { Schema, Model, Connection, Document } from "mongoose";

interface IClient extends Document {
  _id: string;
  number: string;
  name: string;
  address: string;
}
const clientsSchema = new Schema<IClient>({
  _id: { type: String, required: true },
  number: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
});

export default (connection: Connection): Model<IClient> =>
  connection.model<IClient>("Clients", clientsSchema, "clients");
