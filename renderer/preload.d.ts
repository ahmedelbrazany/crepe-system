import { IpcRenderer } from "electron";

declare global {
  interface Window {
    electron: {
      minimizeApp: () => void;
      maximizeApp: () => void;
      closeApp: () => void;
      getAllClients: () => Promise<any>;
      getClient: (id: string) => Promise<any>;
      addClient: (
        number: string,
        name: string,
        address: string,
        alt: string
      ) => Promise<any>;
      fetchMenu: () => Promise<any>;
      saveMenu: (data: any) => Promise<any>;
      sendOrder: (order: any) => Promise<any>;
      getOrdersByDate: (date: string) => Promise<any>;
      fetchData: () => Promise<any>;
      updateClient: (
        id: string,
        data: { name: string; address: string; number: string }
      ) => Promise<any>;
      deleteClient: (id: string) => Promise<any>;
    };
  }
}
