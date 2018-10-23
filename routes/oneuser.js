var connection = require('./../config');
var Cryptr = require('cryptr');
cryptrClient = new Cryptr('h#S&AFz4S89g=XWbvPyj^2&pJsMWd^T&');
cryptrServer = new Cryptr('pwHOu19dP4o9ZX6E8lSCzMg0wgnboVRy');
var lg = require('./../helper/logging');
// User list
exports.list = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;

    var resp = {
        status: false,
        type: 'oneuser.list',
        email: email,
        at_user_group: "",
        api_token: "",
        login_token: "",
        message: "",
        count: 0,
        data: []

    }
    console.log((login_token == undefined));
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email login token');
        res.json(resp);
    } else {
        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            console.log('after sql');
            if (results.length > 0) {
                var _logged = results[0].logged;
                var _login_token = results[0].login_token;

                console.log('Logged: ' + _logged);
                console.log((_logged === 'Y' && _login_token === login_token));
                if (_logged === 'Y' && _login_token === login_token) {
                    connection.query('SELECT * FROM users', function (error, results, fields) {
                        resp.count = results.length;
                        console.log('count : ' + resp.count);
                        for (i = 0; i < results.length; i++) {
                            var x = {};
                            x.email = results[i].email;
                            x.name = results[i].name;
                            x.user_role = results[i].user_role;
                            x.at_user_group=results[i].at_user_group;
                            resp.data.push(x);


                        }
                        resp.status = true;
                        resp.message = "users list successfull"
                        res.json(resp);

                    });
                } else {
                    resp.message = "User session not valid ";
                    res.json(resp);
                    console.log('Inside one user js');

                }
            }else {
                resp.message = "User logged in ";
                res.json(resp);
                //console.log('Inside one user js');
            }
        });
    }
};

// User update

exports.update = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;

    var resp = {
        status: false,
        type: 'oneuser.update',
        email: email,
        at_user_group: "",
        api_token: "",
        login_token: "",
        message: "",
        count: 0,
        data: []

    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'oneUserUpdate',
        appluser: '',
        token: login_token,
        message: ''
    
      }
    console.log((login_token == undefined));
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email login token');
        res.json(resp);
    } else {
        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            console.log('after sql');
            if (results.length > 0) {
                var _logged = results[0].logged;
                var _login_token = results[0].login_token;

                console.log('Logged: ' + _logged);
                console.log((_logged === 'Y' && _login_token === login_token));
                if (_logged === 'Y' && _login_token === login_token) {
                    try {
                    _email = req.body.user_email;
                    _name = req.body.user_name;
                    _role = req.body.user_role;
                    _at_user_group = req.body.at_user_group;
                    console.log("Password in body: "+req.body.user_password);
                    console.log("length of Password in body: "+req.body.user_password.length);
                    _pwd = cryptrClient.decrypt(req.body.user_password);
                    console.log("length of client decrypted Password length "+_pwd.length);
                    var mysql = "";
                    var param_list = "";
                    if( _pwd.length == 0 ) {
                        //_password = results[0].password;
                        //console.log("Password in table: "+_password);
                        sql = "UPDATE users SET name=?, user_role=?, at_user_group=?  where email=?";
                        param_list = [_name, _role, _at_user_group, _email];
                    } else {
                        _pwd = cryptrClient.decrypt(req.body.user_password);
                        console.log("Password clint decrypt: "+_pwd);
                        _password = cryptrServer.encrypt(_pwd);
                        console.log("Password server ecrypt: "+_password);
                        sql = "UPDATE users SET name=?, password=?, user_role=?, at_user_group=?  where email=?";
                        param_list = [_name, _password, _role, _at_user_group, _email];
                    }
                    var _now = new Date();
                    } catch (ex) {
                        resp.status = false;
                        resp.message = "Data error: " + ex;
                        res.json(resp);
                        return;
                    }
                    //var sql = "UPDATE users SET name=?, password=?, user_role=?, at_user_group=?  where email=?";
                    connection.query(sql, param_list, function (error, results, fields) {
                        if (error) {
                            resp.status = false;
                            resp.message = "User record update failed: " + error;
                            res.json(resp);
                        } else {
                            console.log(results.affectedRows + " record(s) updated - User update");
                            resp.status = true;
                            resp.message = "oneUser update successfull"
                            var now = new Date();
                            log.datetime=now;
                            
                            log.message = "oneUser update successfull";
                            lg.log(log);
                            res.json(resp);
                        }
                    });
                } else {
                    resp.message = "User not authorised ";
                    var now = new Date();
                    log.datetime=now;
                            
                    log.message = "Failed: User not authorised";
                    lg.log(log);
                    res.json(resp);
                    

                }
            }else {
                resp.message = "User session not valid ";
                var now = new Date();
                log.datetime=now;
                            
                log.message = "Failed: User session not valid";
                lg.log(log);
                res.json(resp);
                //console.log('Inside one user js');
            }
        });
    }
};

// User add

exports.add = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;

    var resp = {
        status: false,
        type: 'oneuser.add',
        email: email,
        at_user_group: "",
        api_token: "",
        login_token: "",
        message: "",
        count: 0,
        data: []

    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'oneUserAdd',
        appluser: '',
        token: login_token,
        message: ''
    
      }
    console.log((login_token == undefined));
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email login token');
        res.json(resp);
    } else {
        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            console.log('after sql');
            if (results.length > 0) {
                var _logged = results[0].logged;
                var _login_token = results[0].login_token;

                console.log('Logged: ' + _logged);
                console.log((_logged === 'Y' && _login_token === login_token));
                if (_logged === 'Y' && _login_token === login_token) {
                    try {
                    _email = req.body.user_email;
                    _name = req.body.user_name;
                    _role = req.body.user_role;
                    _at_user_group = req.body.at_user_group;
                    //console.log("new password: "+req.body.user_password)
                    _pwd = cryptrClient.decrypt(req.body.user_password);
                    _password = cryptrServer.encrypt(_pwd);
                     _now = new Date();
                    } catch (ex) {
                        resp.status = false;
                        resp.message = "Data error: " + ex;
                        res.json(resp);
                        return;
                    }
                    var sql = "INSERT INTO users (name,email,password,user_role,at_user_group,created_at) values(?,?,?,?,?,?)";
                    connection.query(sql, [_name, _email,_password, _role,_at_user_group,_now], function (error, results, fields) {
                        if (error) {
                            resp.status = false;
                            resp.message = "User record add failed: " + error;
                            res.json(resp);
                        } else {
                            console.log(results.affectedRows + " record(s) updated - User add");
                            resp.status = true;
                            var now = new Date();
                            log.datetime=now;
                            
                            log.message = "oneUser add successfull";
                            lg.log(log);
                            resp.message = "user add successfull"
                            res.json(resp);
                        }
                    });
                } else {
                    resp.message = "User not authorised ";
                    var now = new Date();
                    log.datetime=now;
                            
                    log.message = "Failed: User not authorised";
                    lg.log(log);
                    res.json(resp);
                    console.log('Inside one user js');

                }
            }else {
                resp.message = "User session not valid ";
                var now = new Date();
                    log.datetime=now;
                            
                    log.message = "Failed: session not valid";
                    lg.log(log);
                res.json(resp);
                //console.log('Inside one user js');
            }
        });
    }
};

// User delete

exports.delete = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;

    var resp = {
        status: false,
        type: 'oneuser.delete',
        email: email,
        api_token: "",
        login_token: "",
        message: "",
        count: 0,
        data: []

    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'oneUserDelete',
        appluser: '',
        token: login_token,
        message: ''
    
      }
    console.log((login_token == undefined));
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email login token');
        res.json(resp);
    } else {
        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            console.log('after sql');
            if (results.length > 0) {
                var _logged = results[0].logged;
                var _login_token = results[0].login_token;
               
                console.log('Logged: ' + _logged);
                console.log((_logged === 'Y' && _login_token === login_token));
                if (_logged === 'Y' && _login_token === login_token) {
                    var _email = req.body.user_email;
                    var sql = "DELETE FROM users WHERE email=?";
                    connection.query(sql, [_email], function (error, results, fields) {
                        if (error) {
                            resp.status = false;
                            resp.message = "User record delete failed: " + error;
                            res.json(resp);
                        } else {
                            console.log(results.affectedRows + " record(s) updated - User delete");
                            var now = new Date();
                            log.datetime=now;
                            
                            log.message = "oneUser delete successfull";
                            lg.log(log);
                            resp.status = true;
                            resp.message = "user delete successfull"
                            res.json(resp);
                        }
                    });
                } else {
                    resp.message = "User not authorised ";
                    var now = new Date();
                    log.datetime=now;
                            
                    log.message = "Failed: User not authorised";
                    lg.log(log);
                    res.json(resp);
                    console.log('Inside one user js');

                }
            } else {
                resp.message = "User session not active ";
                var now = new Date();
                log.datetime=now;
                        
                log.message = "Failed: session not active";
                lg.log(log);
                res.json(resp);
                //console.log('Inside one user js');
            }
        });
    }
};
