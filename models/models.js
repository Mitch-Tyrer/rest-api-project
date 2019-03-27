const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const emailRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    emailAddress: {
        type: String,
        match: emailRegEx,
        validate: {
            validator: (email) => {
                User.findOne({emailAddress: email})
                .then(data => {
                    if(data) {
                        return false;
                    } else {
                        return true;
                    }
                })
                .catch(err)
            },
        message: 'Email already in use.'
        }
    },
    password: String
});

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