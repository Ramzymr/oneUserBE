const cron = require("node-cron");
//const fs = require("fs");

var express=require("express");
var bodyParser=require('body-parser');
//var session = require('express-session');
var connection = require('./config');

var routes = require('routes');

// Maintenace routes
var oneuser = require('./routes/oneuser'); 
var atuser = require('./routes/atuser');


var app = express();
var http = require("http");
//SSL
const https = require('https');
const fs = require('fs');
// SSL
var authenticateController=require('./controllers/authenticate-controller');
var registerController=require('./controllers/register-controller');
var signoffController=require('./controllers/signoff-controller');
var atuserController=require('./controllers/atuser-controller');
var requestatuserController=require('./controllers/requestatuser-controller');
var signoffatuserController=require('./controllers/signoffatuser-controller');
var atheartbeatController=require('./controllers/atheartbeat-controller');
var reauthenticateController=require('./controllers/reauthenticate-controller');
var loghelper=require('./helper/logging');
var atdisconnect=require('./helper/atdisconnect');

// set-up cron tab job
cron.schedule("* * * * *", function() {
    var now = new Date();
    console.log("running a task every 2 minute: "+now);
    atdisconnect.atdisconnect();
  });

// end of crontab job
// add & configure middleware
//app.use(session({
    //genid: (req) => {
    //  console.log('Inside the session middleware')
     // console.log(req.sessionID)
     // return uuid() // use UUIDs for session IDs
    //},
 //   secret: 'keyboard cat',
 //   resave: false,
 //   saveUninitialized: true
 // }))
  
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.get('/', function (req, res) {  
    res.sendFile( __dirname + "/" + "index.html" );  
 })  
  
 app.get('/login.html', function (req, res) {  
    res.sendFile( __dirname + "/" + "login.html" );  
 }) 

 //app.get('/home', function (req, res) {  
 //   console.log("user: "+req.session.user);
 //    if(!req.session.user) {
 //       return res.status(401).send();


 //    }
     
 //   return res.status(200).send("Authenticated")
 //}) 
/* route to handle login and registration */
app.post('/api/register',registerController.register);
app.post('/api/authenticate',authenticateController.authenticate);
app.post('/api/signoff',signoffController.signoff);
app.post('/api/atuser',atuserController.atuser);
app.post('/api/requestatuser',requestatuserController.requestatuser);
app.post('/api/signoffatuser',signoffatuserController.signoffatuser);
app.post('/api/atheartbeat',atheartbeatController.atheartbeat);
app.post('/api/reauthenticate',reauthenticateController.reauthenticate);
//app.post('/controllers/register-controller', registerController.register);
//app.post('/controllers/authenticate-controller', authenticateController.authenticate);

// Maintenance routes
app.post('/oneuser',oneuser.list);//route list users
app.post('/oneuser/update',oneuser.update);//route update user record
app.post('/oneuser/add',oneuser.add);//route add user record
app.post('/oneuser/delete',oneuser.delete);//route add user record

// POST method route
app.post('/atuser',atuser.list);//route list AT users
app.post('/atuser/update',atuser.update);//route update AT users
app.post('/atuser/add',atuser.add);//route add AT users
app.post('/atuser/delete',atuser.delete);//route add AT users

var server = http.createServer(app);
/*
var x = {

    email: 'test',
    appl: 1
}
loghelper.log(x);
*/
const options = {
    passphrase: 'U&hq5M@cle*Z',
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('4611c0b465c5d75.crt')
  };
  /*
  https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);
*/
var server1 = https.createServer(options, app);
//.listen(8443);
//https.createServer(options, (req, res) => {
//
//    res.writeHead(200);
//    res.end('hello world\n');
//  }).listen(8443);
server1.listen(8443);

console.log("Listening http on 8012");

server.listen(8012);
//app.listen(8012, () => console.log("Server started on port 8000"));