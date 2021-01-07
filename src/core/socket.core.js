/* eslint-disable no-console */
const socketLib = require('socket.io');
const config = require('config');
const generateSafeId = require('generate-safe-id');

const {
  updateOnlineStatusUser,
  insertNewMessage,
  findUserById,
  updateOfflineStatusUser,
} = require('../functions/handleUser');

const {
  findConversationWithParticipant,
} = require('../functions/handleConversation');

const { findRoomById } = require('../functions/handleRoom');

const { GAME_GUEST, GAME_PLAYER } = require('../constants/game.constant');

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

      socket.on(
        'emit-invitation-join-room',
        // eslint-disable-next-line camelcase
        async (agr1, { room_type, room_id, partner_id, user_id }, callback) => {
          console.log(room_id);

          const partnerSoc = PERSITENT_SOCKETS.find(
            // eslint-disable-next-line camelcase
            soc => soc.user_id === partner_id
          );

          if (partnerSoc) {
            const user = await findUserById(user_id);

            const room = await findRoomById(room_id);

            delete user.password;
            delete user.is_verified;
            delete user.verified_code;
            delete user.has_topup;

            partnerSoc.socket.emit('show-invitation', {
              room_id,
              room_type,
              room_secret: room.room_secret,
              bet_level: room.bet_level,
              user,
            });
          }

          callback({ status: 'ok' });
        }
      );

      socket.on('emit-user-login', async msg => {
        console.log(`user-login`, msg);

        PERSITENT_SOCKETS.push({
          socket,
          user_id: msg.user_id,
        });

        await updateOnlineStatusUser(msg.user_id);
      });

      socket.on(
        'emit-step-game',
        // eslint-disable-next-line camelcase
        ({ room_id, next_user_id, step, character }) => {
          console.log('next player id', next_user_id);

          socket
            .to(room_id)
            .emit('step-game', { next_user_id, step, character });

          io.to(room_id).emit('start-game', { user_id: next_user_id });
        }
      );

      // eslint-disable-next-line camelcase
      socket.on('emit-start-game', ({ room_id, user_id, game }) => {
        console.log('emit-start-game-123');
        console.log(room_id);

        io.to(room_id).emit('start-game', { user_id });

        socket.to(room_id).emit('start-game-data', { user_id, game });
      });

      // eslint-disable-next-line camelcase
      socket.on('emit-join-room-game', async ({ room_id, user_id, type }) => {
        socket.join(room_id);

        const user = await findUserById(user_id);

        if (type === GAME_GUEST) {
          console.log(type);
          socket.to(room_id).emit('guest-join-room-game', {
            user: {
              // eslint-disable-next-line no-underscore-dangle
              _id: user._id,
              username: user.username,
              avatar: user.avatar,
              point: user.point,
            },
          });
        } else {
          socket.to(room_id).emit('player-join-room-game', {
            // eslint-disable-next-line no-underscore-dangle
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            type: GAME_PLAYER,
            point: user.point,
            guest_type: type,
          });
        }
      });

      // eslint-disable-next-line camelcase
      socket.on('emit-leave-room-game', ({ room_id, user_id, type }) => {
        socket.leave(room_id);

        if (type === GAME_GUEST) {
          socket.to(room_id).emit('guest-leave-room-game', {
            user_id,
          });
        } else {
          socket.to(room_id).emit('player-leave-room-game', {
            user_id,
          });
        }
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

          const conversation = await findConversationWithParticipant(room_id);

          console.log(conversation);

          const participants = conversation[0].participants;

          socket.to(room_id).emit('conversation-message', {
            room_id,
            sender_id: message.sender_id,
            partner_id: participants.find(p => p != message.sender_id),
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

      // Rejoin room
      socket.on('emit-rejoin-room', async conversations => {
        // Get user
        const socketData = PERSITENT_SOCKETS.find(
          soc => soc.socket.id === socket.id
        );

        const user = await findUserById(socketData.user_id);

        conversations.forEach(con => {
          socket.join(con);
        });

        socket.emit('joined-room', {
          ...user,
        });
      });

      socket.on('emit-user-logout', async () => {
        console.log(`${socket.id} is disconnected`);
        const index = PERSITENT_SOCKETS.findIndex(item => {
          return item.socket.id === socket.id;
        });

        console.log(index);

        if (index !== -1) {
          await updateOfflineStatusUser(PERSITENT_SOCKETS[index].user_id);
          PERSITENT_SOCKETS.splice(index, 1);
        }
      });

      socket.on('disconnect', async () => {
        console.log(`${socket.id} is disconnected`);
        const index = PERSITENT_SOCKETS.findIndex(item => {
          return item.socket.id === socket.id;
        });

        console.log(index);

        if (index !== -1) {
          await updateOfflineStatusUser(PERSITENT_SOCKETS[index].user_id);
          PERSITENT_SOCKETS.splice(index, 1);
        }
      });
    });

    resolve();
  });

module.exports = {
  persistentConnection,
};
