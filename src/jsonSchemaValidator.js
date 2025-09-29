/**
 * Minimal JSON Schema validator focused on human friendly feedback.
 * Supports draft-07 core keywords that are commonly needed when
 * describing configuration objects within this project.
 */
class JsonSchemaValidator {
  constructor(schema, options = {}) {
    if (!schema || typeof schema !== 'object') {
      throw new Error('A JSON schema object is required');
    }

    this.schema = schema;
    this.options = {
      collectAllErrors: options.collectAllErrors !== false,
    };
  }

  validate(data) {
    const errors = [];
    this.#validateSchema(this.schema, data, '', errors);

    return {
      valid: errors.length === 0,
      errors,
      errorSummary: errors.length ? this.#formatErrors(errors) : null,
    };
  }

  #formatErrors(errors) {
    return errors.map((error) => {
      const location = error.path ? `at ${error.path}` : 'at root';
      return `${location}: ${error.message}`;
    });
  }

  #validateSchema(schema, data, path, errors) {
    if (!schema || typeof schema !== 'object') {
      return;
    }

    const typeCheckResult = this.#checkType(schema, data, path);
    if (!typeCheckResult.valid) {
      errors.push(typeCheckResult.error);
      if (!this.options.collectAllErrors) {
        return;
      }
    }

    if (schema.enum) {
      this.#validateEnum(schema.enum, data, path, errors);
    }

    switch (this.#determineType(schema, data)) {
      case 'object':
        this.#validateObject(schema, data, path, errors);
        break;
      case 'string':
        this.#validateString(schema, data, path, errors);
        break;
      case 'number':
      case 'integer':
        this.#validateNumber(schema, data, path, errors);
        break;
      case 'array':
        this.#validateArray(schema, data, path, errors);
        break;
      default:
        break;
    }
  }

  #determineType(schema, value) {
    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];

      for (const type of types) {
        if (this.#matchesType(type, value)) {
          return type;
        }
      }

      return types[0];
    }

    return this.#getType(value);
  }

  #checkType(schema, value, path) {
    if (!schema.type) {
      return { valid: true };
    }

    const expected = Array.isArray(schema.type) ? schema.type : [schema.type];
    const matches = expected.some((type) => this.#matchesType(type, value));

    if (!matches) {
      return {
        valid: false,
        error: {
          path,
          keyword: 'type',
          message: `Expected type ${expected.join(' or ')}, but received ${this.#getType(value)}`,
        },
      };
    }

    return { valid: true };
  }

  #matchesType(expectedType, value) {
    const actualType = this.#getType(value);

    if (expectedType === 'integer') {
      return actualType === 'number' && Number.isInteger(value);
    }

    if (expectedType === 'number') {
      return actualType === 'number';
    }

    if (expectedType === 'array') {
      return Array.isArray(value);
    }

    if (expectedType === 'null') {
      return value === null;
    }

    return expectedType === actualType;
  }

  #validateEnum(enumeration, value, path, errors) {
    if (!enumeration.includes(value)) {
      errors.push({
        path,
        keyword: 'enum',
        message: `Value must be one of: ${enumeration.map((entry) => JSON.stringify(entry)).join(', ')}`,
      });
    }
  }

  #validateObject(schema, data, path, errors) {
    if (this.#getType(data) !== 'object') {
      return;
    }

    const required = schema.required || [];
    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        errors.push({
          path: this.#composePath(path, key),
          keyword: 'required',
          message: `Missing required property '${key}'`,
        });
        if (!this.options.collectAllErrors) {
          return;
        }
      }
    }

    if (schema.properties) {
      for (const [key, propertySchema] of Object.entries(schema.properties)) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
          continue;
        }

        this.#validateSchema(
          propertySchema,
          data[key],
          this.#composePath(path, key),
          errors,
        );

        if (!this.options.collectAllErrors && errors.length) {
          return;
        }
      }
    }

    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(data)) {
        if (!Object.prototype.hasOwnProperty.call(schema.properties, key)) {
          errors.push({
            path: this.#composePath(path, key),
            keyword: 'additionalProperties',
            message: `Unexpected property '${key}' is not allowed`,
          });
          if (!this.options.collectAllErrors) {
            return;
          }
        }
      }
    }
  }

  #validateString(schema, value, path, errors) {
    if (typeof value !== 'string') {
      return;
    }

    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errors.push({
        path,
        keyword: 'minLength',
        message: `String is too short. Minimum length is ${schema.minLength}`,
      });
    }

    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      errors.push({
        path,
        keyword: 'maxLength',
        message: `String is too long. Maximum length is ${schema.maxLength}`,
      });
    }

    if (schema.pattern) {
      const pattern = new RegExp(schema.pattern);
      if (!pattern.test(value)) {
        errors.push({
          path,
          keyword: 'pattern',
          message: `String does not match required pattern ${schema.pattern}`,
        });
      }
    }
  }

  #validateNumber(schema, value, path, errors) {
    if (typeof value !== 'number') {
      return;
    }

    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (expectedTypes.includes('integer') && !Number.isInteger(value)) {
      errors.push({
        path,
        keyword: 'type',
        message: 'Value must be an integer',
      });
    }

    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      errors.push({
        path,
        keyword: 'minimum',
        message: `Value must be greater than or equal to ${schema.minimum}`,
      });
    }

    if (typeof schema.maximum === 'number' && value > schema.maximum) {
      errors.push({
        path,
        keyword: 'maximum',
        message: `Value must be less than or equal to ${schema.maximum}`,
      });
    }

    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) {
      errors.push({
        path,
        keyword: 'exclusiveMinimum',
        message: `Value must be greater than ${schema.exclusiveMinimum}`,
      });
    }

    if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum) {
      errors.push({
        path,
        keyword: 'exclusiveMaximum',
        message: `Value must be less than ${schema.exclusiveMaximum}`,
      });
    }
  }

  #validateArray(schema, value, path, errors) {
    if (!Array.isArray(value)) {
      return;
    }

    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push({
        path,
        keyword: 'minItems',
        message: `Array must contain at least ${schema.minItems} item(s)`
      });
    }

    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) {
      errors.push({
        path,
        keyword: 'maxItems',
        message: `Array must contain no more than ${schema.maxItems} item(s)`
      });
    }

    if (schema.uniqueItems) {
      const seen = new Set();
      for (let index = 0; index < value.length; index += 1) {
        const serialized = JSON.stringify(value[index]);
        if (seen.has(serialized)) {
          errors.push({
            path: this.#composePath(path, index),
            keyword: 'uniqueItems',
            message: 'Array items must be unique',
          });
          if (!this.options.collectAllErrors) {
            return;
          }
        } else {
          seen.add(serialized);
        }
      }
    }

    if (schema.items) {
      value.forEach((item, index) => {
        this.#validateSchema(
          schema.items,
          item,
          this.#composePath(path, index),
          errors,
        );
      });
    }
  }

  #getType(value) {
    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      return 'array';
    }

    return typeof value;
  }

  #composePath(base, key) {
    if (base === '') {
      return Array.isArray(key) || typeof key === 'number' ? `[${key}]` : key;
    }

    if (typeof key === 'number') {
      return `${base}[${key}]`;
    }

    return `${base}.${key}`;
  }
}

function validateAgainstSchema(schema, data, options) {
  const validator = new JsonSchemaValidator(schema, options);
  return validator.validate(data);
}

module.exports = {
  JsonSchemaValidator,
  validateAgainstSchema,
};
