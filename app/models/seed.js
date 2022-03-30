// seed.js is going to be a script that we can run from the terminal to create a bunch of pets at once

// we'll need to be careful with the seed here, and when we run it because it will remove all the pets first, then add the new ones.

const mongoose = require('mongoose')
const Pet = require('./pet')

const db = require('../../config/db')

const startPets = [
    { name: 'Sparky', type: 'dog', age: 2, adoptable: true },
    { name: 'Leroy', type: 'dog', age: 10, adoptable: true },
    { name: 'Biscuits', type: 'cat', age: 3, adoptable: true },
    { name: 'Hulk Hogan', type: 'hamster', age: 1, adoptable: true }
]

// first we connect to the db via mongoose
mongoose.connect(db, {
	useNewUrlParser: true,
})
    .then(() => {
        // then we remove all pets
        Pet.remove({})
            .then(deletedPets => {
                console.log('deleted pets', deletedPets)
                Pet.create(startPets)
                    .then(newPets => {
                        console.log('the new pets', newPets)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                mongoose.connection.close()
            })
    })
    // then at the end, close the database
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })
// then we create using the startPets array
