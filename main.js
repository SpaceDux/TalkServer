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
const user_class = require('./class/user.class.js');


app.get('/', (req, res) => {
  let date = new Date(Date.now());
  date.toISOString();
  res.send(date);
})


// Emit = Send to Server/client
// On = Deal with incoming message.

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', (data) => {
    console.log("user has disconnected.")
    socket.disconnect();
  })

  // Messages
  socket.on('Message-Send', (data) => {
    user_class.CheckToken(data.Token, socket.handshake.headers["x-real-ip"])
    .then((user) => {
      messaging_class.SendMessage(user, data)
      .then((result) => {
        // IO SENDS TO ALL USERS
        io.emit('Message-Received', result);
      }).catch((err) => {
        console.log(err)
        // io.emit('Message-Received', err);
      })
    }).catch((err) => {
      console.log(err)
      // Force logout
    })
  })
  socket.on('Message-FetchInit', (data) => {
    user_class.CheckToken(data.Token, socket.handshake.headers["x-real-ip"])
    .then((user) => {
      messaging_class.GetMessages(data)
      .then((result) => {
        socket.emit('Message-FetchInit_Reply', result);
      }).catch((err) => {
        console.log(err)
      })
    }).catch((err) => {
      console.log(err);
    })
  })

  // Users
  socket.on('User-Authenticate', (data) => {
    user_class.Login(data.username, data.password, socket.handshake.headers["x-real-ip"])
    .then((result) => {
      socket.emit('User-Authenticate_Reply', result);
    }).catch((err) => {
      socket.emit('User-Authenticate_Reply', err);
    })
  })
  socket.on('User-Register', (data) => {
    console.log(socket.handshake.headers["x-real-ip"])

  })
  socket.on('User-CheckToken', (data) => {
    console.log(data)
    user_class.CheckToken(data.Token, socket.handshake.headers["x-real-ip"])
    .then((result) => {
      socket.emit('User-CheckToken_Reply', result);
    }).catch((err) => {
      socket.emit('User-CheckToken_Reply', err);
    })
  })

});

server.listen(3000, () => {
  console.log('listening on 3000');
});
