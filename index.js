const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors');

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
morgan.token('req-body', (req, res) => {
    return JSON.stringify(req.body);
  });
  
  
  const logPostRequest = (req, res, next) => {
    if (req.method === 'POST') {
      return morgan(':method :url :status :res[content-length] - :response-time ms :req-body')(req,res,next);
    }
    next();
  };

  app.use(cors({origin:"http://localhost:5173"}));


app.use(logPostRequest)
// app.use(morgan('tiny'))

app.use(express.json())

app.post('/api/persons',(req,res)=>{
    
    const id = Math.floor(Math.random()*1000); 
    const body = req.body


    if (!body.number) {
    return res.status(400).json({ 
      error: 'number is missing' 
    })
     }
    if (!body.name) {
        return res.status(400).json({ 
            error: 'name is missing' 
          })
    }
    if (persons.find(prs=> prs.name === body.name )){
        return res.status(400).json({ 
            error: 'The name already exists in the phonebook' 
          })
    }

  const person = {
    id: id,
    name: body.name,
    number:body.number ? body.number : "",
  }

  persons = persons.concat(person)

  res.json(person);

})


app.get('/api/persons',(req,res)=>{
    res.json(persons)
})

app.get('/api/info',(req,res)=>{
    const length = persons.length;
    const time = new Date(Date.now());
    
    res.send(`<p>Phonebook has info for ${length} people</p><p>${time}</p>`)
})

app.get('/api/persons/:id',(req,res)=>{
    const id = Number(req.params.id);
    if (id) {
        res.send(persons.find(prs=>prs.id === id));
    }
    else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id',(req,res)=>{
    const id = Number(req.params.id);
    if (id) {
        res.send(persons.filter(prs=>prs.id !== id));
    }
    else {
        res.status(404).end()
    }
})





const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})