// Other Modules
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// Our Classes
const sqlite_class = require('./class/sqlite.class.js');
const messaging_class = require('./class/messaging.class.js');

// Connection.
sqlite_class.ConnectAsync();

app.get('/', (req, res) => {
  res.send("Hiya hun");
})


// Emit = Send to Server/client
// On = Deal with incoming message.

io.on('connection', (socket) => {
  console.log('a user connected');


  socket.on('disconnect', (data) => {
    console.log("user has disconnected.")
    socket.disconnect();
  })

  socket.on('Message-Send', (data) => {
    console.log(data);
  })
});

server.listen(3000, () => {
  console.log('listening on 3000');
});
