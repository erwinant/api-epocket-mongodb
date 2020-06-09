const mongoose = require('mongoose')

const ProfileFieldSchema = new mongoose.Schema({}, {strict: false});
const ProfilesSchema = new mongoose.Schema({}, {strict: false});

var ProfileField = mongoose.model('ProfileField', ProfileFieldSchema,'profile_field');
var Profiles = mongoose.model('Profiles', ProfilesSchema,'profiles');
module.exports.ProfileField = ProfileField;
module.exports.Profiles = Profiles;