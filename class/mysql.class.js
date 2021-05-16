const mysql = require("mysql");

var thisclass = {
  Connect: function()
  {
    const pool = mysql.createPool({
      connectionLimit: 100,
      host     : "localhost",
      user     : "root",
      password : "TFT123!",
      database : "talk",
      port : 3306
    });

    return pool;
  }
}



module.exports = thisclass;
