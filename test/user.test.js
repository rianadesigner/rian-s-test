const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../src/user');

// 原测试：验证 User 类方法的行为。
// Translated tests: verify the behaviour of the User class methods.

test('isValid returns true for a user with a valid email', () => {
  const user = new User('Jane Doe', 'jane.doe@example.com');

  assert.strictEqual(user.isValid(), true);
});

test('isValid returns false when the email is missing an @ symbol', () => {
  const user = new User('Invalid User', 'invalid.example.com');

  assert.strictEqual(user.isValid(), false);
});

test('toString returns the translated user description', () => {
  const user = new User('John Doe', 'john.doe@example.com');
  const expected = 'User: John Doe (john.doe@example.com)';

  assert.strictEqual(user.toString(), expected);
});
