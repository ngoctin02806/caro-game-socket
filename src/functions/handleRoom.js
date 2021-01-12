/* eslint-disable no-useless-catch */
const mongo = require('../core/mongo.core');

const COLLECTION = 'rooms';

const findRoomById = async roomId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const room = await collection.findOne({ _id: roomId });

    return room;
  } catch (error) {
    throw error;
  }
};

const checkUserHasJoinRoom = async userId => {
  try {
    const db = mongo.db();
    const collection = db.collection(COLLECTION);

    const room = await collection.findOne({
      players: { $elemMatch: { $eq: userId } },
    });

    if (room) return true;

    return false;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findRoomById,
  checkUserHasJoinRoom,
};
