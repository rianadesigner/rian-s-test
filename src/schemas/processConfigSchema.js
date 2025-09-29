const processConfigSchema = {
  $id: 'https://example.com/schemas/process-config',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Process Configuration',
  description:
    'Defines the shape of a process configuration object used by the ProcessManager demo.',
  type: 'object',
  required: ['name', 'port', 'retries'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      description: 'Human-friendly process identifier.',
    },
    port: {
      type: 'number',
      minimum: 1024,
      maximum: 65535,
      description: 'TCP port exposed by the process.',
    },
    retries: {
      type: 'integer',
      minimum: 0,
      maximum: 10,
      description: 'Number of restart attempts before failing the process.',
    },
    tags: {
      type: 'array',
      items: { type: 'string', minLength: 1 },
      uniqueItems: true,
      minItems: 1,
      description: 'Optional labels that describe the process.',
    },
    healthCheck: {
      type: 'object',
      required: ['interval', 'timeout'],
      additionalProperties: false,
      properties: {
        interval: {
          type: 'integer',
          minimum: 5,
          maximum: 300,
          description: 'Seconds between health checks.',
        },
        timeout: {
          type: 'integer',
          minimum: 1,
          maximum: 60,
          description: 'Seconds before a health check is considered failed.',
        },
        strategy: {
          type: 'string',
          enum: ['http', 'tcp', 'custom'],
          description: 'Mechanism for probing the service health.',
        },
      },
      description: 'Optional health check configuration.',
    },
  },
};

module.exports = { processConfigSchema };
