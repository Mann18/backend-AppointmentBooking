const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const citizenSchema = new Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email : {
        type: String
    },
    name: {
        type: String
    },
    picture: {
        type: String
    },
    phoneNumber: {
        type: String
    }
});

const Citizen = mongoose.model('Citizen', citizenSchema);

module.exports = Citizen;