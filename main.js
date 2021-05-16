// Other Modules
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// Our Classes
const mysql_class = require('./class/mysql.class.js');
const messaging_class = require('./class/messaging.class.js');

app.get('/', (req, res) => {
  let date = new Date(Date.now());
  date.toISOString();
  console.log(date)
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
    messaging_class.SendMessage(data)
    .then((result) => {
      // IO SENDS TO ALL USERS
      io.emit('Message-Received', result);
    }).catch((err) => {
      console.log(err)
    })
  })

  socket.on('Message-FetchInit', (data) => {
    messaging_class.GetMessages(data)
    .then((result) => {
      socket.emit('Message-FetchInit_Reply', result);
    }).catch((err) => {
      console.log(err)
    })
  })

});

server.listen(3000, () => {
  console.log('listening on 3000');
});
