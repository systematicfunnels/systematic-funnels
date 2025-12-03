require('dotenv').config({ path: '.env.local' });

const config = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

module.exports = config;