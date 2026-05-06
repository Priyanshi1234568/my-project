import { io } from "socket.io-client";

const socket = io("https://my-project-backend-5w3s.onrender.com", {
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;