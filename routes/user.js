const express = require('express')
const router = express.Router()
const User = require('../models/user')
var jwt = require("jsonwebtoken")
const ErrorResponse = require('../helper/ErrorResponse')

// GET route for reading data
router.get('/', (req, res, next) => {
    User.find(req.query)
})

router.post('/login', (req, res, next) => {
    if (req.body.userName && req.body.password) {
        User.authenticate(req.body.userName, req.body.password, (err, user) => {
            if (err) {
                return next(err)
            }
            req.session.userId = user._id
            let token = jwt.sign(
                { userName: user.userName, email: user.email, role:user.role },
                process.env.SECRET_KEY_JWT,
                {
                    expiresIn: +process.env.EXPIRED_TIME_JWT // expires in 1 week
                }
            )
            res.send({
                role:user.role,
                auth: true,
                userName: user.email,
                token: token,
                expiresIn: +process.env.EXPIRED_TIME_JWT
            })
        })
    }
})


//POST route for updating data
router.post('/register', (req, res, next) => {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        return next(ErrorResponse.create('Unmatch password & confirmation', 400))
    }

    if (req.body.email &&
        req.body.userName &&
        req.body.password &&
        req.body.passwordConf) {
        let userData = {
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password
        }
        User.create(userData).then(user => {
            req.session.userId = user._id;
            res.send(user);
        }).catch(err => {
            next(ErrorResponse.create(err, 500));
        });
    } else {
        next(ErrorResponse.create('Fields required', 400))
    }
})

// // GET route after registering
// router.get('/profile', function (req, res, next) {
//     User.findById(req.session.userId)
//         .then(user => {
//             if (user === null) {
//                 return next(new Error('Not authorized! Go back!'));
//             } else {
//                 return res.send('<h1>Name: </h1>' + user.userName + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
//             }

//         }).catch(err => {
//             return next(new Error('Internal server error!'));
//         });
// });

router.post("/validate_token", function (req, res, next) {
    let currentTimestamp = + Math.round(new Date().getTime() / 1000);
    jwt.verify(req.headers["authorization"], process.env.SECRET_KEY_JWT, (err, decoded) => {
        if (err) {
            return next(ErrorResponse.create('Invalid token', 403))
        } else {
            res.send({
                role:decoded.role,
                auth: true,
                userName: decoded.userName,
                token: req.headers["authorization"],
                expiresIn: decoded.exp - currentTimestamp
            })
        }
    });
});

// GET for logout logout
router.get('/logout', (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;