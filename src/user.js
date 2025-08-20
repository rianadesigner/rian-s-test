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

  toString() {
    return `User: ${this.name} (${this.email})`;
  }
}

module.exports = User;