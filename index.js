require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
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
// app.use(morgan('tiny',':method :url :status :res[content-length] - :response-time ms'))
app.use(morgan('request-data'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request,response) => {
    response.send('<h1>Welcome to Phonebook App</h1>')
})

app.get('/info', (request,response) => {
    let entries = persons.length
    let currentDate = new Date().toDateString()
    let currentTime = new Date().toTimeString()
    response.send(`<div>Phonebook has info for ${entries} entries<br/><br/>${currentDate} ${currentTime}`)
})

app.get('/api/persons', (request,response) => {
    Person.find({}).then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request,response) => {
  Person.findById(request.params.id)
    .then(person => response.json(person))
    .catch(error => response.status(404).json({
      error: 'id not found'
    }))
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const getRandomId = (max) => {
  return Math.floor(Math.random() * max)
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'name and number required. Either one or both missing'
    })
  } else
  {
    if (persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())) {
      return response.status(400).json({
        error: 'name must be unique'
      })
    }
  }

  const person = {...body, "id": getRandomId(100)}

  persons = persons.concat(person)
  return response.json(person)
})

const PORT= process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})