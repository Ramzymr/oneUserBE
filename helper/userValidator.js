var express = require("express");
var Cryptr = require('cryptr');

cryptrClient = new Cryptr('h#S&AFz4S89g=XWbvPyj^2&pJsMWd^T&');
cryptrServer = new Cryptr('pwHOu19dP4o9ZX6E8lSCzMg0wgnboVRy');
var connection = require('./../config');

module.exports.isValidUser = function (email, password,cb) {
    var returnValue =  {
        status: false,
        message: "",
        role : "",
        user : ""

    }
    console.log('inside user validator: '+ returnValue.status)
    console.log("User :" +email);
    console.log("pwd: "+password);
    if ((email === undefined) || (password === undefined)) {
        //resp.message = 'email or password undefined';
        console.log('undefined email login token');
        returnValue.status = false;
        returnValue.message = "email or password undefined";
        cb(returnValue);
    } else {

        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            console.log('after sql: email=' + email+"- "+results.length);
            if (results.length > 0) {
                var _logged = results[0].logged;
                var _password = results[0].password;
                _user_password = cryptrServer.encrypt(password);
                _db_dercypted_password=cryptrServer.decrypt(_password);
                console.log('raw password: ' + password);
                console.log("Encrypted server pwd:"+_user_password);
                console.log("DB pwd:"+_password);
                console.log("DB decrypted pwd:"+cryptrServer.decrypt(_password));
                if (password === _db_dercypted_password ) {
                    returnValue.status = true;
                    returnValue.message = "Valid user";
                    returnValue.user =  results[0].name;
                    returnValue.role = results[0].user_role;
                    console.log(JSON.stringify(returnValue));
                    cb(returnValue);
                } else {
                    returnValue.status = false;
                    returnValue.message = "Invalid user and/or password";
                    cb(returnValue);
                }
            } else {
                returnValue.status = false;
                returnValue.message = "Invalid user and/or password";
                cb(returnValue);
            }
        });
    }


}