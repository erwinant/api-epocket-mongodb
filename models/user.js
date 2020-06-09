const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const ErrorResponse = require('../helper/ErrorResponse')

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    fullName: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        required: false,
        default: true
    },
    deleted: {
        type: Boolean,
        required: false,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: false
    },
    createdBy: {
        type: String,
        required: false
    },
    updatedBy: {
        type: String,
        required: false
    }
});

//authenticate input against database
UserSchema.statics.authenticate = async (userName, password, callback) => {
    await User.findOne({ userName: userName })
        .then(user => {
            if (!user) {
                callback(ErrorResponse.create('Unknown username or password.', 403));
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    callback(null, user);
                } else {
                    callback(ErrorResponse.create('Unknown username or password.', 403));
                }
            })
        }).catch(err => {
            callback(ErrorResponse.create(err));
        });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;