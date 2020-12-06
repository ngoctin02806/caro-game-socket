require('dotenv').config();

const http = require('http').createServer();

const config = require('config');
const mongoConfig = require('./core/mongo.core');
const socketConfig = require('./core/socket.core');

const logger = require('./lib/logger');

const startServer = async () => {
  try {
    await mongoConfig.connect(config.get('MONGO_URL'));
    await socketConfig.persistentConnection(http);

    http.listen(config.get('PORT'), () => {
      console.info(`Server is listening on port ${config.get('PORT')}`);
    });
  } catch (error) {
    logger.error(error);
  }
};

startServer();
