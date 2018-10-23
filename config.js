var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Password.01',
  database : 'involve360'
  //host     : 'oneuserdb.mysql.database.azure.com',
  //user     : 'oneuserdbadmin@oneuserdb',
  //password : '!DroylTHau2@',
  //database : 'involve360' 
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected");
} else {
    console.log("Error while connecting with database: "+err);
}
});

module.exports = connection;