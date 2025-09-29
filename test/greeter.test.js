const test = require('node:test');
const assert = require('node:assert/strict');
const { greet } = require('../src/greeter');

// 原测试：验证 greet 函数返回的欢迎语。
// Translated test: verify that the greet function returns the welcome message.

test('greet returns the expected welcome message', () => {
  const name = 'Alice';
  const expected = `Hello, ${name}! Welcome to our Node.js package.`;
  const result = greet(name);

  assert.strictEqual(result, expected);
});
