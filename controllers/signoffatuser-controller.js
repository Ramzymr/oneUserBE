var connection = require('./../config');
var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');
var lg = require('./../helper/logging');

module.exports.signoffatuser = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;

    console.log('email: ' + email);
    console.log('login_token: ' + login_token);
    var resp = {
        status: false,
        type: 'signoffatuser',
        email: email,
        message: ""

    }
    var log = {
        email: email,
        application: 1,
        datetime: '',
        task: 'ATuserSignOff',
        appuser: '',
        token:'',
        message: ''
    
      }
    console.log((email === undefined) || (login_token === undefined));
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email or login token');
        res.json(resp);
    } else {
        console.log("AT user signed off");
        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            if (error) {
                console.log('error');
                resp.message = "Failed: " + error;
                res.json(resp);
            } else {
                if (results.length > 0) {
                    console.log(results[0]);
                    var _logged = results[0].logged;
                    var _login_token = results[0].login_token;
                    console.log('Logged: ' + _logged);
                    console.log((_logged === 'Y' && _login_token === login_token));
                    if (_logged === 'Y' && _login_token === login_token) {
                        connection.query('SELECT * FROM `autotask` WHERE at_usedby=?', [email], function (error, results, fields) {
                            if (error) {

                            } else {
                                if (results.length > 0) {
                                    if (results[0].at_used == 'Y') {
                                        console.log("Autotask: " + results[0].at_usedby);
                                        var appuser = results[0].at_user;
                                        var sql = "UPDATE autotask SET at_used=?, at_usedby=? WHERE at_usedby = ?";
                                        connection.query(sql, [' ', ' ', email], function (err, result) {
                                            if (err) {
                                                resp.status = false;
                                                resp.message = 'Error while updating..:' + err;
                                                res.json(resp);
                                            } else {

                                                console.log(result.affectedRows + " record(s) updated for autotask signed off");
                                                resp.status = true;
                                                resp.message = "AT user logged off sucessfully";
                                                var now = new Date();
                                                log.datetime=now;
                                                log.appluser=appuser;
                                                log.token = login_token;
                                                log.message = "Successful"
                                                lg.log(log);
                                                res.json(resp);
                                            }
                                        });
                                    
                                    } else {
                                        
                                        status = false;
                                        var now = new Date();
                                        log.datetime=now;
                                        log.appluser="";
                                        log.token = login_token;
                                        log.message = "Failed: No AT users found to signoff"
                                        lg.log(log);
                                        resp.message = "No users found";
                                        res.json(resp);
                                    }
                                } else {
                                    status = false;
                                    var now = new Date();
                                    log.datetime=now;
                                    log.appluser="";
                                    log.token = login_token;
                                    log.message = "Failed: No AT users found to signoff"
                                    lg.log(log);
                                    resp.message = "No users found";
                                    res.json(resp);                              
                                }
                            }

                        })

                    } else {

                        console.log("Not logged");
                        var now = new Date();
                        log.datetime=now;
                        log.appluser="";
                        log.token = login_token;
                        log.message = "Failed: Not logged in or invalid token"
                        lg.log(log);
                        resp.message = 'Not logged in or invalid token';
                        console.log(resp);
                        res.json(resp);
                    }

                } else {

                    console.log('not logged');
                    var now = new Date();
                        log.datetime=now;
                        log.appluser="";
                        log.token = login_token;
                        log.message = "Failed: Unable to locate one user"
                        lg.log(log);
                    resp.message = "Unable to locate user";
                    res.json(resp);
                }

            }
        })


    }


}