const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Array to store online user IDs
const onlineUsers = [];

// Handle socket connections
io.on("connection", (socket) => {
  socket.on("new-user", (user) => {
    // Assign the user ID to the socket
    socket.userID = user;
    onlineUsers.push(user);
    io.emit("online-users", onlineUsers);
  });

  socket.on("user-message", (data) => {
    io.emit("message", { userID: data.userID, message: data.message });
  });

  socket.on("typing", () => {
    // Broadcast the "user-typing" event to all clients
    socket.broadcast.emit("user-typing", socket.userID);
  });

  socket.on("stop-typing", () => {
    socket.broadcast.emit("user-stopped-typing");
  });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    // Find the index of the disconnected user in the onlineUsers array
    const index = onlineUsers.indexOf(socket.userID);
    if (index !== -1) {
      // Remove the user from the onlineUsers array
      onlineUsers.splice(index, 1);
      // Broadcast the updated list of online users to all clients
      io.emit("online-users", onlineUsers);
    }
  });
});

// Serve static files from the public folder
app.use(express.static(path.resolve("./public")));

// Serve the main HTML file
app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "/public/index.html"));
});

server.listen(9000, () => console.log(`Server Started at PORT:9000`));
