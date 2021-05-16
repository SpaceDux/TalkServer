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
  }
}

module.exports = thisclass;
