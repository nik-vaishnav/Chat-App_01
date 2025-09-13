const BACKEND_URL =
  import.meta.env?.VITE_BACKEND_URL ||   // for Vite
  process.env.REACT_APP_BACKEND_URL ||   // for CRA
  "https://chat-app-01-backend-olab.onrender.com";

const SOCKET_URL =
  import.meta.env?.VITE_SOCKET_URL ||
  process.env.REACT_APP_SOCKET_URL ||
  BACKEND_URL;

export { BACKEND_URL, SOCKET_URL };
