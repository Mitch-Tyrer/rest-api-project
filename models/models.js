const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const emailRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    emailAddress: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "Please Enter a Valid Email"],
        match: emailRegEx,
        index: true
    },
    password: String
});

UserSchema.plugin(uniqueValidator, {message: "Email is already in use"})

const CourseSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    title: String,
    description: String,
    estimatedTime: String,
    materialsNeeded: String
});

const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);


module.exports = { User, Course };