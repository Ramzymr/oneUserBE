var connection = require('./../config');
var Cryptr = require('cryptr');
var lg = require('./../helper/logging');
cryptrClient = new Cryptr('h#S&AFz4S89g=XWbvPyj^2&pJsMWd^T&');
cryptrServer = new Cryptr('pwHOu19dP4o9ZX6E8lSCzMg0wgnboVRy');
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");


module.exports.reauthenticate = function (req, res) {
    var email = req.body.email;
    var password = cryptrClient.decrypt(req.body.password);
    console.log('email: ' + email);
    var products = {
        productID: 0,
        pruductName: '',
        group: ''

    }
    var resp = {
        status: false,
        type: 'authenticate_re',
        authenticated: false,
        email: email,
        at_user_group: "",
        role: "",
        api_token: "",
        login_token: "",
        message: "",
        products: []

    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'reSignOn',
        appluser: '',
        token: '',
        message: ''

    }
    connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
        if (error) {
            //res.json({
            // status:false,
            // message:'there are some error with query',
            //error: error
            // })
            resp.message = "Failed: " + error;
            res.json(resp);
        } else {
            if (results.length > 0) {
                decryptedString = cryptrServer.decrypt(results[0].password);
                console.log('PAssword row: '+results[0].password);
                console.log('PAssword: '+decryptedString);
                console.log('Client PAssword: '+password);
                if (password == decryptedString) {
                    req.user = email;
                    console.log(req.user);
                    console.log(results[0]);
                    var user = results[0];
                    var token = jwt.sign({
                        _id: user.email
                    }, 'secretKey');

                    var logged_in = results[0].logged;
                    var role = results[0].user_role;
                    var at_user_group = results[0].at_user_group;
                    console.log("Check log flag:" + (logged_in != 'Y'));
                    if (logged_in != 'Y') {
                        // Remove sign on from users
                        resp.status = false;
                        resp.message = 'Not signed on';
                        res.json(resp);
                    }
                    //resp.message = "Already logged in";
                    //res.json(resp);
                    //} else {
                    resp.status = true;
                    resp.authenticated = true;
                    resp.api_token = token;
                    resp.role = role;
                    resp.at_user_group = at_user_group;
                    //resp.email = email;
                    resp.message = "Successfully authenticated";
                    var login_token = randomstring.generate({
                        length: 12,
                        readable: true
                    });
                    resp.login_token = login_token;
                    var now = new Date();
                    log.datetime = now;
                    log.message = "Successful"
                    log.token = login_token;
                    //lg.log(log);
                    //var x = {

                    //  productID: 0,productName:'',group:''
                    //}
                    /*
                    var y = {
        
                      productID: 2,productName:'AEM',group:'USER'
                    }
                    resp.products.push(x);
                    resp.products.push(y);
                    */
                    //resp.products={productID: 2,productName:'AEM',group:'USER'};
                    console.log("Now: " + now);
                    var sql = "UPDATE users SET logged=?, api_token=?, login_token=?, logged_at=? WHERE email = ?";
                    connection.query(sql, ['Y', token, login_token, now, email], function (err, result) {
                        if (err) {
                            console.log("SQL Error: " + sql + 'Error:'+ err);
                        } else {

                            var sql = "SELECT * from user_products INNER JOIN products ON user_products.product_id=products.product_ID where user_products.user_email=?";
                            connection.query(sql, [email], function (err, result) {
                                if (err) throw err;
                                console.log("user_products:" + result.length);
                                //var myData = [];
                                for (i = 0; i < result.length; i++) {
                                    console.log(result[i].user_email);
                                    console.log(result[i].product_ID);
                                    console.log(result[i].productname);
                                    console.log(result[i].group1);
                                    var x = {
                                    }
                                    x.product_ID = result[i].product_ID;
                                    x.productname = result[i].productname;
                                    x.group = result[i].group1;
                                    //myData.push(x);
                                    console.log(x);
                                    resp.products[i] = x;
                                    console.log(resp.products[i]);

                                }
                                // Remove any AT sessions
                                var sql = "SELECT * from autotask WHERE at_usedby = ?";
                                connection.query(sql, [email], function (err, result) {
                                    if (err) {
                                        console.log("SQL Error: " + sql + 'Error:'+err);
                                    } else {
                                        if (result.length > 0) {

                                        //} else {
                                            var appluser = result[0].at_user;
                                            var sql = "UPDATE autotask SET at_used=?, at_usedby=? WHERE at_usedby = ?";
                                            connection.query(sql, [' ', ' ', email], function (err, result) {
                                                if (err) {
                                                    resp.status = false;
                                                    resp.message = 'SQL:Error while removing AT session..:' + err;
                                                    res.json(resp);
                                                } else {
                                                    console.log(result.affectedRows + " record(s) updated for autotask signed off");
                                                    if (result.affectedRows > 0) {
                                                        console.log(result.affectedRows + " record(s) updated for autotask signed off");
                                                        resp.status = true;
                                                        resp.message = "Re-logon sucessfull,AT session initialised";
                                                        var now = new Date();
                                                        log.datetime = now;
                                                        log.appluser = appluser;
                                                        log.message = "Re-logon sucessfull,AT session initialised";
                                                        lg.log(log);
                                                        res.json(resp);
                                                    } else {
                                                        //console.log(result.affectedRows + " record(s) updated for autotask signed off");
                                                        resp.status = true;
                                                        resp.message = "Re-logon sucessfull";
                                                        var now = new Date();
                                                        log.datetime = now;
                                                        log.appluser = '';
                                                        log.message = "Re-logon sucessfull";
                                                        lg.log(log);
                                                        res.json(resp);
                                                    }
                                                }
                                            });
                                        } else {

                                            resp.status = true;
                                            resp.message = "Re-logon sucessfull";
                                            var now = new Date();
                                            log.datetime = now;
                                            log.appluser = '';
                                            log.message = "Re-logon sucessfull";
                                            lg.log(log);
                                            res.json(resp);
                                        }
                                    }
                                });

                                //res.json(resp);
                            });
                        }
                    });

                    //res.json(resp);
                    //}
                    //res.json({
                    //    status:true,
                    //    authenticated: true,
                    //    token: token,
                    //    message:'successfully authenticated'
                    //})
                } else {
                    //res.json({
                    //  status:false,
                    //  message:"Email and password does not match"
                    // });
                    var now = new Date();
                    log.datetime = now;
                    log.appluser = '';
                    log.message = "Failed: Email/password incorrect";
                    lg.log(log);
                    resp.message = "Email/password incorrect";
                    res.json(resp);
                }

            }
            else {
                //res.json({
                //    status:false,    
                //  message:"Email does not exits"
                //});
                var now = new Date();
                log.datetime = now;
                log.appluser = '';
                log.message = "Failed: Email/password incorrect";
                lg.log(log);
                resp.message = "Email/password not correct"
                res.json(resp);
            }

        }
        //res.json(resp);
    });

}