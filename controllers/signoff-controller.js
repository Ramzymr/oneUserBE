var connection = require('./../config');
var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');
const jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var lg = require('./../helper/logging');

module.exports.signoff = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    console.log('email: ' + email);
    console.log('login_token: ' + login_token);
    var resp= {
        status: false,
        type: 'signoff',
        email:email,
        message: ""
    }
    var log = {
        email: email,
        application: 0,
        datetime: '',
        task: 'SignOff',
        appluser: '',
        token: '',
        message: ''
    
      }
    console.log((email === undefined) || (login_token === undefined));
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email login token');
        res.json(resp);
    } else {


        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            console.log('after sql');
            if (error) {
                //res.json({
                // status:false,
                // message:'there are some error with query',
                //error: error
                // })
                console.log('error');
                resp.message = "Failed: ";
                res.json(resp);
            } else {
                if (results.length > 0) {
                    console.log(results[0]);
                    var _logged = results[0].logged;
                    var _login_token = results[0].login_token;
                    console.log('Logged: ' + _logged);
                    console.log((_logged === 'Y' && _login_token===login_token));
                    if (_logged === 'Y' && _login_token===login_token) {
                        //Flag to log off
                        var sql = "UPDATE users SET logged=?, api_token=?, login_token=? WHERE email = ?";
                        connection.query(sql, ['', '', '',email], function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " record(s) updated");
                            resp.status = true;
                            resp.message = 'Logged off successfuly';
                            var now = new Date();
                            log.datetime=now;
                            log.message = "Successful";
                            log.token = _login_token;
                            lg.log(log);
                            res.json(resp);
                        });
                    }
                    else {
                        console.log("Not logged");
                        var now = new Date();
                            log.datetime=now;
                            log.message = "Not logged in or invalid token";
                            log.token = _login_token;
                            lg.log(log);
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
    
}