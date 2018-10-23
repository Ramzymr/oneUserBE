var connection = require('./../config');
var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');


module.exports.atuser = function (req, res) {

    var email = req.body.email;
    var login_token = req.body.login_token;
    //var atuser_type = req.body.atuser_type;
    console.log('AT users: ');
    console.log('email: ' + email);
    console.log('login_token: ' + login_token);
    var resp= {
        status: false,
        email: email,
        type: 'atuser',
        message: "",
        users: []
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
                console.log((_logged === 'Y' && _login_token===login_token));
                if (_logged === 'Y' && _login_token===login_token) {
                    // Get logged in AT users from atusers table
                    connection.query('SELECT * FROM autotask WHERE at_used = ?', ['Y'], function (error, results, fields) {
                        if (error) {
                            resp.message("Error in query");
                            res.json(resp);
                        } else {
                            if (results.length > 0) {
                                for (i = 0; i < results.length; i++) {
                                    var x= {}
                                    //x.user = results[i].at_user;
                                    x.user = results[i].at_usedby;
                                    x.group = results[i].at_group;
                                    x.from = results[i].at_from;
                                    console.log(x);
                                    resp.users.push(x);

                                }
                                resp.status = true;
                                resp.message=results.length+ ' user(s) are using';
                                res.json(resp);
                            } else {
                                resp.status = true;
                                resp.message="No logged in users found";
                                res.json(resp); 
                            }
                        }


                    });
                    
                } else
                {
                    resp.message = "Unable to validate user session";
                    res.json(resp);
                }
            } 
            else {
                resp.message = "Unable to validate user";
            }
        });
    }
}