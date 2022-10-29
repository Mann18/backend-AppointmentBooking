const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedback = new Schema({
    given : {
        type : Boolean,
        default : false
    },
    stars : {
        type : Number,
        default : 0,
        min : 0,
        max : 5
    },
    title : {
        type : String,
        default : ""
    },
    review : {
        type : String,
        default : ""
    }
})

const appointmentSchema = new Schema({
    officerId : {
        required: true,
        type: String
    },
    dateId : {
        required: true,
        type: String
    },
    slotId : {
        required: true,
        type: String
    },
    citizenId : {
        required: true,
        type: String
    },
    date : {
        type: String
    },
    slotTime : {
        type: String
    },
    officerName : {
        type : String
    },
    officerEmail : {
        type : String
    },
    citizenName : {
        type : String
    },
    googleMeetLink : {
        type : String
    },
    feedback : feedback
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
const Feedback = mongoose.model('Feedback', feedback);

module.exports = { Appointment,  Feedback };