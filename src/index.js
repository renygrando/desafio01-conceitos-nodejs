const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({error: 'User not found'});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {

  const { name, username} = request.body;

  const userAlreadyExists = users.some(
    (user) => user.name === name
  );

  if(userAlreadyExists) {
    return response.status(400).json({error: 'User already exists'})
  }

  const id = uuidv4();

  users.push({ 
    id,
    name, 
    username,
    todos: []
  });

  const user = users.find(user => user.username === username);  

  return response.status(201).send(user);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;
  const { user } = request;
  const id = uuidv4();
  
  const createTodo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(createTodo);

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const findTodoId = user.todos.find(
    todoId => todoId.id === id
  )

  if(findTodoId) {
    user.todos.title = title;
    user.todos.deadline = deadline;
    return response.status(201).send(user.todos)
  } else {
    response.status(400).json({error: "Todo not found"});
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app