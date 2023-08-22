require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { default: mongoose } = require('mongoose')
const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
morgan.token('request-data', function getRequestData(tokens, req, res) {
  let data = ''
  if (req.method === 'POST') data=JSON.stringify(req.body)
  return [
    req.method,
    req.url,
    req.status,
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    data
  ].join(' ')
})

app.use(morgan('request-data'))

let persons = []

app.get('/', (request,response) => {
    response.send('<h1>Welcome to Phonebook App</h1>')
})

app.get('/info', (request,response) => {
    let entries = persons.length
    let currentDate = new Date().toDateString()
    let currentTime = new Date().toTimeString()
    response.send(`<div>Phonebook has info for ${entries} entries<br/><br/>${currentDate} ${currentTime}`)
})

app.get('/api/persons', (request,response, next) => {
    Person.find({}).then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request,response, next) => {
  Person.findById(request.params.id)
    .then( person => {
      if (person) {
        person => response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'name and number required. Either one or both missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => response.json(savedPerson))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndPoint = (request, response) => {
  response.status(404).send({error: "Unknown Endpoint"})
}

app.use(unknownEndPoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted Id'})
  }

  next(error)
}

app.use(errorHandler)

const PORT= process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})