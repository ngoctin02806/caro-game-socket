const mongoConfig = require('../core/mongo.core');

const COLLECTION = 'users';
const CONVER_COLLECTION = 'messages';

/* eslint-disable */
module.exports.updateOnlineStatusUser = async userId => {
  try {
    const db = mongoConfig.db();
    const collection = db.collection(COLLECTION);

    const result = await collection.updateOne(
      { _id: userId },
      { $set: { online_state: true } }
    );

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports.insertNewMessage = async message => {
  try {
    const db = mongoConfig.db();
    const collection = db.collection(CONVER_COLLECTION);

    const result = await collection.insertOne({ ...message });

    return result.ops[0];
  } catch (error) {
    throw error;
  }
};

module.exports.findUserById = async userId => {
  try {
    const db = mongoConfig.db();
    const collection = db.collection(COLLECTION);

    const user = await collection.findOne({ _id: userId });

    return user;
  } catch (error) {
    throw error;
  }
};
