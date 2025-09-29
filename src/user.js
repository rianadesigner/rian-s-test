class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  // New method to check if the user is valid
  isValid() {
    return this.name && this.email && this.email.includes('@');
  }

  toString() {
    return `User: ${this.name} (${this.email})`;
  }
}

module.exports = User;
