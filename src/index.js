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

  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({error: 'Username already exists'})
  }

  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }
    
  users.push(user);

  return response.status(201).json(user);
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;
  const { user } = request;
  
  const createTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(createTodo);

  return response.status(201).json(createTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const findTodoId = user.todos.find(
    todoId => todoId.id === id
  )

  if(!findTodoId){
    return response.status(404).json({error: "Todo not found" })
  }

  findTodoId.title = title;
  findTodoId.deadline = new Date(deadline);

  return response.send(findTodoId);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodoId = user.todos.find(
    todoId => todoId.id === id
  )

  if(!findTodoId){
    return response.status(404).json({error: "Todo not found" })
  }

  findTodoId.done = true;

  return response.json(findTodoId);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodoIndex = user.todos.findIndex(
    todoId => todoId.id === id
  )

  if(findTodoIndex === -1){
    return response.status(404).json({error: "Todo not found" })
  }

  user.todos.splice(findTodoIndex, 1);

  return response.status(204).json();
});

module.exports = app