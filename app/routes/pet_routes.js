// import our dependecies, middleware and models 
const express = require('express')
const passport = require('passport')

// pull in our model
const Pet = require('../models/pet')

// helps us detect certain situations and send custom errors
const customErrors = require('../../lib/custom_errors')
// this function sends a 404 when non-existent document is requested
const handle404 = customErrors.handle404
// middleware that can send a 401 when a user tries to access something they do not own
const requireOwnership = customErrors.requireOwnership
// requireToken is passed as a second arg to router.<verb> 
// makes it so that a token MUST be passed for that route to be available --> also sets 'req.user'
const requireToken = passport.authenticate('bearer', { session: false })
// this middleware removes any blank fields from req.body
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiate our router
const router = express.Router()

// ROUTES GO HERE

// INDEX
// GET /pets
router.get('/pets', (req, res, next) => {
    // we will allow access to view all the pets, by skipping 'requireToken'
    // if we wanted to make this a protected resource, we'd just need to add that middleware as the second arg to our get(like we did in create for our post)
    Pet.find()
        .populate('owner')
        .then(pets => {
            // pets will be an array of mongoose documents
            // so we want to turn them into POJO (plain ol' js objects)
            // remember that map returns a new array
            return pets.map(pet => pet.toObject())
        })
        .then(pets => res.status(200).json({ pets }))
        .catch(next)
})
// SHOW
// GET /pets/624470c12ed7079ead53d4df
router.get('/pets/:id', (req, res, next) => {
    // we get the id from req.params.id -> :id
    Pet.findById(req.params.id)
        .populate('owner')
        .then(handle404)
        // if its successful, respond with an object as json
        .then(pet => res.status(200).json({ pet: pet.toObject() }))
        // otherwise pass to error handler
        .catch(next)
})


// CREATE
// POST /pets
router.post('/pets', requireToken, (req, res, next) => {
    // we brought in requireToken, so we can have access to req.user
    req.body.pet.owner = req.user.id

    Pet.create(req.body.pet)
        .then(pet => {
            // send a successful response like this
            res.status(201).json({ pet: pet.toObject() })
        })
        // if an error occurs, pass it to the error handler
        .catch(next)
})

// UPDATE
// PATCH /pets/624470c12ed7079ead53d4df
router.patch('/pets/:id', requireToken, removeBlanks, (req, res, next) => {
    // if the client attempts to change the owner of the pet, we can disallow that from the getgo
    delete req.body.owner
    // then we find the pet by the id
    Pet.findById(req.params.id)
    // handle our 404
        .then(handle404)
    // requireOwnership and update the pet
        .then(pet => {
            requireOwnership(req, pet)

            return pet.updateOne(req.body.pet)
        })
    // send a 204 no content if successful
        .then(() => res.sendStatus(204))
    // pass to errorhandler if not successful
        .catch(next)
})



// REMOVE
// DELETE /pets/624470c12ed7079ead53d4df
router.delete('/pets/:id', requireToken, (req, res, next) => {
    // then find the pet by id
    Pet.findById(req.params.id)
    // first handle the 404 if any
        .then(handle404)
    // use requireOwnership middleware to make sure the right person is making this request
        .then(pet => {
            // requireOwnership needs two arguments
            // these are the req, and the document itself
            requireOwnership(req, pet)
            // delete if the middleware doesnt throw an error
            pet.deleteOne()
        })
    // send back a 204 no content status
        .then(() => res.sendStatus(204))
    // if error occurs, pass to the handler
        .catch(next)
})

// ROUTES ABOVE HERE

// keep at bottom of file
module.exports = router