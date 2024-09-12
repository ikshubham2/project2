
const mysql = require('mysql2');
const connection = mysql.createConnection ({
    host: 'localhost', // Replace with your MySQL server host
    user: 'root', // Replace with your MySQL username
    password: '13svbabu143', // Replace with your MySQL password
    database: 'users', // Replace with your MySQL database   
});

connection.connect(function(err){
    if(err) throw err;
    console.log("connected!!");
});

module.exports = connection.promise();

