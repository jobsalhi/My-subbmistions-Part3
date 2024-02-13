const express = require("express");
const app = express();
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./modules/persone");

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
morgan.token("req-body", (req, res) => {
  return JSON.stringify(req.body);
});

const logPostRequest = (req, res, next) => {
  if (req.method === "POST") {
    return morgan(
      ":method :url :status :res[content-length] - :response-time ms :req-body"
    )(req, res, next);
  }
  next();
};

app.use(cors({ origin: "http://localhost:5173" }));

app.use(logPostRequest);
// app.use(morgan('tiny'))
app.use(express.static("dist"));
app.use(express.json());

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.number) {
    return res.status(400).json({
      error: "number is missing",
    });
  }
  if (!body.name) {
    return res.status(400).json({
      error: "name is missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then((savedPerson) => {
    res.json(person);
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/info", (req, res) => {
  const length = persons.length;
  const time = new Date(Date.now());

  res.send(`<p>Phonebook has info for ${length} people</p><p>${time}</p>`);
});


app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})

app.put("/api/persons/:id",(request, response, next) => {
  const body = request.body
  const person = {
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
}) 


app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error)
    });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}


app.use(errorHandler)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
