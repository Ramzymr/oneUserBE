var connection = require('./../config');

module.exports.atheartbeat = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    var product_id = req.body.product_id;

    var resp = {
        status: false,
        type: 'heartbeat',
        email: email,
        message: ""


    }
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email login token');
        res.json(resp);
    } else {
        var now = new Date();
        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            if (error) {
                console.log('error');
                resp.message = "SQL Query failed: " + error;
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
                                resp.message("Error in query: " + error);
                                res.json(resp);
                            } else {
                                if (results.length > 0) {
                                    if (results[0].at_used == 'Y') {
                                        console.log("Autotask used: " + results[0].at_usedby);
                                        var sql = "select * from autotask WHERE at_usedby = ?";
                                        connection.query(sql, [email], function (err, result) {
                                            if (err) {
                                                resp.status = false;
                                                resp.message = 'Error in query: ' + err;
                                                res.json(resp);
                                            } else {
                                                console.log("Write heartbeat table...");
                                                var sql = "select * from heart_beat WHERE hb_email = ? AND hb_login_token=?";
                                                connection.query(sql, [email, _login_token], function (err, result) {
                                                    if (err) {
                                                        resp.status = false;
                                                        resp.message = 'Update heartbeat failed: ' + error;
                                                        res.json(resp);
                                                    } else {
                                                        if(result.length > 0) {
                                                            var now = new Date();
                                                            var sql = "UPDATE heart_beat SET hb_datetime=? where hb_email = ? AND hb_login_token=?";
                                                            connection.query(sql, [now,email, _login_token], function (err, result) {
                                                                if(err) {
                                                                    resp.status = false;
                                                                    resp.message = 'Update heartbeat failed: ' + error;
                                                                    res.json(resp);
                                                                }else {
                                                                    resp.status = true;
                                                                    resp.message = 'Update heartbeat succssful at: '+now;
                                                                    res.json(resp);
                                                                }
                                                            });
                                                            // have record, update
                                                        } else {
                                                            // No records, insert
                                                        var now = new Date();
                                                        resp.message = "AT user hearbeat successful at: " + now;
                                                        connection.query('INSERT INTO heart_beat (hb_login_token,hb_datetime,hb_email) values(?,?,?)', [login_token, now, email], function (error, results, fields) {
                                                            if (error) {
                                                                resp.status = false;
                                                                resp.message = 'Update heartbeat failed: ' + error;
                                                                res.json(resp);
                                                            } else {
                                                                resp.status = true;
                                                                res.json(resp);
                                                            }
                                                        
                                                        });
                                                    }
                                                    }
                                                });
                                                //res.json(resp);
                                            }
                                        });

                                    } else {

                                        status = false;
                                        resp.message = "No users found";
                                        res.json(resp);
                                    }
                                } else {
                                    status = false;
                                    resp.message = "No users found";
                                    res.json(resp);
                                }
                            }

                        })

                    } else {

                        console.log("Not logged");

                        resp.message = 'Not logged in or invalid token';
                        console.log(resp);
                        res.json(resp);
                    }

                } else {

                    console.log('not logged');
                    resp.message = "Unable to locate user";
                    res.json(resp);
                }

            }
        });

    }




};


