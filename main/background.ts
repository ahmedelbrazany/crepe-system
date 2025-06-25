import path from "path";
import fs from "fs";
import { app, ipcMain, BrowserWindow, dialog, globalShortcut } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import Database from "./database";

const isProd = process.env.NODE_ENV === "production";
const appDataPath = path.join(app.getPath("appData"), app.getName());
const configPath = path.join(appDataPath, "config.json");
console.log(configPath);
function ensureConfig() {
  try {
    // التحقق من وجود مجلد appData الخاص بالتطبيق، وإنشاؤه إذا لم يكن موجودًا
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }

    // إنشاء الملف إذا لم يكن موجودًا
    if (!fs.existsSync(configPath)) {
      const defaultConfig = { db_uri: "mongodb://localhost:27017" };
      fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        "utf8"
      );
      console.log(`📁 تم إنشاء ملف config.json في: ${configPath}`);
    }

    // قراءة الملف وإرجاع محتواه
    const rawData = fs.readFileSync(configPath, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    console.error("❌ خطأ في قراءة أو إنشاء config.json:", err);
    dialog.showErrorBox(
      "خطأ في إعدادات التطبيق",
      `تعذر تحميل إعدادات الاتصال بقاعدة البيانات.\n\n${err.message}`
    );
    return { db_uri: "mongodb://localhost:27017" };
  }
}

const config = ensureConfig();
const database = new Database(config.db_uri);

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let mainWindow = null;

(async () => {
  await app.whenReady();

  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
  globalShortcut.register("F11", () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });
})();

app.on("window-all-closed", () => {
  app.quit();
  globalShortcut.unregisterAll();
});

ipcMain.on("minimize-app", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("maximize-app", () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});

ipcMain.on("close-app", () => {
  if (mainWindow) mainWindow.close();
  globalShortcut.unregisterAll();
});

ipcMain.handle("get-client", async (_, id) => {
  try {
    let client = await database.fetchClient(id);
    client = JSON.parse(JSON.stringify(client));
    return client ? { ...client, _id: client._id?.toString() } : null;
  } catch (error) {
    console.error("❌ get-client error:", error.message);
    return null;
  }
});

ipcMain.handle("add-client", async (_, number, name, address, alt) => {
  try {
    let result = await database.addClient(number, name, address, alt);
    result = JSON.parse(JSON.stringify(result));
    return { ...result, _id: result._id?.toString() };
  } catch (error) {
    console.error("❌ add-client error:", error.message);
    return { success: false, error: error.message };
  }
});
ipcMain.handle("fetch-data", async () => {
  const data = await database.fetchData();
  return data;
});
ipcMain.handle("fetch-menu", async () => {
  try {
    return await database.fetchMenu();
  } catch (error) {
    console.error("❌ fetch-menu error:", error.message);
    return null;
  }
});

ipcMain.handle("save-menu", async (_, data) => {
  try {
    return await database.saveMenu(data);
  } catch (error) {
    console.error("❌ save-menu error:", error.message);
    return { success: false, error: error.message };
  }
});
ipcMain.handle("update-client", async (_, id, data) => {
  try {
    return await database.updateClient(id, data);
  } catch (err) {
    throw err;
  }
});
ipcMain.handle("delete-client", async (_, id) => {
  try {
    return await database.deleteClient(id);
  } catch (err) {
    throw err;
  }
});
ipcMain.handle("send-order", async (_, order) => {
  try {
    const total_price = order.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    console.log(order.defaultNumber);
    console.log(order);
    const result = await database.saveOrder({
      total_price,
      client: order.defaultNumber,
      deliveryTax: order.deliveryTax,
      order: order.orderItems,
      estimatedTime: order.estimatedTime,
      displayNumber: order.displayNumber,
      displayName: order.displayName,
      notes: order.notes,
    });
    if (!result) return { success: false };
    return { success: true };
  } catch (error) {
    console.error("❌ send-order error:", error.message);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-orders-by-date", async (_, date) => {
  try {
    let orders = await database.getOrdersByDate(date);
    orders = JSON.parse(JSON.stringify(orders)); // <== إزالة الدوال غير القابلة للتسلسل

    const total_cash = orders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0
    );

    return { success: true, total_cash, orders };
  } catch (error) {
    console.error("❌ get-orders-by-date error:", error.message);
    return { success: false, error: error.message };
  }
});
