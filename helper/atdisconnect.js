var express = require("express");
//var moment = require("moment");
var connection = require('./../config');
var lg = require('./../helper/logging');
module.exports.atdisconnect = function () {
    console.log('at disconnect called:');
    var log = {
        email: '',
        application: 1,
        datetime: '',
        task: 'ATuserTimedOut',
        appuser: ''

    }
    console.log('Connection state:'+connection.state);
    //connection.ping(cb);
    var sql = "SELECT * FROM autotask";
    connection.query(sql, function (errAT, resultAT) {
        if (errAT) {
            console.log('SQL error AT:' + errAT);
        } else {
            console.log('autotask table read:' + resultAT.length);
            for (i = 0; i < resultAT.length; i++) {
                if (resultAT[i].at_used == 'Y') {
                    current_email = resultAT[i].at_usedby;
                    appl_user = resultAT[i].at_user;
                    console.log('CUrrent user: ' + current_email);
                    var sql = "SELECT * FROM heart_beat where hb_email=?";
                    connection.query(sql, [current_email], function (errHB, resultHB) {
                        if (errHB) {
                            console.log('ATDISCONNECT:SQL error:' + err);
                        } else {


                            if (resultHB.length > 0) {
                                var dt = resultHB[resultHB.length - 1].hb_datetime;
                                console.log('Last heartbeat time: ' + dt);
                                var now = new Date();
                                var diff = Math.floor((((now.getTime() - dt.getTime()) / 1000) / 60));

                                console.log('Now: ' + now);
                                console.log('diff: ' + diff);
                                if (diff > 5) {
                                    // remove session
                                    var sql = "UPDATE autotask SET at_used=?, at_usedby=? WHERE at_usedby = ?";
                                    connection.query(sql, [' ', ' ', current_email], function (err, result) {
                                        if (err) {
                                            //resp.status = false;
                                            //resp.message = 'Error while updating..:' + err;
                                            //res.json(resp);
                                            console.log('Error while removing AT session..:' + err);
                                        } else {

                                            console.log(result.affectedRows + " record(s) updated for autotask tomed out");
                                            var now = new Date();
                                            log.datetime = now;
                                            log.email = current_email;
                                            log.appluser = appl_user;
                                            lg.log(log);
                                            //res.json(resp);
                                        }
                                    });

                                }
                            }
                        }
                    });
                }
            }

        }
        
    });


}