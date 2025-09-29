const { JsonSchemaValidator } = require('./jsonSchemaValidator');
const { processConfigSchema } = require('./schemas/processConfigSchema');

class ProcessRegistry {
  constructor(schema = processConfigSchema, options = {}) {
    this.schema = schema;
    this.validator = new JsonSchemaValidator(schema, options.validatorOptions);
    this.entries = new Map();
  }

  register(config) {
    const validation = this.validator.validate(config);

    if (!validation.valid) {
      return {
        ok: false,
        errors: validation.errorSummary || validation.errors,
      };
    }

    const name = config.name;
    if (!name) {
      return {
        ok: false,
        errors: ['Process configuration must include a name'],
      };
    }

    if (this.entries.has(name)) {
      return {
        ok: false,
        errors: [`Process '${name}' is already registered`],
      };
    }

    this.entries.set(name, this.#clone(config));

    return {
      ok: true,
      config: this.get(name),
    };
  }

  update(name, updates) {
    if (!this.entries.has(name)) {
      return {
        ok: false,
        errors: [`Process '${name}' is not registered`],
      };
    }

    const updatedConfig = {
      ...this.get(name),
      ...this.#clone(updates),
    };

    if (updatedConfig.name !== name) {
      return {
        ok: false,
        errors: ["Process name cannot be changed during update"],
      };
    }

    const validation = this.validator.validate(updatedConfig);
    if (!validation.valid) {
      return {
        ok: false,
        errors: validation.errorSummary || validation.errors,
      };
    }

    this.entries.set(name, this.#clone(updatedConfig));
    return {
      ok: true,
      config: this.get(name),
    };
  }

  unregister(name) {
    return this.entries.delete(name);
  }

  has(name) {
    return this.entries.has(name);
  }

  get(name) {
    const config = this.entries.get(name);
    return config ? this.#clone(config) : undefined;
  }

  list() {
    return Array.from(this.entries.values()).map((entry) => this.#clone(entry));
  }

  clear() {
    this.entries.clear();
  }

  #clone(value) {
    if (typeof value === 'undefined') {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  }
}

module.exports = ProcessRegistry;
