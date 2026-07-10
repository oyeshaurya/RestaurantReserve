const bcrypt = require('bcryptjs');

let users = [];
let userIdCounter = 1;

const User = {
  async create({ name, email, password, role = 'customer' }) {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: userIdCounter++,
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return user;
  },
  
  findOne({ email }) {
    return users.find(u => u.email === email) || null;
  },
  
  findById(id) {
    return users.find(u => u._id == id) || null;
  }
};

module.exports = User;
