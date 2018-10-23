var connection = require('./../config');
var Cryptr = require('cryptr');
cryptrClient = new Cryptr('h#S&AFz4S89g=XWbvPyj^2&pJsMWd^T&');
cryptrServer = new Cryptr('pwHOu19dP4o9ZX6E8lSCzMg0wgnboVRy');
var sv = require('./../helper/sessionValidator');
var lg = require('./../helper/logging');
// AT User list

exports.list = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    var resp = {
        status: false,
        type: 'ATuser.list',
        email: email,
        api_token: "",
        login_token: "",
        message: "",
        count: 0,
        data: []

    }
    var isValid = sv.isValidSession(email, login_token, function (result) {
        console.log('isValid:' + result.message)
        if (result.status == true) {
            connection.query('SELECT * FROM autotask', function (error, results, fields) {
                if (error) {
                    resp.status = false;
                    resp.message = "SQL error at AT users list: "+error;
                } else {

                    resp.count = results.length;
                    console.log('count : ' + resp.count);
                    for (i = 0; i < results.length; i++) {
                        var x = {};
                        x.user = results[i].at_user;
                        x.group = results[i].at_group;
                        //x.group = results[i].at_password;
                        resp.data.push(x);


                    }
                    resp.status = true;
                    resp.message = "AT users list successfull"
                    res.json(resp);
                }
            });

        } else {
            resp.status = false;
            resp.message = 'Not a valid session'
            res.json(resp);
        }



    });
}

exports.update = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    var user = req.body.at_user;
    var resp = {
        status: false,
        type: 'ATuser.update',
        email: email,
        atuser: user,
        api_token: "",
        login_token: "",
        message: "",
        
    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'ATuserUpdate',
        appluser: '',
        token: login_token,
        message: ''
    
      }
    var isValid = sv.isValidSession(email, login_token, function (result) {
        console.log('isValid:' + result.message)
        if (result.status == true) {
            try {
                _user = req.body.at_user;
                _group = req.body.at_group;
                _password = cryptrClient.decrypt(req.body.at_password);
                console.log("Body password:"+req.body.at_password);
                console.log("cleint decrypted password:"+_password);
                console.log("cleint decrypted password length:"+_password.length);
                if(_password.length ==0) {
                    var sql = "UPDATE autotask SET at_group=?  where at_user=?";
                    var param_list = [_group,_user];
                } else {
                    
                    _passwordenc = cryptrServer.encrypt(_password);
                    console.log("Server encrypted password:"+_passwordenc);
                    var sql = "UPDATE autotask SET at_group=?, at_password=?  where at_user=?";
                    var param_list = [_group,_passwordenc,_user];

                }
                
                var _now = new Date();
                } catch (ex) {
                    resp.status = false;
                    resp.message = "Data error: " + ex;
                    res.json(resp);
                    return;
                }
                
                connection.query(sql, param_list, function (error, results, fields) {
                    if (error) {
                        resp.status = false;
                        resp.message = "AT User record update failed: " + error;
                        res.json(resp);
                    } else {
                        console.log(results.affectedRows + " record(s) updated - User update");
                        resp.status = true;
                        resp.message = "AT user update successfull"
                        var now = new Date();
                        log.datetime=now;
                        log.appluser=_user;
                        log.message = "AT user update successfull";
                        lg.log(log);
                        res.json(resp);
                    }
                });

        } else {
            resp.status = false;
            var now = new Date();
            log.datetime=now;
            log.appluser="";
            log.message = "Failed: Not a valid session";
            lg.log(log);            
            
            resp.message = 'Not a valid session';
            res.json(resp);
        }



    });
}

exports.add = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    var user = req.body.at_user;
    var resp = {
        status: false,
        type: 'ATuser.add',
        email: email,
        atuser: user,
        api_token: "",
        login_token: "",
        message: "",
        
    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'ATuserAdd',
        appluser: '',
        token: login_token,
        message: ''
    
      }
    var isValid = sv.isValidSession(email, login_token, function (result) {
        console.log('isValid:' + result.message)
        if (result.status == true) {
            try {
                _user = req.body.at_user;
                _group = req.body.at_group;
                _password = cryptrClient.decrypt(req.body.at_password);
                _passwordenc = cryptrServer.encrypt(_password);
                var _now = new Date();
                } catch (ex) {
                    resp.status = false;
                    resp.message = "Data error: " + ex;
                    res.json(resp);
                    return;
                }
                var sql = "INSERT INTO autotask (at_user,at_group,at_password) values(?,?,?)";
                connection.query(sql, [ _user,_group, _passwordenc], function (error, results, fields) {
                    if (error) {
                        resp.status = false;
                        resp.message = "AT User record update failed: " + error;
                        res.json(resp);
                    } else {
                        console.log(results.affectedRows + " record(s) inserted - AT User add");
                        resp.status = true;
                        resp.message = "AT user add successfull"
                        var now = new Date();
                        log.datetime=now;
                        log.appluser=_user;
                        log.message = "AT user add successfull";
                        lg.log(log);
                        res.json(resp);
                    }
                });

        } else {
            resp.status = false;
            var now = new Date();
            log.datetime=now;
            log.appluser="";
            log.message = "Failed: Not a valid session";
            lg.log(log); 
            resp.message = 'Not a valid session'
            res.json(resp);
        }



    });
}

exports.delete = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    var user = req.body.at_user;
    var resp = {
        status: false,
        type: 'ATuser.delete',
        atuser: user,
        email: email,
        api_token: "",
        login_token: "",
        message: "",
        
    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'ATuserDelete',
        appluser: '',
        token: login_token,
        message: ''
    
      }

    var isValid = sv.isValidSession(email, login_token, function (result) {
        console.log('isValid:' + result.message)
        if (result.status == true) {
            try {
                _user = req.body.at_user;
                var _now = new Date();
                } catch (ex) {
                    resp.status = false;
                    resp.message = "Data error: " + ex;
                    res.json(resp);
                    return;
                }
                var sql = "DELETE FROM autotask where at_user=?";
                connection.query(sql, [_user], function (error, results, fields) {
                    if (error) {
                        resp.status = false;
                        resp.message = "AT User record delete failed: " + error;
                        res.json(resp);
                    } else {
                        console.log(results.affectedRows + " record(s) deleted - AT User delete");
                        resp.status = true;
                        var now = new Date();
                        log.datetime=now;
                        log.appluser=_user;
                        log.message = "AT user delete successfull";
                        lg.log(log);
                        resp.message = "AT user delete successfull"
                        res.json(resp);
                    }
                });

        } else {
            resp.status = false;
            var now = new Date();
            log.datetime=now;
            log.appluser="";
            log.message = "Failed: Not a valid session";
            lg.log(log); 
            resp.message = 'Not a valid session'
            res.json(resp);
        }



    });
}