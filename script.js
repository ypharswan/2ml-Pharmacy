// Initialize medicines with stock in localStorage
if (!localStorage.getItem('medicines')) {
    const defaultMedicines = [
        { id: 1, name: "Paracetamol 500mg", price: 5.99, description: "Pain relief and fever reducer", icon: "fas fa-tablets", stock: 50 },
        { id: 2, name: "Ibuprofen 200mg", price: 8.50, description: "Anti-inflammatory pain reliever", icon: "fas fa-pills", stock: 30 },
        { id: 3, name: "Aspirin 75mg", price: 4.25, description: "Blood thinner and pain relief", icon: "fas fa-capsules", stock: 25 },
        { id: 4, name: "Vitamin C 1000mg", price: 12.99, description: "Immune system support", icon: "fas fa-leaf", stock: 40 },
        { id: 5, name: "Vitamin D3 2000IU", price: 15.75, description: "Bone health supplement", icon: "fas fa-sun", stock: 35 },
        { id: 6, name: "Cough Syrup", price: 9.99, description: "Relief from dry and wet cough", icon: "fas fa-prescription-bottle", stock: 20 },
        { id: 7, name: "Antacid Tablets", price: 6.50, description: "Heartburn and acid reflux relief", icon: "fas fa-tablets", stock: 45 },
        { id: 8, name: "Bandages Pack", price: 3.99, description: "First aid wound care", icon: "fas fa-band-aid", stock: 60 }
    ];
    localStorage.setItem('medicines', JSON.stringify(defaultMedicines));
}

// Initialize stock transactions
if (!localStorage.getItem('stockTransactions')) {
    localStorage.setItem('stockTransactions', JSON.stringify([]));
}

let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    displayMedicines();
    updateCartDisplay();
    updateStockDisplay();
    
    // Update stock display when stock modal is opened
    document.getElementById('stockModal')?.addEventListener('shown.bs.modal', updateStockDisplay);
});

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // User is logged in
        document.getElementById('userWelcome').textContent = currentUser.name;
        document.querySelector('[onclick="showLogin()"]').style.display = 'none';
        document.getElementById('userAccount').style.display = 'block';
        
        if (currentUser.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('stockPanel').style.display = 'block';
            document.querySelector('[onclick="toggleCart()"]').style.display = 'none';
        } else {
            document.querySelector('[onclick="toggleCart()"]').style.display = 'block';
        }
    } else {
        // User is not logged in - show guest button
        document.querySelector('[onclick="showLogin()"]').style.display = 'block';
        document.getElementById('userAccount').style.display = 'none';
        document.querySelector('[onclick="toggleCart()"]').style.display = 'block';
    }
}

function displayMedicines() {
    const medicines = JSON.parse(localStorage.getItem('medicines'));
    const grid = document.getElementById('medicines-grid');
    grid.innerHTML = medicines.map(medicine => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card medicine-card h-100">
                <div class="card-body text-center">
                    <i class="${medicine.icon} medicine-icon"></i>
                    <h5 class="card-title text-primary">${medicine.name}</h5>
                    <div class="price-tag">$${medicine.price.toFixed(2)}</div>
                    <p class="card-text text-muted">${medicine.description}</p>
                    <small class="text-info d-block mb-2">Stock: ${medicine.stock}</small>
                    <button class="btn btn-success w-100" onclick="addToCart(${medicine.id})" ${medicine.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus me-2"></i>${medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(medicineId) {
    const medicines = JSON.parse(localStorage.getItem('medicines'));
    const medicine = medicines.find(m => m.id === medicineId);
    
    if (medicine.stock <= 0) {
        alert('This medicine is out of stock!');
        return;
    }
    
    const existingItem = cart.find(item => item.id === medicineId);
    
    if (existingItem) {
        if (existingItem.quantity >= medicine.stock) {
            alert('Cannot add more items. Stock limit reached!');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ ...medicine, quantity: 1 });
    }
    
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toFixed(2);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart fa-3x mb-3"></i><p>Your cart is empty</p></div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1 text-primary">${item.name}</h6>
                        <small class="text-muted">$${item.price.toFixed(2)} each</small>
                    </div>
                    <div class="qty-controls d-flex align-items-center">
                        <button class="qty-btn me-2" onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="mx-2 fw-bold">${item.quantity}</span>
                        <button class="qty-btn ms-2" onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateQuantity(medicineId, change) {
    const item = cart.find(item => item.id === medicineId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.id !== medicineId);
        }
        updateCartDisplay();
    }
}

function toggleCart() {
    const offcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
    offcanvas.toggle();
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('paymentTotal').textContent = total.toFixed(2);
    
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
}

function processPayment(event) {
    event.preventDefault();
    
    // Update stock after successful payment
    cart.forEach(item => {
        const medicines = JSON.parse(localStorage.getItem('medicines'));
        const medicine = medicines.find(m => m.id === item.id);
        medicine.stock -= item.quantity;
        localStorage.setItem('medicines', JSON.stringify(medicines));
        
        // Add outward transaction
        addStockTransaction(item.id, 'outward', item.quantity, 'Sale');
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} x${item.quantity}`).join('\n');
    
    alert(`Payment Successful!\n\nOrder Summary:\n${itemsList}\n\nTotal: $${total.toFixed(2)}\n\nThank you for your purchase!`);
    
    cart = [];
    updateCartDisplay();
    displayMedicines();
    
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    paymentModal.hide();
    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
    offcanvas.hide();
}

function addMedicine(event) {
    event.preventDefault();
    
    const medicines = JSON.parse(localStorage.getItem('medicines'));
    const newMedicine = {
        id: medicines.length + 1,
        name: document.getElementById('medicineName').value,
        price: parseFloat(document.getElementById('medicinePrice').value),
        description: document.getElementById('medicineDescription').value,
        icon: document.getElementById('medicineIcon').value,
        stock: parseInt(document.getElementById('medicineStock').value)
    };
    
    medicines.push(newMedicine);
    localStorage.setItem('medicines', JSON.stringify(medicines));
    
    // Add initial stock transaction
    if (newMedicine.stock > 0) {
        addStockTransaction(newMedicine.id, 'inward', newMedicine.stock, 'Initial stock');
    }
    
    displayMedicines();
    updateStockDisplay();
    
    const adminModal = bootstrap.Modal.getInstance(document.getElementById('adminModal'));
    adminModal.hide();
    
    document.getElementById('medicineName').value = '';
    document.getElementById('medicinePrice').value = '';
    document.getElementById('medicineDescription').value = '';
    document.getElementById('medicineStock').value = '0';
    
    alert('Medicine added successfully!');
}

function addStockTransaction(medicineId, type, quantity, note = '') {
    const transactions = JSON.parse(localStorage.getItem('stockTransactions'));
    const medicines = JSON.parse(localStorage.getItem('medicines'));
    const medicine = medicines.find(m => m.id === medicineId);
    
    const transaction = {
        id: transactions.length + 1,
        medicineId,
        medicineName: medicine.name,
        type,
        quantity,
        note,
        date: new Date().toLocaleString()
    };
    
    transactions.push(transaction);
    localStorage.setItem('stockTransactions', JSON.stringify(transactions));
}

function updateStock(event) {
    event.preventDefault();
    
    const medicineId = parseInt(document.getElementById('stockMedicine').value);
    const type = document.getElementById('transactionType').value;
    const quantity = parseInt(document.getElementById('stockQuantity').value);
    
    const currentStock = calculateStockFromTransactions(medicineId);
    
    if (type === 'outward' && currentStock < quantity) {
        alert('Insufficient stock for outward transaction!');
        return;
    }
    
    addStockTransaction(medicineId, type, quantity, 'Manual update');
    
    // Update medicine stock in localStorage based on calculated stock
    const medicines = JSON.parse(localStorage.getItem('medicines'));
    const medicine = medicines.find(m => m.id === medicineId);
    medicine.stock = calculateStockFromTransactions(medicineId);
    localStorage.setItem('medicines', JSON.stringify(medicines));
    
    updateStockDisplay();
    displayMedicines();
    
    document.getElementById('stockQuantity').value = '';
    alert('Stock updated successfully!');
}

function calculateStockFromTransactions(medicineId) {
    const transactions = JSON.parse(localStorage.getItem('stockTransactions'));
    const medicineTransactions = transactions.filter(t => t.medicineId === medicineId);
    
    let calculatedStock = 0;
    medicineTransactions.forEach(transaction => {
        if (transaction.type === 'inward') {
            calculatedStock += transaction.quantity;
        } else {
            calculatedStock -= transaction.quantity;
        }
    });
    
    return Math.max(0, calculatedStock);
}

function updateStockDisplay() {
    const medicines = JSON.parse(localStorage.getItem('medicines'));
    const transactions = JSON.parse(localStorage.getItem('stockTransactions'));
    
    // Update medicine dropdown
    const stockMedicine = document.getElementById('stockMedicine');
    if (stockMedicine) {
        stockMedicine.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }
    
    // Update stock levels table with calculated stock
    const stockLevels = document.getElementById('stockLevels');
    if (stockLevels) {
        stockLevels.innerHTML = `
            <table class="table table-sm">
                <thead><tr><th>Medicine</th><th>Calculated Stock</th><th>Status</th></tr></thead>
                <tbody>
                    ${medicines.map(m => {
                        const calculatedStock = calculateStockFromTransactions(m.id);
                        return `
                        <tr>
                            <td>${m.name}</td>
                            <td>${calculatedStock}</td>
                            <td><span class="badge ${calculatedStock > 10 ? 'bg-success' : calculatedStock > 0 ? 'bg-warning' : 'bg-danger'}">
                                ${calculatedStock > 10 ? 'In Stock' : calculatedStock > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Update transactions table
    const stockTransactions = document.getElementById('stockTransactions');
    if (stockTransactions) {
        const recentTransactions = transactions.slice(-10).reverse();
        stockTransactions.innerHTML = `
            <table class="table table-sm">
                <thead><tr><th>Date</th><th>Medicine</th><th>Type</th><th>Quantity</th><th>Note</th></tr></thead>
                <tbody>
                    ${recentTransactions.map(t => `
                        <tr>
                            <td>${t.date}</td>
                            <td>${t.medicineName}</td>
                            <td><span class="badge ${t.type === 'inward' ? 'bg-success' : 'bg-danger'}">${t.type}</span></td>
                            <td>${t.quantity}</td>
                            <td>${t.note}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

function showLogin() {
    const signUpModal = bootstrap.Modal.getInstance(document.getElementById('signUpModal'));
    if (signUpModal) signUpModal.hide();
    
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showSignUp() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (loginModal) loginModal.hide();
    
    const signUpModal = new bootstrap.Modal(document.getElementById('signUpModal'));
    signUpModal.show();
}

function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signUpName').value;
    const username = document.getElementById('signUpUsername').value;
    const password = document.getElementById('signUpPassword').value;
    
    // Store new user (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
        alert('Username already exists!');
        return;
    }
    
    users[username] = { password, name, role: 'user' };
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Account created successfully! Please login.');
    
    const signUpModal = bootstrap.Modal.getInstance(document.getElementById('signUpModal'));
    signUpModal.hide();
    
    showLogin();
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Check default users and registered users
    const defaultUsers = {
        'admin': { password: 'admin123', name: 'Administrator', role: 'admin' },
        'user': { password: 'user123', name: 'User', role: 'user' }
    };
    
    const registeredUsers = JSON.parse(localStorage.getItem('users') || '{}');
    const allUsers = { ...defaultUsers, ...registeredUsers };
    
    if (allUsers[username] && allUsers[username].password === password) {
        const user = { name: allUsers[username].name, role: allUsers[username].role };
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Hide login modal and show user account
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Update UI
        document.getElementById('userWelcome').textContent = user.name;
        document.querySelector('[onclick="showLogin()"]').style.display = 'none';
        document.getElementById('userAccount').style.display = 'block';
        
        if (user.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('stockPanel').style.display = 'block';
            document.querySelector('[onclick="toggleCart()"]').style.display = 'none';
        } else {
            document.querySelector('[onclick="toggleCart()"]').style.display = 'block';
        }
        
        alert('Login successful!');
    } else {
        alert('Invalid username or password!');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    
    // Reset UI
    document.querySelector('[onclick="showLogin()"]').style.display = 'block';
    document.getElementById('userAccount').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('stockPanel').style.display = 'none';
    document.querySelector('[onclick="toggleCart()"]').style.display = 'block';
    document.getElementById('userWelcome').textContent = 'Account';
}