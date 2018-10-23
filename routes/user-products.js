var connection = require('./../config');

var sv = require('./../helper/sessionValidator');

exports.list = function (req, res) {
    var email = req.body.email;
    var login_token = req.body.login_token;
    var user_email = req.body.user_email;
    var resp = {
        status: false,
        type: 'user-product.list',
        email: email,
        api_token: "",
        login_token: "",
        message: "",
        count: 0,
        data: []

    }
    var isValid = sv.isValidSession(email, login_token, function (result) {
        if (result.status == true) { 



            
        } else 
        {
            resp.status = false;
            resp.message = 'Not a valid session'
            res.json(resp);
        }



    });
}


exports.save = function (req, res) {






}