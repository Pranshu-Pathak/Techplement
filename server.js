const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const usersFile = path.join(__dirname, 'data', 'users.json');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(usersFile))) {
    fs.mkdirSync(path.dirname(usersFile));
}

// nth just to make another pull making a useless change
// Function to load users from file
function loadUsers() {
    if (fs.existsSync(usersFile)) {
        const fileContent = fs.readFileSync(usersFile, 'utf-8');
        if (fileContent.trim()) {
            return JSON.parse(fileContent);
        }
    }
    return [];
}

// Load users
let users = loadUsers();

app.post('/signup', (req, res) => {
    const { phone, username, password } = req.body;

    if (users.find(u => u.phone === phone || u.username === username)) {
        return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = { phone, username, password: hashedPassword };

    users.push(newUser);

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { phone, username, password } = req.body;

    const user = users.find(u => u.phone === phone && u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ phone, username }, 'secret_key', { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
