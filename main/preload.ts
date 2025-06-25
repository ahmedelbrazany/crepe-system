import { contextBridge, ipcRenderer, IpcRendererEvent, shell } from "electron";

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  closeApp: () => ipcRenderer.send("close-app"),
  minimizeApp: () => ipcRenderer.send("minimize-app"),
  maximizeApp: () => ipcRenderer.send("maximize-app"),
  getAllClients: () => ipcRenderer.invoke("get-all-clients"),
  getClient: (id: string) => ipcRenderer.invoke("get-client", id),
  addClient: (number: string, name: string, address: string, alt: string) =>
    ipcRenderer.invoke("add-client", number, name, address, alt),
  fetchMenu: () => ipcRenderer.invoke("fetch-menu"),
  saveMenu: (data: any) => ipcRenderer.invoke("save-menu", data),
  sendOrder: (order: any) => ipcRenderer.invoke("send-order", order),
  getOrdersByDate: (date: string) =>
    ipcRenderer.invoke("get-orders-by-date", date),
  fetchData: () => ipcRenderer.invoke("fetch-data"),
  updateClient: (
    id: string,
    data: { name: string; address: string; number: string }
  ) => ipcRenderer.invoke("update-client", id, data),
  deleteClient: (id: string) => ipcRenderer.invoke("delete-client", id),
};

contextBridge.exposeInMainWorld("electron", {
  ...handler,
  shell, // Expose the shell API
});

export type IpcHandler = typeof handler;
