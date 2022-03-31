// import our dependecies, middleware and models 
const express = require('express')
const passport = require('passport')
const Pet = require('../models/pet')
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate('bearer', { session: false })
const removeBlanks = require('../../lib/remove_blank_fields')

const router = express.Router()

// ROUTES GO HERE

// POST -> create a toy
// POST /toys/<pet_id>
router.post('/toys/:petId', removeBlanks, (req, res, next) => {
    // get our toy from req.body
    const toy = req.body.toy
    // get our petId from req.params.id
    const petId = req.params.petId
    // find the pet
    Pet.findById(petId)
        // handle what happens if no pet is found
        .then(handle404)
        .then(pet => {
            console.log('this is the pet', pet)
            console.log('this is the toy', toy)
            // push the toy to the toys array
            pet.toys.push(toy)

            // save the pet
            return pet.save()
        })
        // then we send the pet as json
        .then(pet => res.status(201).json({ pet: pet }))
        // catch errors and send to the handler
        .catch(next)
})

// UPDATE
// PATCH /toys/<pet_id>/<toy_id>
router.patch('/toys/:petId/:toyId', requireToken, removeBlanks, (req, res, next) => {
    const toyId = req.params.toyId
    const petId = req.params.petId

    Pet.findById(petId)
        .then(handle404)
        .then(pet => {
            const theToy = pet.toys.id(toyId)
            console.log('this is the original toy', theToy)
            requireOwnership(req, pet)

            theToy.set(req.body.toy)

            return pet.save()
        })
        // .then(data => {
        //     const { theToy, pet } = data
        //     // console.log('this is data in update', data)
        //     console.log('this is the toy in req.body', req.body.toy)
        //     console.log('type from req.body', typeof req.body.toy.isSqueaky)
        //     console.log('theToy', theToy)
        //     console.log('pet', pet)
        //     theToy.name = req.body.toy.name
        //     theToy.description = req.body.toy.description
        //     if (req.body.toy.isSqueaky) {
        //         theToy.isSqueaky = true
        //     } else {
        //         theToy.isSqueaky = false
        //     }
        //     theToy.condition = req.body.toy.condition
            
        //     // theToy.set({ toy: req.body.toy })
        //     console.log('theToy after updating', theToy)

        //     return pet.save()
        // })
        .then(() => res.sendStatus(204))
        .catch(next)


})


// DELETE -> delete a toy
// DELETE /toys/<pet_id>/<toy_id>
router.delete('/toys/:petId/:toyId', requireToken, (req, res, next) => {
    // saving both ids to variables for easy ref later
    const toyId = req.params.toyId
    const petId = req.params.petId
    // find the pet in the db
    Pet.findById(petId)
        // if pet not found throw 404
        .then(handle404)
        .then(pet => {
            // get the specific subdocument by its id
            const theToy = pet.toys.id(toyId)
            // require that the deleter is the owner of the pet
            requireOwnership(req, pet)
            // call remove on the toy we got on the line above requireOwnership
            theToy.remove()

            // return the saved pet
            return pet.save()
        })
        // send 204 no content
        .then(() => res.sendStatus(204))
        .catch(next)
})

module.exports = router