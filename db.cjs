const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hms'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as id ' + connection.threadId);
});

// Create a dedicated function to execute queries
const executeQuery = (query, params, callback) => {
  connection.query(query, params, callback);
};

module.exports = { executeQuery };