// Modules
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let thisclass = {
  ConnectAsync: async function() {
    const db = await open({
      filename: './database.db',
      driver: sqlite3.cached.Database
    });

    console.log(db)
  },

}


module.exports = thisclass;
