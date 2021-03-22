declare var io: any;

export const socket_connect = (room: any) => {
  return io("https://live-canvas-server.azurewebsites.net/", {
    query: "r_var=" + room,
  });
};
