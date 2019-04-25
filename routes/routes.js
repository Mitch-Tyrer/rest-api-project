const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const Course = require('../models/models').Course;
const User = require('../models/models').User;

const authenticateUser = async (req, res, next) => {
    let message = null;
    const credentials = auth(req);
    if (credentials) {
        const user = await User.findOne({ emailAddress: credentials.name });
        if (user) {
            const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
            if (authenticated) {
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${user.emailAddress}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }
    if (message) {
        console.warn(message);
        res.status(401).json({ message: "Access Denied" });
    } else {
        next();
    }

}

router.param("id", function (req, res, next, id) {
    Course.findById(id).populate('user', 'firstName lastName').exec(function (err, doc) {
        if (err) return next(err);
        if (!doc) {
            err = new Error("Not Found");
            err.status = 404;
            return next(err);
        }
        req.course = doc;
        return next();
    });
});//end id parameter

router.get('/users', authenticateUser, (req, res, next) => {
    User.find({})
        .exec(function (err, user) {
            if (err) return next(err);
            res.status(200);
            res.json(req.currentUser);
        });
}); //end users get route

router.post('/users', [
    check('firstName').exists({ checkNull: true, checkFalsy: true }).withMessage('Please provide a value for first name'),
    check('lastName').exists({ checkNull: true, checkFalsy: true }).withMessage('Please provide a last name.'),
    check('emailAddress').exists({ checkNull: true, checkFalsy: true }).withMessage('Please provide an email address.'),
    check('password').exists({ checkNull: true, checkFalsy: true }).withMessage('Please provide a password.')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({ error: errorMessages });
    }
    let user = new User(req.body);
    user.password = bcryptjs.hashSync(user.password);
    user.save(function (err, user) {
        if (err) return next(err);
        res.location('/');
        res.sendStatus(201);
    });
}); //end user post route

router.get('/courses', (req, res, next) => {
    Course.find({}).populate('user', 'firstName lastName')
        .exec(function (err, course) {
            if (err) return next(err);
            res.status(200);
            res.json(course);
        });

    // Course.find({}, function(err, course){
    //     if(err) return next(err);
    //     res.status(200);
    //     res.json(course);
    // });

}); // end course get route

router.get('/courses/:id', (req, res, next) => {
    res.json(req.course);
}); //end specific course route

router.post('/courses', authenticateUser, [
    check('title').exists({ checkNull: true, checkFalsy: true }).withMessage('Please provide a course title.'),
    check('description').exists({ checkNull: true, checkFalsy: true }).withMessage('Please provide a description')
], (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return res.status(400).json({ error: errorMessages });
    }

    let user = req.currentUser;

    let course = new Course({
        user: user._id,
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded
    });
    course.save(function (err, course) {
        if (err) return next(err);
        res.location('/api/courses/' + course.id);
        res.sendStatus(201);
    });
}); //end course post route

router.put('/courses/:id', authenticateUser, (req, res, next) => {
    const currentUser = req.currentUser.id;
    const courseUser = req.course.user._id;

    if (currentUser == courseUser) {
        req.course.updateOne(req.body, function (err, result) {
            if (err) return next(err);
            res.location('/api/courses/' + req.course.id)
            res.status(204);
            res.json(result);
        });

    } else {
        const err = new Error("Access Denied");
        res.status(403);
        next(err);
    }

}); //end course update route

router.delete('/courses/:id', authenticateUser, (req, res, next) => {
    const currentUser = req.currentUser.id;
    const courseUser = req.course.user._id;

    if (currentUser == courseUser) {
        req.course.remove(function (err) {
            if (err) return next(err);
            res.status(204);
            res.json();
        });

    } else {
        const err = new Error("Access Denied");
        res.status(403);
        next(err);
    }
}); //end course delete route

module.exports = router;