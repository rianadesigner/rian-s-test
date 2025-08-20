const { greet } = require('./src/greeter');
const User = require('./src/user');

console.log(greet('World'));

// Create a new user instance
const user = new User('John Doe', 'john.doe@example.com');
console.log(user.toString());