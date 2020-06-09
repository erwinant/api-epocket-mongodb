const express = require('express')
const router = express.Router()
const ProfileField = require('../models/profile').ProfileField
const Profiles = require('../models/profile').Profiles
const ErrorResponse = require('../helper/ErrorResponse')

const config = require('../config.json');

const environment = process.env.NODE_ENV || 'development';
const defaultConfig = config[process.env.NODE_ENV];

// GET route for reading data
router.get('/fieldgroup', (req, res, next) => {
    ProfileField.aggregate(
        [
            {
                '$group': {
                    '_id': '$section',
                    'value': {
                        '$push': '$$ROOT'
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'key': '$_id',
                    'value': 1
                }
            }
        ]
    ).then(p => {
        res.send(p)
    }).catch(err => {
        next(ErrorResponse.create(err, 500))
    })

})

router.get('/field', (req, res, next) => {
    ProfileField.find().then(p => {
        res.send(p)
    }).catch(err => {
        next(ErrorResponse.create(err, 500))
    })

})

router.post('/', (req, res, next) => {
    let obj = req.body
    Profiles.update(
        { userName: obj.userName },
        { $set: obj },
        { upsert: true }
    ).then(p => {
        res.send(p)
    }).catch(err => {
        next(ErrorResponse.create(err, 500))
    })
})


router.get('/:userName', (req, res, next) => {
    Profiles.findOne({ userName: req.params.userName }).then(p => {
        res.send(p)
    }).catch(err => {
        next(ErrorResponse.create(err, 500))
    })
})

router.post("/upload/:userName", function (req, res, next) {
    let userName = req.params.userName;
    if (userName) {
        if (!req.files) next(ErrorResponse.create("No file", 400))
        const { uuid } = require('uuidv4');
        const path = require("path")
        let directory = path.join(__dirname, `../public/images/profile/${userName}/`)
        if (req.files[userName]) {
            try {
                let fs = require("fs");
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory);
                }
                let myfile = req.files[userName];
                let ftype = myfile.mimetype.split("/")[1];
                myfile.name = uuid() + "." + ftype;

                myfile.mv(directory + myfile.name, function (err) {
                    if (err) return res.status(500).send(err);
                    Profiles.update({ userName: userName }, { $set: { profilePic: myfile.name } }).then(up=>{
                        res.status(200).send({ filename: myfile.name });
                    }).catch(err => {
                        next(ErrorResponse.create(err, 500))
                    })
                });
            } catch (e) {
                next(ErrorResponse.create(e, 500))
            }
        }
    }
});
module.exports = router;