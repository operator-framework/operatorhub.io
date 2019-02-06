const sqlite3 = require('sqlite3').verbose();

let db;

exports.initialize = function(callback) {
  db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE, err => {
    if (err) {
      console.error(err.message);
      callback(err);
      return;
    }
    console.log('Connected to the in-memory SQlite database.');
    db.run('CREATE TABLE operators (name TEXT, dt TEXT)');
    callback();
  });
};

exports.close = function() {
  db.close();
};

exports.getOperator = function(operatorName, callback) {
};

exports.getOperators = function(callback) {
};

exports.clearOperators = function(callback) {
};

exports.addOperators = function(operators, callback) {
};
