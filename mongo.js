const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('password required as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = 
`mongodb+srv://fullstack:${password}@fullstackopen.skrakrw.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema(
    {
        name: String,
        number: String
    }
)

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person.find({}).then (result => {
        console.log('phonebook:')
        result.forEach(person => console.log(person.name, person.number))
        mongoose.connection.close()
    })
} else
{
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    
    person.save().then(result => {
        console.log(`Added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
}

