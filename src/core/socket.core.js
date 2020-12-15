const socketLib = require('socket.io');
const config = require('config');
const generateSafeId = require('generate-safe-id');

const {
  updateOnlineStatusUser,
  insertNewMessage,
  findUserById,
} = require('../functions/handleUser');

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
        console.log(`user-login`, msg);

        PERSITENT_SOCKETS.push({
          socket,
          user_id: msg.user_id,
        });

        await updateOnlineStatusUser(msg.user_id);
      });

      // eslint-disable-next-line
      socket.on('emit-conversation-game', async ({ room_id, user_id }) => {
        console.log(room_id);

        socket.join(room_id);

        const user = await findUserById(user_id);

        socket.to(room_id).emit('joined-game-room', {
          user_id: user._id, // eslint-disable-line
          username: user.username,
          avatar: user.avatar,
        });
      });

      /* eslint-disable*/
      socket.on('emit-conversation-single', async ({ room_id, partner_id }) => {
        console.log(`partner_id: ${partner_id}`);

        const partnerSocket = PERSITENT_SOCKETS.find(
          soc => soc.user_id === partner_id // eslint-disable-line
        );

        if (partnerSocket) {
          console.log('joining');

          socket.join(room_id);

          partnerSocket.socket.join(room_id);

          const currentSocket = PERSITENT_SOCKETS.find(
            soc => soc.socket.id === socket.id
          );

          const user = await findUserById(currentSocket.user_id);

          delete user.password;
          delete user.is_verified;
          delete user.verified_code;

          partnerSocket.socket.emit('joined-room', {
            ...user,
          });
        }
      });

      socket.on(
        'emit-conversation-message',
        async ({ room_id, message }, arg2, callback) => {
          await insertNewMessage({
            _id: generateSafeId(),
            content: message.content,
            conversation_id: room_id,
            created_by: message.sender_id,
            created_at: new Date().getTime(),
          });

          console.log(room_id);

          console.log(socket.rooms);

          socket.to(room_id).emit('conversation-message', {
            room_id,
            sender_id: message.sender_id,
            message,
          });

          callback({
            status: {
              identify: message.identify,
              conversation_id: room_id,
            },
          });
        }
      );

      socket.on(
        'emit-conversation-game-message',
        async ({ room_id, message }) => {
          await insertNewMessage({
            _id: generateSafeId(),
            content: message.content,
            conversation_id: room_id,
            created_by: message.sender_id,
            created_at: new Date().getTime(),
          });

          console.log(room_id);

          console.log(socket.rooms);

          socket.to(room_id).emit('conversation-game-message', {
            room_id,
            sender_id: message.sender_id,
            message,
          });
        }
      );

      socket.on('disconnect', () => {
        console.log(`${socket.id} is disconnected`);
        const index = PERSITENT_SOCKETS.findIndex(item => {
          return item.socket.id === socket.id;
        });

        console.log(index);

        if (index !== -1) {
          PERSITENT_SOCKETS.splice(index, 1);
        }
      });
    });

    resolve();
  });

module.exports = {
  persistentConnection,
};
