export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://chat-app-01-backend-olab.onrender.com";

export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || BACKEND_URL;

if (process.env.NODE_ENV !== "production") {
  console.log("🔧 Config Loaded:");
  console.log("BACKEND_URL =>", BACKEND_URL);
  console.log("SOCKET_URL  =>", SOCKET_URL);
}
