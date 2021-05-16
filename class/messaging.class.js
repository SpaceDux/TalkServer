let pool = require('./mysql.class.js').Connect()


let thisclass = {
  Test: function() {
    return new Promise(function(resolve, reject) {
      pool.getConnection((err, connection) => {
        if(!err) {
          console.log("Got a connection pool.");
          let username = "Cas";
          connection.query("SELECT id FROM users WHERE username = ?", [username], (err, rows) => {
            if(!err) {
              console.log(rows);
              connection.release(); // ALWAYS RELEASE CONNECTION BACK TO POOL!!!!
            } else {
              console.log(err);
              connection.release(); // RELEASE HERE TOO !!!
            }
          })
        } else {
          console.log(err);
          connection.release();
        }
      })
    });
  },
  GetMessages: function() {
    return new Promise(function(resolve, reject) {
      pool.getConnection((err, connection) => {
        if(!err) {
          connection.query("SELECT id,author,message,channel,datetime FROM messages WHERE status < 1 LIMIT 100", function(err,rows) {
            if(!err) {
              resolve(rows);
              connection.release()
            } else {
              console.log(err)
              reject("Error")
              connection.release()
            }
          })
        } else {
          reject("Error")
          connection.release()
        }
      })
    });
  },
  // Deal with Send Message
  SendMessage: function(data) {
    return new Promise(function(resolve, reject) {
      pool.getConnection((err, connection) => {
        if(!err) {
          let date = new Date(Date.now());
          connection.query("INSERT INTO messages (author, message, channel, datetime, status) VALUES (?, ?, ?, ?, 0)", [data.author, data.message, data.channel, date.toISOString().replace("T", " ").slice(0, -5)], function(err, rows) {
            if(!err) {
              connection.release()
              console.log(date.toISOString().replace("T", ""))
              resolve({"author":data.author, "message":data.message, "channel":1, "datetime":date.toISOString().replace("T", " ").slice(5)})
            } else {
              console.log(date.toISOString().replace("T", " ").slice(0, -5))
              console.log(err)
              connection.release()
              reject("Sorry, something went wrong. 1")
            }
          })
        } else {
          console.log(err)
          connection.release()
          reject("Sorry, something went wrong. 2")
        }
      })
    });
  }
}

module.exports = thisclass;
