const cron = require("node-cron");
//const fs = require("fs");

var express = require("express");
var bodyParser = require('body-parser');
//var session = require('express-session');
var connection = require('./config');

var routes = require('routes');

// Maintenace routes
var oneuser = require('./routes/oneuser');
var atuser = require('./routes/atuser');
var web = require('./routes/web');

var app = express();

//pubic static
app.use( express.static( "public" ) );

var http = require("http");
//SSL
const https = require('https');
const fs = require('fs');
// SSL
var authenticateController = require('./controllers/authenticate-controller');
var registerController = require('./controllers/register-controller');
var signoffController = require('./controllers/signoff-controller');
var atuserController = require('./controllers/atuser-controller');
var requestatuserController = require('./controllers/requestatuser-controller');
var signoffatuserController = require('./controllers/signoffatuser-controller');
var atheartbeatController = require('./controllers/atheartbeat-controller');
var reauthenticateController = require('./controllers/reauthenticate-controller');
var loghelper = require('./helper/logging');
var atdisconnect = require('./helper/atdisconnect');
var vs = require('./helper/userValidator');

// set-up cron tab job
/*
cron.schedule("* * * * *", function () {
    var now = new Date();
    console.log("running a task every 2 minute: " + now);
    atdisconnect.atdisconnect();
});
*/
// temporarily stopped cron job

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/*
app.get('/', function (req, res) {  
    res.sendFile( __dirname + "/" + "index.html" );  
 })  
  
 app.get('/login.html', function (req, res) {  
    res.sendFile( __dirname + "/" + "login.html" );  
 }) 
*/
// Web interface requirements
app.set('view engine', 'ejs');
var session = require('express-session');
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

// Authentication and Authorization Middleware
var auth = function (req, res, next) {

    // Validate user
    if (req.session && req.session.user === "amy" && req.session.admin)
        return next();
    else
        return res.sendStatus(401);
};

/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authenticateController.authenticate);
app.post('/api/signoff', signoffController.signoff);
app.post('/api/atuser', atuserController.atuser);
app.post('/api/requestatuser', requestatuserController.requestatuser);
app.post('/api/signoffatuser', signoffatuserController.signoffatuser);
app.post('/api/atheartbeat', atheartbeatController.atheartbeat);
app.post('/api/reauthenticate', reauthenticateController.reauthenticate);
//app.post('/controllers/register-controller', registerController.register);
//app.post('/controllers/authenticate-controller', authenticateController.authenticate);

// Maintenance routes
app.post('/oneuser', oneuser.list);//route list users
app.post('/oneuser/update', oneuser.update);//route update user record
app.post('/oneuser/add', oneuser.add);//route add user record
app.post('/oneuser/delete', oneuser.delete);//route add user record

// POST method route

app.post('/atuser', atuser.list);//route list AT users
app.post('/atuser/update', atuser.update);//route update AT users
app.post('/atuser/add', atuser.add);//route add AT users
app.post('/atuser/delete', atuser.delete);//route add AT users
app.get('/',web.root);
app.post('/login',web.login);
app.get('/logout',web.logout);
app.get('/logs',web.logs);
app.post('/displayLogs',web.displayLogs);
// web interface access
/*
app.get('/', function (req, res) {
    console.log("login get: " + req.query.username);
    console.log("login get: session user" + req.session.user);
    if (!req.session.user || req.session.user == undefined) {
        console.log("Session user is:" + req.session.user)
        res.render('pages/login', {
            user: "",
            role: "",
            msg: ""

        });
    } else {

        user = req.session.user;
        role = true;
        res.render('pages/index', {
            user: user,
            role: role,
            msg: ""

        });

    }


});
*/
/*
app.post('/login', function (req, res) {
    console.log("login post:" + req.body.username);
    console.log("login post:" + req.body.password);
    var user = req.body.username;
    var pwd = req.body.password;
    if (!req.body.username || !req.body.password) {
        res.render('pages/login', {
            user: "",
            role: "",
            msg: ""

        });
        //res.send('login failed'); 
    } else {
        var isValidUser = vs.isValidUser(user, pwd, function (result) {
            console.log("result message: " + result.message);
            if (result.status == true) {
                console.log("Valid user");
                req.session.user = result.user;
                req.session.role = result.role;
                var user = req.session.user;
                var role = req.session.role;
                console.log("Redirecting home page");
                var username = req.body.username
                res.render('pages/index', {
                    user: user,
                    role: role
                });
                //res.render('pages/index');
            } else {
                var errMsg = result.message;
                res.render('pages/login', {
                    user: "",
                    role: "",
                    msg: errMsg

                });
            }



        });


    }

});
*/
/*
app.get('/logout', function (req, res) {
    console.log("logout get: " + req.query.username);
    console.log("logout get: session user" + req.session.user);
    if (!req.session.user || req.session.user == undefined) {
        console.log("Session user is:" + req.session.user)
        res.render('pages/login', {
            user: "",
            role: "",
            msg: ""

        });
    } else {
        req.session.destroy();
        //res.send("logout success!");
        user = "";
        role = "";
        msg = "";
        res.render('pages/login', {
            user: user,
            role: role,
            msg: msg

        });

    }


});
*/
/*
app.get('/logs', function (req, res) {

    console.log("logs: session user" + req.session.user);
    console.log("logs: session user role" + req.session.role);
    if (!req.session.user || req.session.user == undefined) {
        console.log("Session user is:" + req.session.user)
        var user = req.session.user;
        var role = req.session.role;
        res.render('pages/login', {
            user: user,
            role: role,
            msg: ""

        });
    } else {

        var user = req.session.user;
        var role = req.session.role;
        var param_list = "";
        var data = "";
        var products = "";

        msg = "";
        var sql = "SELECT name,email from users"
        connection.query(sql, param_list, function (error, results, fields) {
            if (error) {
                msg = "No data found";
            } else {
                console.log("Totals  user records: " + results.length);
                data = results;
            }
            var sql = "SELECT product_id,productname from products";
            connection.query(sql, param_list, function (error, results, fields) {
                if (error) {
                    msg = "No product data found";
                } else {
                    console.log("Totals  product records: " + results.length);
                    products = results;
                }
                res.render('pages/logs', {
                    user: user,
                    role: role,
                    users: data,
                    products: products,
                    msg: ""

                });
            });

        });


    }


});
*/
/*
app.post('/displayLogs/', function (req, res) {

    console.log("logs: session user" + req.session.user);
    var perPage = 10;
    if (!req.session.user || req.session.user == undefined) {
        console.log("Session user is:" + req.session.user)
        var user = req.session.user;
        var role = req.session.role;
        res.render('pages/login', {
            user: user,
            role: role,
            msg: ""

        });
    } else {
        if (req.body.isFirst == undefined) {

            console.log("is first=" + "Y");
            var user = req.session.user;
            var role = req.session.role;
            msg = "";
            var userInList = "";
            var productInList = "";
            var productInListNames = "";
            var startRecord = 0;
            var endRecord = 0;
            startRecord = req.body.startRecord;
            endRecord = req.body.endRecord;
            console.log("start: " + startRecord);
            console.log("end: " + endRecord);
            console.log("Date1: " + req.body.date1);
            console.log("Date2: " + req.body.date2);

            if (req.body.userList == undefined) {

            } else {
                console.log("userList: " + req.body.userList.length);
                console.log("userList: " + req.body.userList[0]);
                for (i = 0; i < req.body.userList.length; i++) {
                    userInList = userInList + "'" + req.body.userList[i] + "',"
                }
                userInList = userInList.substring(0, userInList.length - 1);
                console.log("userInList: " + userInList);
            }
            if (req.body.productList == undefined) {

            } else {
                console.log("new prod List: " + req.body.productList.length);

                console.log("productList: " + req.body.productList.length);
                //console.log("productList 0: "+req.body.productList[0]);

                //console.log("productList 0 name: "+req.body.productList[0].id);
                for (i = 0; i < req.body.productList.length; i++) {
                    console.log("hidden text name: " + req.body.p[req.body.productList[i]]);
                    //var element = 'p'+req.body.productList[i];
                    //console.log("element: "+req.body[element]);
                    productInList = productInList + req.body.productList[i] + ","
                    productInListNames = productInListNames + req.body.p[req.body.productList[i]] + ',';
                }
                productInList = productInList.substring(0, productInList.length - 1);
                productInListNames = productInListNames.substring(0, productInListNames.length - 1);
                console.log("productInList: " + productInList);
                console.log("productInListNames: " + productInListNames);
            }
            var date1 = req.body.date1;
            var date2 = req.body.date2
            var sql = "SELECT * FROM logs INNER JOIN products ON logs.log_application=products.product_ID";
            // Get data
            if (date1 != "" && date2 != "") {
                sql = sql + " WHERE log_datetime BETWEEN '" + date1 + " 00:00:00' AND '" + date2 + " 23:00:00'";
                //sql = sql+" WHERE (log_datetime >='"+date1 +" 00:00:00' AND <='"+date2+" 23:59:59')";
                msg = "[Date range: " + date1 + " - " + date2 + "]"
            }
            if (userInList != "") {
                if (sql.indexOf("WHERE") >= 0) {
                    sql = sql + " AND log_email IN (" + userInList + ")";
                } else {
                    sql = sql + " WHERE log_email IN (" + userInList + ")";
                }
                msg = msg + "[Users: " + req.body.userList + "]";
            }
            if (productInList != "") {
                if (sql.indexOf("WHERE") >= 0) {
                    sql = sql + " AND log_application IN (" + productInList + ")";
                } else {
                    sql = sql + " WHERE log_application IN (" + productInList + ")";
                }
                msg = msg + "[Products: " + productInListNames + "]";
            }
            var param_list = [perPage,0];
            var data = "";
            console.log("SQL: " + sql);
            console.log("msg:" + msg);
            if (msg == "") {
                msg = "Showing all"
            }
            connection.query(sql, "", function (error, results, fields) {
                if (error) {
                    msg = "No data found";

                } else {
                    console.log("Totals records: " + results.length);
                    totalRecords = results.length;
                    var totalPages =  Math.floor( totalRecords/perPage);
                    console.log("Total Pages: " + totalPages);
                    //perPage = 10;
                    //data = results;
                    sql = sql + " limit ? offset ?";
                    console.log("SQL1: " + sql);
                    console.log("param list: " + param_list);
                    connection.query(sql, param_list, function (error, results, fields) {
                        if (error) {
                            msg = "No data found";
                        } else {
                            console.log("Totals records: " + results.length);
                            //totalRecords = results.length;
                            perPage = 10;
                            data = results;
                        }
                        res.render('pages/displaylogs', {
                            user: user,
                            role: role,
                            data: data,
                            msg: msg,
                            qry: sql,
                            pages: totalPages,
                            perpage: perPage,
                            current: 1

                        });
                    });
                }
                });
        } else {
            console.log("is first=" + req.body.isFirst);
            console.log("sql passed=" + req.body.qry);
            console.log("button_id=" + req.body.button_id);
            console.log("Pages=" + req.body.pages);
            console.log("current=" + req.body.current);
            var pages = req.body.pages;
            var current = req.body.button_id;
            
            var param_list = [perPage,perPage*current];
            sql = req.body.qry;
            msg = req.body.msg;

            
                    console.log("SQL1: " + sql);
                    console.log("param list: " + param_list);
                    connection.query(sql, param_list, function (error, results, fields) {
                        if (error) {
                            msg = "No data found";
                        } else {
                            console.log("Totals records: " + results.length);
                            //totalRecords = results.length;
                            perPage = 10;
                            data = results;
                        }
                        res.render('pages/displaylogs', {
                            user: user,
                            role: role,
                            data: data,
                            msg: msg,
                            qry: sql,
                            pages: pages,
                            perpage: perPage,
                            current: current

                        });
                    });
            
        }

    }


});
// end of displayLogs
*/
var server = http.createServer(app);
/*
var x = {

    email: 'test',
    appl: 1
}
loghelper.log(x);
*/
app.get('*', function (req, res) {
    res.status(404).end();
});


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
var x = new Date();
  console.log(x);
server.listen(8012);
//app.listen(8012, () => console.log("Server started on port 8000"));