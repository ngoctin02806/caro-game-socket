const mongoConfig = require('../core/mongo.core');

const COLLECTION = 'users';

/* eslint-disable */
module.exports.updateOnlineStatusUser = async userId => {
  console.log(userId);
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
