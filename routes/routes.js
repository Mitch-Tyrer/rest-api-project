const express = require('express');
const router = express.Router();

const Course = require('../models/models').Course;
const User = require('../models/models').User;

router.param("id", function(req, res, next, id){
    Course.findById(id, function(err, doc){
        if(err) return next(err);
        if(!doc){
            err = new Error ("Not Found");
            err.status = 404;
            return next(err);
        }
        req.course = doc;
        return next();
    }); 
});//end id parameter

router.get('/users', (req, res, next) => {
    User.find({})
    .exec(function(err, user){
        if(err) return next(err);
        res.status(200);
        res.json(user);
    });
}); //end users get route

router.post('/users', (req, res, next) => {
    let user = new User(req.body);
    user.save(function(err, user){
        if(err) return next(err);
        res.status(201);
        res.json(user);
    });
}); //end user post route

router.get('/courses', (req, res, next) => {
    Course.find({}, function(err, course){
        if(err) return next(err);
        res.status(200);
        res.json(course);
    });
}); // end course get route

router.get('/courses/:id', (req, res, next) => {
    res.json(req.course);
}); //end specific course route

router.post('/courses', (req, res, next) => {
    let course = new Course (req.body);
    console.log(req.body)
    course.save(function(err, course){
        if(err) return next(err);
        res.status(201);
        res.json(course);
    }); 
}); //end course post route

router.put('/courses/:id', (req, res, next) => {
    req.course.updateOne(req.body, function(err, result){
        if (err) return next(err);
        res.status(204);
        res.json(result);
    });
}); //end course update route

router.delete('/courses/:id', (req, res, next) => {
    req.course.remove(function(err){
            if(err) return next(err);
            res.status(204);
            res.json();
    })
}); //end course delete route

module.exports = router;