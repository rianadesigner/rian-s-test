const { greet } = require('./src/greeter');
const User = require('./src/user');
const ProcessManager = require('./src/processManager');
const ProcessRegistry = require('./src/processRegistry');
const { JsonSchemaValidator } = require('./src/jsonSchemaValidator');
const { processConfigSchema } = require('./src/schemas/processConfigSchema');

console.log(greet('World'));

// Create a new user instance
const user = new User('John Doe', 'john.doe@example.com');
console.log(user.toString());

// Demonstrate process manager usage
const demoService = new ProcessManager('Demo Service');
console.log(demoService.start());
console.log(`Is running: ${demoService.isRunning()}`);
console.log(demoService.stop());
console.log(demoService.restart());

// Demonstrate JSON schema validation
console.log('\nSchema validation demo:');

const validator = new JsonSchemaValidator(processConfigSchema);
const invalidConfig = {
  name: 'ok',
  port: 80,
  retries: -1,
  tags: ['alpha', 'alpha'],
  extra: true,
  healthCheck: {
    interval: 2,
    timeout: 100,
    strategy: 'ping',
  },
};

const result = validator.validate(invalidConfig);

if (!result.valid) {
  console.log('Invalid configuration detected. Errors:');
  result.errorSummary.forEach((error) => console.log(` - ${error}`));
}

const validConfig = {
  name: 'demo-service',
  port: 3000,
  retries: 2,
  tags: ['alpha', 'beta'],
  healthCheck: {
    interval: 30,
    timeout: 5,
    strategy: 'http',
  },
};

const validResult = validator.validate(validConfig);
console.log(`Valid configuration accepted: ${validResult.valid}`);

// Demonstrate registry operations
const registry = new ProcessRegistry();
const registration = registry.register(validConfig);

if (registration.ok) {
  console.log(`\nRegistered process: ${registration.config.name}`);
} else {
  console.log('\nRegistration failed:');
  registration.errors.forEach((error) => console.log(` - ${error}`));
}

const duplicateRegistration = registry.register(validConfig);
if (!duplicateRegistration.ok) {
  console.log('\nDuplicate registration rejected:');
  duplicateRegistration.errors.forEach((error) => console.log(` - ${error}`));
}

const invalidUpdate = registry.update('demo-service', { port: 80 });
if (!invalidUpdate.ok) {
  console.log('\nInvalid update rejected:');
  invalidUpdate.errors.forEach((error) => console.log(` - ${error}`));
}

const validUpdate = registry.update('demo-service', { retries: 3 });
if (validUpdate.ok) {
  console.log('\nUpdated process configuration:');
  console.log(validUpdate.config);
}

console.log('\nRegistered processes:');
console.log(registry.list());
