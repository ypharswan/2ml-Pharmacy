// Initialize users in localStorage
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
        { id: 1, name: 'Admin User', email: 'admin@pharmacare.com', password: 'admin123', role: 'admin' },
        { id: 2, name: 'John Doe', email: 'user@example.com', password: 'user123', role: 'user' }
    ]));
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    } else {
        alert('Invalid credentials!');
    }
}

function signup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('userType').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users.find(u => u.email === email)) {
        alert('Email already exists!');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        role
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    alert('Account created successfully!');
    window.location.href = 'index.html';
}