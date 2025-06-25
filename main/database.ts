import { EventEmitter } from "events";
import mongoose, { Connection, Document, Model } from "mongoose";
import PrinterManager from "./printer.mjs";
import createClientModel from "./models/clients";
import createMenuModel from "./models/menu";
import createOrdersModel from "./models/orders";

mongoose.Promise = global.Promise;
const printerManager = new PrinterManager();

printerManager.on("success", console.log);
printerManager.on("error", console.error);

(async () => {
  await printerManager.autoDetectPrinters();
})();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface ClientDocument extends Document {
  _id: string;
  number: string;
  name: string;
  address: string;
}

interface OrderDocument extends Document {
  _id: string;
  total_price: number;
  client: string;
  deliveryTax: number;
  order: any;
  createAt: number;
  date: string;
  num: number;
  name?: string;
  address?: string;
  number?: string;
  estimatedTime?: number;
  displayNumber?: string | null;
  displayName?: string | null;
  notes?: string | null;
}

interface OrderData {
  total_price: number;
  client: string;
  deliveryTax: number;
  order: any;
  estimatedTime: number;
  displayNumber: string | null;
  displayName: string | null;
  notes: string | null;
}

export default class DatabaseManager extends EventEmitter {
  private connection: Connection;
  private clients: Model<ClientDocument>;
  private menu: Model<any>;
  private settings: Model<any>;
  private orders: Model<OrderDocument>;
  private slotsCache: Record<string, any> = {};
  private ready: boolean = false;

  constructor(
    private connection_uri: string,
    options: mongoose.ConnectOptions = {}
  ) {
    super();

    const connectionOptions: mongoose.ConnectOptions = {
      autoIndex: false,
      maxPoolSize: 5,
      connectTimeoutMS: 1000000,
      family: 4,
      ...options,
    };

    this.connection = mongoose.createConnection(
      this.connection_uri,
      connectionOptions
    );

    this.clients = createClientModel(this.connection);
    this.menu = createMenuModel(this.connection);
    this.orders = createOrdersModel(this.connection);
    this.ready = false;
    this._listenToEvents();
  }

  private _listenToEvents(): void {
    this.connection.on("connected", () => {
      this.ready = true;
      console.log("✅ Mongoose Connected");
    });
    this.connection.on("error", (err) => {
      console.error("❌ Mongoose Error:", err);
      this.ready = false;
    });
    this.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose Disconnected");
      this.ready = false;
    });
  }
  async fetchData() {
    const printers = printerManager.printers.size;
    const status = this.ready ? "connected" : "disconnected";
    return { printers, status };
  }
  async fetchClientAltNumber(number: string): Promise<ClientDocument | null> {
    return this.clients.findOne({ number }).exec();
  }
  async getTopOrderNum(): Promise<number | null> {
    try {
      const topOrder = await this.orders
        .findOne({ date: this.getTodayDateFormatted() })
        .sort({ num: -1 })
        .exec();
      return topOrder ? topOrder.num : null;
    } catch (err) {
      console.error("❌ Error fetching top order num:", err);
      throw err;
    }
  }
  async fetchClientMainNumber(id: string): Promise<ClientDocument | null> {
    return this.clients.findById(id).exec();
  }

  getTodayDateFormatted(): string {
    const date = new Date();
    date.setHours(date.getHours() - 8);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  async getOrdersByDate(date: string): Promise<OrderDocument[]> {
    return this.orders.find({ date }).exec();
  }

  async fetchClient(number: string): Promise<ClientDocument | null> {
    let user: ClientDocument | null = null;
    if (number === "0") {
      user = await this.fetchClientMainNumber(number);
      return user;
    }
    return (
      (await this.fetchClientMainNumber(number)) ||
      (await this.fetchClientAltNumber(number))
    );
  }

  async addClient(
    number: string,
    name: string,
    address: string,
    alt: string = "لا يوجد"
  ): Promise<ClientDocument> {
    const newClient = new this.clients({
      _id: number,
      number: alt,
      name,
      address,
    });
    await newClient.save();
    return newClient;
  }

  async fetchMenu(): Promise<any[]> {
    try {
      return (await this.menu.find({}).exec()).map((doc) => doc.toObject());
    } catch (err) {
      console.error("❌ Error fetching menu:", err);
      throw err;
    }
  }
  async saveMenu(
    newData: any[]
  ): Promise<{ success: boolean; insertedCount?: number; error?: string }> {
    try {
      if (!Array.isArray(newData)) throw new Error("Invalid menu data");

      const sanitizedData = newData.map((cat) => ({
        name: cat.name,
        items: cat.items.map((item: any) => ({
          name: item.name,
          baseIngredients: item.baseIngredients,
          sizePrices: item.sizePrices,
        })),
        sharedAddons: cat.sharedAddons.map((addon: any) => ({
          name: addon.name,
          price: addon.price,
        })),
      }));

      const TempModel = this.connection.model(
        "MenuTemp",
        this.menu.schema,
        "menu_temp"
      );

      await TempModel.deleteMany({});
      const inserted = await TempModel.insertMany(sanitizedData);

      await this.menu.deleteMany({});
      const finalData = inserted.map((doc) => {
        const obj = doc.toObject();
        delete obj._id;
        return obj;
      });

      await this.menu.insertMany(finalData);

      return { success: true, insertedCount: inserted.length };
    } catch (err) {
      console.error("❌ Error saving menu safely:", err);
      return { success: false, error: err.message };
    }
  }
  async updateClient(
    id: string,
    data: { number: string; name: string; address: string }
  ): Promise<{
    success: boolean;
    message: string;
    updatedClient?: ClientDocument;
  }> {
    try {
      const updatedClient = await this.clients
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
      if (!updatedClient) {
        return { success: false, message: "Client not found" };
      }

      return {
        success: true,
        message: "Client updated successfully",
        updatedClient,
      };
    } catch (err) {
      console.error("❌ Error updating client:", err);
      throw err;
    }
  }
  async deleteClient(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deletedClient = await this.clients.findByIdAndDelete(id).exec();
      if (!deletedClient) {
        return { success: false, message: "Client not found" };
      }
      return { success: true, message: "Client deleted successfully" };
    } catch (err) {
      console.error("❌ Error deleting client:", err);
      throw err;
    }
  }
  async saveOrder(order: OrderData): Promise<OrderDocument> {
    try {
      let num = (await this.getTopOrderNum()) || 0;
      num += 1;
      const uniqueId = `${this.getTodayDateFormatted()}@${num}`;
      console.log(order);
      const saved: Partial<OrderDocument> = {
        _id: uniqueId,
        total_price: order.total_price,
        client: order.client || "null",
        deliveryTax: order.deliveryTax || 0,
        order: order.order,
        createAt: Date.now(),
        date: this.getTodayDateFormatted(),
        num,
        estimatedTime: order.estimatedTime,
        notes: order.notes,
      };
      const client = await this.fetchClient(saved.client);
      console.log(client);
      if (client) {
        saved.client = client._id;
        saved.name = client.name;
        saved.address = client.address;
        saved.number = client.number;
      } else {
        saved.client = "null";
      }
      if (saved.client === "null") {
        if (order.displayNumber) saved.displayNumber = order.displayNumber;
        if (order.displayName) saved.name = order.displayName;
      }

      console.log(saved);
      printerManager.printAll(async (printer, printerName) => {
        printer.align("ct");
        const img = await printerManager.textToStyledImage(saved, "kit");
        await printer.image(img, "d24");
      });
      await sleep(3000);
      printerManager.printAll(async (printer, printerName) => {
        printer.align("ct");
        const img = await printerManager.textToStyledImage(saved, "cl");
        await printer.image(img, "d24");
      });
      const newOrder = new this.orders(saved);
      await newOrder.save();
      return newOrder;
    } catch (err) {
      console.error("❌ Error saving order:", err);
      throw err;
    }
  }
}
