const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "User not found." })
  }
  request.user = user;
  return next();
}

function getTodo(request, response) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "To-do not found." });
  }
  return todo;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
    id: uuidv4()
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = getTodo(request, response);
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(200).json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todo = getTodo(request, response);
  todo.done = true;
  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todo = getTodo(request, response);
  user.todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;