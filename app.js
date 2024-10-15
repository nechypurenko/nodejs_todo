const express = require('express')
const fs = require('fs');
const cors = require('cors');
const app = express()
const port = 3000

app.use(cors());


const readTodos = () => {
    const data = fs.readFileSync('./todo.json', 'utf-8');
    return data ? JSON.parse(data) : [];
    // try {
    //     if (!fs.existsSync('./todos.json')) {
    //         console.log('File not found, returning empty list.');
    //         return [];
    //     }
    //     const data = fs.readFileSync('./todo.json', 'utf-8');
    //     return data ? JSON.parse(data) : [];
    // } catch (err) {
    //     console.error('Error reading todos:', err);
    //     return [];
    // }
};


const writeTodos = (todos) => {
    fs.writeFileSync('todo.json', JSON.stringify(todos, null, 2));
};

function errorHandlingMiddlewareFunction(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message,
        stack: err.stack
    });
}

app.get('/todos', (req, res) => {
    const todos = readTodos();
    if (todos.length > 0){
        res.json(todos);
    } else {
        res.send('List empty!')
    }
    
});

app.get('/todos/:id', (req, res) => {
    const todos = readTodos();
    const todo = todos.find(t => t.id === req.params.id);
    if (todo) {
        res.json(todo);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
});

app.use(express.json());
app.post('/todos', (req, res) => {
    const todos = readTodos();
    const { description, completed } = req.body;
    const newTodo = { id: Date.now().toString(), description, completed };
    todos.push(newTodo);
    writeTodos(todos);
    res.status(201).json(newTodo);
});


app.put('/todos/:id', (req, res) => {
    const todos = readTodos();
    const index = todos.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
        todos[index] = { id: req.params.id, ...req.body };
        writeTodos(todos);
        res.json(todos[index]);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
});

app.delete('/todos/:id', (req, res) => {
    const todos = readTodos();
    const index = todos.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
        const deletedTodo = todos.splice(index, 1);
        writeTodos(todos);
        res.json(deletedTodo[0]);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
});

app.use(errorHandlingMiddlewareFunction);

app.listen(port, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port " + port)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

