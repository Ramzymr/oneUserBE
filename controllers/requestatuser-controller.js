var connection = require('./../config');
var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');
var lg = require('./../helper/logging');
var sv = require('./../helper/sessionValidator');

module.exports.requestatuser = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    var user_type = req.body.user_type;
    console.log('AT users: ');
    console.log('email: ' + email);
    console.log('login_token: ' + login_token);
    console.log('User type:' + user_type);
    var resp = {
        status: false,
        type: 'requestatuser',
        email: email,
        message: "",
        user: []
    }
    var log = {
        email: email,
        application: 1,
        datetime: '',
        task: 'ATuserSignOn',
        appluser: '',
        token: '',
        message: ''

    }
    if ((email === undefined) || (login_token === undefined) || (user_type === undefined)) {
        resp.message = 'email or login token or user type undefined';
        console.log('undefined email login token');
        res.json(resp);
    } else {
        var isValid = sv.isValidSession(email, login_token, function (result) {
            console.log('isValid:' + result.message)
            if (result.status == true) {
                connection.query('SELECT * FROM `autotask` WHERE at_usedby=?', [email], function (error, results, fields) {
                    if (error) {
                        resp.message = "Error in query: " + error;
                        res.json(resp);
                    } else {
                        if (results.length == 0) {
                            connection.query('SELECT * FROM `autotask` WHERE not (at_used=?) and at_group=?', ['Y', user_type], function (error, results, fields) {
                                if (error) {
                                    resp.message = "Error in query: " + error;
                                    res.json(resp);
                                } else {
                                    if (results.length > 0) {
                                        var x = {}
                                        x.user = results[0].at_user;
                                        x.group = results[0].at_group;
                                        x.password = results[0].at_password;
                                        console.log(x);
                                        resp.user.push(x);
                                        resp.status = true;
                                        resp.message = 'User available';
                                        var now = new Date();
                                        console.log('Now:' + now);
                                        var sql = "UPDATE autotask SET at_used=?, at_usedby=?, at_from=? WHERE at_user = ?";
                                        connection.query(sql, ['Y', email, now, x.user], function (err, result) {
                                            if (err) throw err;
                                            var now = new Date();
                                            log.datetime = now;
                                            log.message = "Successful,"+user_type;
                                            log.appluser = x.user;
                                            log.token = login_token;
                                            lg.log(log);
                                            console.log(result.affectedRows + " record(s) updated");

                                        });
                                        res.json(resp);

                                    } else {
                                        var now = new Date();
                                        log.datetime = now;
                                        log.message = "Failed: No available AT users found for type " + user_type;
                                        log.appluser = x.user;
                                        log.token = login_token;
                                        lg.log(log);
                                        resp.status = false;
                                        resp.message = 'No available users found';
                                        res.json(resp);
                                    }
                                }

                            });
                        } else {
                            resp.status = false;
                            var now = new Date();
                            log.datetime = now;
                            log.message = "Failed: Alreday using an AT user";
                            log.appluser = results[0].at_user;
                            log.token = login_token;
                            lg.log(log);
                            resp.message = 'Alreday using an AT user';
                            res.json(resp);
                        }
                    }
                });
            } else {
                resp.status = false;
                var now = new Date();
                log.datetime = now;
                log.message = "Failed: Not having a valid session";
                log.appluser = '';
                log.token = login_token;
                lg.log(log);
                resp.message = 'Not a valid session'
                res.json(resp);
            }



        });
    }
}