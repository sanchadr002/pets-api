// import our dependencies, middleware, models
const express = require('express')
const passport = require('passport')

// pull in model
const Pet = require('../models/pet')

// helps detect certain situations and send custom errors
const customErrors = require('../../lib/custom_errors')
// this function sends a 404 when a non-existent document is requested
const handle404 = customErrors.handle404
// middleware to send a 401 when a user tries to access something they do not own
const requireOwnership = customErrors.requireOwnership
// requireToken is passed as a second arg to router.<verb>
// makes it so that a token MUST be passed for that route to be available --> also sets 'req.user'
const requireToken = passport.authenticate('bearer', { session: false })
// this middlware removes any blank fields from req.body
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiate our router
const router = express.Router()

// ROUTES GO HERE

// INDEX
router.get('/pets', (req, res, next) => {
    // will will allow acces to view all the pets by skipping requireToken
    // if we wnted to make this a protected resource, we'd just need to add that middleware as the second arg to our get(like we did in create for our post)
    Pet.find()
    .populate('owner')
    .then(pets => {
        // pets will be an array of mongoose docs
        // so we want to turn them into POJO (plain old js objects)
        // remember that map returns a new array
        return pets.map(pet => pet.toObject())
    })
    .then(pets => res.status(200).json({ pets: pets }))
    .catch(next)
})
// SHOW
// GET
router.get('/pets/:id', (req, res, next) => {
    // we get the id from req.params.id -> :id
    Pet.findById(req.param.id)
        .populate('owner')
        .then(handle404)
        // then if successful, respond with object as json
        .then(pet => res.status(200).json({ pet: pet.toObject() }))
        // otherwise, pass to error handler
        .catch(next)
})

// CREATE
router.post('/pets', requireToken, (req, res, next) => {
    // we brought in requireToken so we can have access to req.user
    req.body.pet.owner = req.user.id

    Pet.create(req.body.pet)
        .then(pet => {
            // send a successful response like this
            res.status(201).json({ pet: pet.toObject() })
        })
        // if an error occurs, pass to the error handler
        .catch(next)
})
// UPDATE
// REMOVE
router.delete('/pets/:id', requireToken, (req, res, next) => {
    // find pet by id
    Pet.findById(req.params.id)
    // handle 404
        .then(handle404)
    // use requireOwnership middleware to make sure the right person is making this request
        .then(pet => {
            // requireOwnership needs two arguments
            // these are the req and the document
            requireOwnership(req, pet)
        })
    // send back 204 no content status
    // if error occurs, pass to handler
})

// ROUTES ABOVE HERE

// keep at bottom of file
module.export = router
