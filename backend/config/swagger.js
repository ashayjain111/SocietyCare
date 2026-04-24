const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SocietyCare API',
      version: '1.0.0',
      description: 'AI-Powered Smart Society Management System API',
      contact: {
        name: 'SocietyCare Support',
        email: 'support@societycare.com',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
