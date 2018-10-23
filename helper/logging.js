var express=require("express");

var connection = require('./../config');
module.exports.log=function(logObject){
    console.log('Log called:'+logObject.email);
    var email = logObject.email;
    var appl = logObject.application;
    var dt = logObject.datetime;
    var func = logObject.task;
    var applusr = logObject.appluser;
    var token =  logObject.token;
    var msg = logObject.message;
    if(appl == null || appl == undefined) {app=" "}
    if(dt == null || dt == undefined) {dt=" "}
    if(func == null || func == undefined) {func=" "}
    if(applusr == null || applusr == undefined) {applusr=" "}
    if(token == null || token == undefined) {token=" "}
    if(msg == null || msg == undefined) {msg=" "}
    var sql = "INSERT INTO logs (log_email,log_application,log_datetime,log_function,log_appluser,login_token,log_message) values (?,?,?,?,?,?,?)";
    connection.query(sql, [email,appl,dt,func,applusr,token,msg], function (err, result) {
        if (err) {
            console.log('Log write failed: '+err);
        } else {
            console.log('Log write successful');
        }
       
    });
}
