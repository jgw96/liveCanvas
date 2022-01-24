// @ts-ignore
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export const socket_connect = (room: any) => {
  return io("https://live-canvas-server.azurewebsites.net/", {
    query: {
      r_var: room,
    }
  });
};
