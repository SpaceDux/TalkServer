let pool = require('./mysql.class.js').Connect()
let bcrypt = require("bcrypt")
let misc_class = require('./misc.class.js');


let thisclass = {
  Login: function(user, pass, ip) {
    return new Promise(function(resolve, reject) {
      pool.getConnection((err, connection) => {
        if(!err) {
          connection.query("SELECT id,password,username,status FROM users WHERE username = ? LIMIT 1", user, function(err, rows) {
            if(!err) {
              if(rows.length > 0) {
                if(rows[0].status == 0) {
                  bcrypt.compare(pass, rows[0].password, function(err, result) {
                    if(!err) {
                      if(result == true) {
                        let user_details = rows[0];
                        // Good hash.
                        thisclass.GenerateToken(user_details.id, ip)
                        .then((uuid) => {
                          connection.query("UPDATE users SET last_loggedin = CURRENT_TIMESTAMP", function(err, rows) {
                            if(!err) {
                              if(rows.affectedRows > 0) {
                                // auth success.
                                connection.release();
                                resolve({"Result":1, "Message":"Auth success.", "UserID":user_details.id, "Username":user_details.username, "Token":uuid});
                              }
                            } else {
                              console.log(err)
                              connection.release();
                              reject({"Result":0, "Message":"Something wen't wrong."});
                            }
                          })
                        }).catch(() => {
                          connection.release();
                          reject({"Result":0, "Message":"Something wen't wrong with the token generator."});
                        })
                      } else {
                        connection.release();
                        reject({"Result":0, "Message":"That password does not match our records."});
                      }
                    } else {
                      // Error while checking hash,
                      console.log(err)
                      connection.release();
                      reject({"Result":0, "Message":"Something wen't wrong."});
                    }
                  });
                } else {
                  // User is banned.
                  connection.release();
                  reject({"Result":0, "Message":"You're not allowed to use our service."});
                }
              } else {
                // No users
                connection.release();
                reject({"Result":0, "Message":"We can't find that user on our records."});
              }
            } else {
              // Error with mysql query
              console.log(err)
              connection.release();
              reject({"Result":0, "Message":"Something wen't wrong."});
            }
          })
        } else {
          // Error getting connection from pool.
          console.log(err)
          connection.release();
          reject({"Result":0, "Message":"Something wen't wrong."});
        }
      })
    });
  },
  GenerateToken: function(id, ip) {
    return new Promise(function(resolve, reject) {
      misc_class.UUID_Generator()
      .then((uuid) => {
        pool.getConnection((err, connection) => {
          if(!err) {
            connection.query("SELECT COUNT(id) AS Dup FROM users_tokens WHERE token = ?", uuid, function(err, rows) {
              if(!err) {
                if(rows[0].Dup > 0) {
                  // Is duplicate, regenerate
                  thisclass.User_GenerateToken(id, ip);
                } else {
                  connection.query("DELETE FROM users_tokens WHERE user_id = ?", id, function(err, rows) {
                    if(!err) {
                      connection.query("INSERT INTO users_tokens (token, user_id, ipAddress) VALUES(?, ?, ?)", [uuid, id, ip], function(err, rows) {
                        if(!err) {
                          // Token added. Resolve token back to auth.
                          connection.release()
                          resolve(uuid);
                        } else {
                          // Unable to gen token.
                          console.log(err)
                          connection.release()
                          reject()
                        }
                      })
                    } else {
                      console.log(err)
                      connection.release()
                      reject()
                    }
                  })
                }
              } else {
                // Unable to gen token.
                console.log(err)
                connection.release()
                reject()
              }
            })
          } else {
            console.log(err)
            connection.release()
            reject()
          }
        })
      })
    });
  },
  // THERE IS NOT PROPER TOKEN VALIDATION HAPPENING CURRENTLY, JUST CHECKS TOKEN EXISTS!
  CheckToken: function(token, ip) {
    return new Promise(function(resolve, reject) {
      pool.getConnection((err, connection) => {
        if(!err) {
          connection.query("SELECT users_tokens.user_id,users.username FROM users_tokens INNER JOIN users ON users_tokens.user_id = users.id WHERE token = ? AND ipAddress = ? LIMIT 1", [token, ip], function(err, rows) {
            if(!err) {
              if(rows.length > 0) {
                connection.release();
                resolve({"Result":1, "Message":"Token Exists.", "UserID":rows[0].user_id, "Username":rows[0].username, "Token":token});
              } else {
                connection.release();
                reject({"Result":0, "Message":"Not valid, re-auth."})
              }
            } else {
              console.log(err)
              connection.release();
              reject({"Result":0, "Message":"Something went wrong"})
            }
          })
        } else {
          console.log(err)
          connection.release();
          reject({"Result":0, "Message":"Something went wrong"})
        }
      })
    });
  }
}


module.exports = thisclass;
