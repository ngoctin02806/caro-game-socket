const socketLib = require('socket.io');
const config = require('config');

const persistentConnection = http =>
  // eslint-disable-next-line
  new Promise((resolve, reject) => {
    const io = socketLib(http, {
      cors: {
        origin: config.get('ORIGIN_SOCKET'),
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
      },
    });

    io.on('connection', socket => {
      console.log(socket.id);

      socket.on('disconnect', () => {
        console.log(`${socket.id} is disconnected`);
      });
    });

    resolve();
  });

module.exports = {
  persistentConnection,
};
