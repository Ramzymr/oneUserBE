var express = require("express");

var connection = require('./../config');
module.exports.isValidSession = function (email, login_token,cb) {
    var returnValue =  {
        status: false,
        message: ""

    }
    console.log('inside session validator: '+ returnValue.status)
    if ((email === undefined) || (login_token === undefined)) {
        resp.message = 'email or login token undefined';
        console.log('undefined email login token');
        returnValue.status = false;
        returnValue.message = "email or login token undefined";
        return returnValue;
    } else {

        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            console.log('after sql: emai=' + email+"- "+results.length);
            if (results.length > 0) {
                var _logged = results[0].logged;
                var _login_token = results[0].login_token;

                console.log('Logged: ' + _logged);
                console.log((_logged === 'Y' && _login_token === login_token));
                if (_logged === 'Y' && _login_token === login_token) {
                    returnValue.status = true;
                    returnValue.message = "Session is valid";
                    console.log(JSON.stringify(returnValue));
                    cb(returnValue);
                } else {
                    returnValue.status = false;
                    returnValue.message = "Session is invalid, user not logged in";
                    cb(returnValue);
                }
            } else {
                returnValue.status = false;
                returnValue.message = "Session is invalid, user not found";
                cb(returnValue);
            }
        });
    }


}
