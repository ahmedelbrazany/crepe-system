// PrinterManager.js
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const { loadImage, createCanvas } = require("canvas");
const fs = require("fs");
const EventEmitter = require("events");
const { PNG } = require("pngjs");
const os = require("os");
const path = require("path");

class PrinterManager extends EventEmitter {
  constructor() {
    super();
    this.printers = new Map();
  }
  logoLoad(filename) {
    return new Promise((resolve, reject) => {
      escpos.Image.load(filename, (image) => {
        resolve(image);
      });
    });
  }
  async textToStyledImage(orderData, kit) {
    return new Promise((resolve, reject) => {
      const {
        _id,
        total_price,
        client,
        deliveryTax,
        order,
        num,
        name,
        address,
        number,
        estimatedTime,
        notes,
        displayNumber,
      } = orderData;
      console.log({
        _id,
        total_price,
        client,
        deliveryTax,
        order,
        num,
        name,
        address,
        number,
        estimatedTime,
        notes,
        displayNumber,
      });
      const sizeLabels = {
        normal: "عادي",
        large: "دبل",
        xl: "تربل",
      };

      const canvasWidth = 550;
      const lineHeight = 50;
      const headerHeight = 150;
      const footerHeight = 350;
      const rowSpacing = 30;

      let itemRows = order.length;
      let addonLines = 0;

      order.forEach((item) => {
        if (item.freeAddons?.length > 0) addonLines++;
        if (item.paidAddons?.length > 0) addonLines++;
      });
      let extra = 20;
      if (notes) extra + 30;
      if (deliveryTax) extra += 23;
      if (client !== "null" || displayNumber) extra += 23;
      if (number && number !== "0") extra += 23;
      if (deliveryTax && deliveryTax > 0) extra += 23;
      console.log(extra);
      const canvasHeight =
        headerHeight +
        itemRows * lineHeight +
        addonLines * lineHeight +
        extra +
        40 +
        footerHeight;

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "black";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";

      ctx.fillText("🍽 مطعم كيمو كريب 🍽", canvasWidth / 2, 50);
      ctx.font = "28px Arial";
      ctx.fillText(
        `رقم الطلب: ${num.toString().padStart(3, "0")}`,
        canvasWidth / 2,
        90
      );

      const date = new Date(Date.now());
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      ctx.font = "bold 40px Arial";
      ctx.fillText(time, canvasWidth / 2, 124);

      ctx.font = "bold 26px Arial";
      ctx.fillText(
        `الوقت المتوقع للاوردر ${estimatedTime} - ${estimatedTime + 5} دقيقة`,
        canvasWidth / 2,
        150
      );
      ctx.fillText("_____________________________", canvasWidth / 2, 170);

      const tableStartY = headerHeight + 55;
      ctx.font = "bold 26px Arial";
      ctx.textAlign = "right";
      ctx.fillText("المنتج", canvasWidth - 20, tableStartY);
      ctx.fillText("الكمية", canvasWidth / 2 + 20, tableStartY);
      ctx.fillText("السعر", 100, tableStartY);

      ctx.font = "24px Arial";
      let currentY = tableStartY + rowSpacing;

      order.forEach((item) => {
        const totalItem = item.price * item.quantity;
        const sizeText = sizeLabels[item.size] || "عادي";

        ctx.fillText(
          `${item.itemName} - ${sizeText}`,
          canvasWidth - 20,
          currentY
        );
        ctx.fillText(`${item.quantity}`, canvasWidth / 2 + 20, currentY);
        ctx.fillText(`${totalItem}ج`, 100, currentY);
        currentY += rowSpacing;

        if (item.freeAddons?.length > 0) {
          ctx.fillStyle = "#007700";
          ctx.fillText(
            `🟢 ${item.freeAddons.join("، ")}`,
            canvasWidth - 20,
            currentY
          );
          ctx.fillStyle = "black";
          currentY += rowSpacing;
        }

        if (item.paidAddons?.length > 0) {
          const paidList = item.paidAddons
            .map((a) => `${a.name} (${a.price}ج)`)
            .join("، ");
          ctx.fillStyle = "#aa0000";
          ctx.fillText(`💰 ${paidList}`, canvasWidth - 20, currentY);
          ctx.fillStyle = "black";
          currentY += rowSpacing;
        }
      });

      currentY += 10;
      ctx.font = "bold 26px Arial";
      ctx.textAlign = "center";
      ctx.fillText("_____________________________", canvasWidth / 2, currentY);
      currentY += rowSpacing + 8;

      ctx.textAlign = "right";
      ctx.font = "24px Arial";
      if (name) {
        ctx.fillText(`👤 الاسم: ${name}`, canvasWidth - 20, currentY);
        currentY += rowSpacing;
      }
      if (address) {
        ctx.fillText(`📍 العنوان: ${address}`, canvasWidth - 20, currentY);
        currentY += rowSpacing;
      }
      if (client !== "null" || displayNumber) {
        ctx.fillText(
          `📞 الهاتف الأساسي: ${client !== "null" ? client : displayNumber}`,
          canvasWidth - 20,
          currentY
        );
        currentY += rowSpacing;
      }
      if (number && number !== "0") {
        ctx.fillText(`📱 الهاتف البديل: ${number}`, canvasWidth - 20, currentY);
        currentY += rowSpacing;
      }

      if (deliveryTax && deliveryTax > 0) {
        ctx.fillText(`🚚 التوصيل: ${deliveryTax}ج`, canvasWidth - 20, currentY);
        currentY += rowSpacing;
      }

      ctx.fillText(`🧾 رقم الطلب: ${_id}`, canvasWidth - 20, currentY);
      currentY += rowSpacing;
      ctx.fillText(`💵 الإجمالي: ${total_price}ج`, canvasWidth - 20, currentY);
      currentY += rowSpacing;

      if (deliveryTax && Number(deliveryTax) > 0) {
        const totalWithDelivery = Number(total_price) + Number(deliveryTax);
        ctx.fillText(
          `💰 الإجمالي مع التوصيل: ${totalWithDelivery}ج`,
          canvasWidth - 20,
          currentY
        );
        currentY += rowSpacing;
      }

      ctx.font = "bold 26px Arial";
      ctx.textAlign = "center";
      ctx.fillText("_____________________________", canvasWidth / 2, currentY);

      if (notes) {
        currentY += rowSpacing + 10;
        ctx.fillText(`📋 ملاحظات: ${notes}`, canvasWidth / 2, currentY);
      }
      currentY += rowSpacing + 8;
      ctx.fillText("شكراً لزيارتكم ❤️", canvasWidth / 2, currentY);
      currentY += rowSpacing + 16;
      ctx.font = "bold 50px Arial";
      ctx.fillText(
        kit === "kit" ? num + " 🍴" : num + " 👤",
        canvasWidth / 2,
        currentY
      );
      console.log(name);
      console.log(displayNumber);
      const buffer = canvas.toBuffer("image/png");
      const tempPath = path.join(os.tmpdir(), `receipt_${Date.now()}.png`);
      fs.writeFileSync(tempPath, buffer);

      escpos.Image.load(tempPath, (image) => {
        fs.unlink(tempPath, () => {});
        if (!image) return reject("❌ Failed to load image");
        resolve(image);
      });
    });
  }
  addPrinter(name, device) {
    const options = { encoding: "GB18030" };
    const printer = new escpos.Printer(device, options);

    device.open((err) => {
      if (err) {
        this.emit(
          "error",
          `❌ Failed to open printer "${name}": ${err.message}`
        );
        return;
      }
      this.printers.set(name, { device, printer, isReady: true });
      this.emit("success", `✅ Printer "${name}" is ready.`);
    });
  }

  async autoDetectPrinters() {
    try {
      const devices = escpos.USB.findPrinter
        ? escpos.USB.findPrinter()
        : escpos.USB.getDeviceList?.();
      if (!devices || !devices.length) {
        this.emit("error", "❌ No USB printers found.");
        return;
      }

      devices.forEach((device, index) => {
        const name = `USB_${index + 1}`;
        this.addPrinter(
          name,
          new escpos.USB(device.vendorId, device.productId)
        );
      });
    } catch (err) {
      this.emit("error", `❌ Error detecting printers: ${err.message}`);
    }
  }

  async print(printerName, contentCallback) {
    const printerData = this.printers.get(printerName);
    if (!printerData || !printerData.isReady) {
      this.emit("error", `❌ Printer "${printerName}" is not ready.`);
      return;
    }

    const { device, printer } = printerData;

    try {
      // التأكد من وجود الصورة
      const imagePath = path.join(__dirname, "images", "logo-small.png");
      if (!fs.existsSync(imagePath)) {
        this.emit("error", `❌ Image not found at: ${imagePath}`);
        return;
      }

      // فتح الجهاز
      device.open(async (error) => {
        if (error) {
          this.emit("error", `❌ Error opening device: ${error.message}`);
          return;
        }

        try {
          console.log("✅ Image path:", imagePath);

          // تحميل الصورة بطريقة متوافقة مع escpos
          escpos.Image.load(imagePath, async (image) => {
            if (!image) {
              this.emit("error", `❌ Failed to load image: ${imagePath}`);
              return;
            }

            // طباعة الصورة والمحتوى
            await printer.align("ct").image(image, "d24");
            await contentCallback(printer, printerName);
            await printer.cut();
            printer.close();

            this.emit("success", `✅ Printed on "${printerName}"`);
          });
        } catch (err) {
          this.emit(
            "error",
            `❌ Print error on "${printerName}": ${err.message}`
          );
        }
      });
    } catch (err) {
      this.emit(
        "error",
        `❌ General error on "${printerName}": ${err.message}`
      );
    }
  }

  async printAll(contentCallback) {
    if (this.printers.size === 0) {
      this.emit("error", "❌ No printers available to print.");
      return;
    }

    for (const [printerName] of this.printers) {
      await this.print(printerName, contentCallback);
    }
  }

  closeAllPrinters() {
    for (const [name, { printer, device }] of this.printers) {
      try {
        printer.close?.();
        device.close?.();
        this.emit("success", `🛑 Closed printer "${name}"`);
      } catch (err) {
        this.emit("error", `⚠️ Error closing "${name}": ${err.message}`);
      }
    }
  }
}

export default PrinterManager;
