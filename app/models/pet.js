// PET -> has many toys & has owner that is user

const mongoose = require('mongoose')

const toySchema = require('./toy')

const { Schema, model } = mongoose

const petSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        adoptable: {
            type: Boolean,
            required: true
        },
        toys: [toySchema],
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }, {
        timestamps: true,
        // we're going to add virtuals to our model
        // these lines ensure that the virtual will be included
        // whenever we turn our document to an object or JSON
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

// a virtual is a virtual property that uses the data that's saved in the database to add a property whenever we retreive that document and convert to an object
petSchema.virtual('fullTitle').get(function(){
    // we can do whatever JS things we want in here
    // we just need to make sure we return some value
    // fullTitle is going to combine the name and type to build a title
    return `${this.name} the ${this.type}`
})

module.exports = model('Pet', petSchema)