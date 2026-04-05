const RoomManager = require("./lib/RoomManager");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const os = require("os");
const QRCode = require("qrcode");

const PORT = process.env.PORT || 8080;

app.use(express.static("www"));
app.get("/", function (req, res) {
  const queryString = req.url.includes("?")
    ? req.url.substring(req.url.indexOf("?"))
    : "";
  res.redirect("/player/index.html" + queryString);
});
app.get("/spectate", function (req, res) {
  res.redirect("/monitor/index.html");
});

// Helper function to get local network IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// API endpoint to get the join URL
app.get("/api/join-url", function (req, res) {
  const host =
    req.hostname === "localhost" || req.hostname === "127.0.0.1"
      ? getLocalIP()
      : req.hostname;
  const roomCode = req.query.room;
  let url = `http://${host}:${PORT}`;
  if (roomCode && /^[A-Z]{4}$/.test(roomCode)) {
    url += `?room=${roomCode}`;
  }
  res.json({ url: url });
});

// API endpoint to get a QR code for the join URL
app.get("/api/join-qr", async function (req, res) {
  try {
    const host =
      req.hostname === "localhost" || req.hostname === "127.0.0.1"
        ? getLocalIP()
        : req.hostname;
    const roomCode = req.query.room;
    let url = `http://${host}:${PORT}`;
    if (roomCode && /^[A-Z]{4}$/.test(roomCode)) {
      url += `?room=${roomCode}`;
    }
    const qrCode = await QRCode.toDataURL(url);
    res.json({ qrCode: qrCode });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

RoomManager.init(io);
server.listen(PORT);
console.log(`Monitor: http://localhost:${PORT}/monitor`);
