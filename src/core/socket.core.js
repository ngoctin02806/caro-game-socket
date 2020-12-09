const socketLib = require('socket.io');
const config = require('config');

const { updateOnlineStatusUser } = require('../functions/handleUser');

/**
 * Payload of item of PERSITENT_SOCKETS
 * {
 *    socket: Socket,
 *    user_id: String,
 *    room_id: String,
 * }
 */
const PERSITENT_SOCKETS = [];

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
      console.log(`Socket ${socket.id} is connected`);

      socket.on('emit-user-login', async msg => {
        const index = PERSITENT_SOCKETS.findIndex(item => {
          return item.user_id === msg.user_id;
        });

        if (index === -1) {
          PERSITENT_SOCKETS.push({
            socket,
            user_id: msg.user_id,
          });

          await updateOnlineStatusUser(msg.user_id);
        }
      });

      socket.on('disconnect', () => {
        console.log(`${socket.id} is disconnected`);
        const index = PERSITENT_SOCKETS.findIndex(item => {
          return item.socket.id === socket.id;
        });

        PERSITENT_SOCKETS.splice(index, 1);
        console.log(PERSITENT_SOCKETS);
      });
    });

    resolve();
  });

module.exports = {
  persistentConnection,
};
