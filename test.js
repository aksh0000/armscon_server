const mysql = require('mysql');
var con = mysql.createConnection({
  host: 'database-1.cfes600acmp1.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: '##QazWsxEdc$$123',
  database: 'database-1',
  port: 3306
});

con.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database!');

  // SQL query to create a new table
  const createTableQuery = `
    CREATE TABLE users (
      fullname VARCHAR(200) NOT NULL,
      phonenumber VARCHAR(200) NOT NULL,
      email VARCHAR(200) NOT NULL,
      college VARCHAR(255) NOT NULL,
      year VARCHAR(255) NOT NULL,
      course VARCHAR(255) NOT NULL,
      plan VARCHAR(255) NOT NULL,
      half_day_workshops VARCHAR(255) NOT NULL,
      full_day_workshops VARCHAR(255) NOT NULL,
      entertainment VARCHAR(255) NOT NULL,
      dp VARCHAR(255) NOT NULL,
      mode_of_payment VARCHAR(255) NOT NULL,
      screenshot VARCHAR(255) NOT NULL,
      varification VARCHAR(255) NOT NULL
    );
  `;

  // Run the query to create the table
  connection.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
    console.log('Table created successfully!');
  });

  // Close the connection
  connection.end();
});