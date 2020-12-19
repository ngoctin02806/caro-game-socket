const mongoConfig = require('../core/mongo.core');

const COLLECTION = 'conversations';

/* eslint-disable */
module.exports.findConversationWithParticipant = async conversationId => {
  try {
    const db = mongoConfig.db();
    const collection = db.collection(COLLECTION);

    const conversation = await collection
      .aggregate([
        {
          $match: {
            _id: conversationId,
          },
        },
      ])
      .toArray();

    return conversation;
  } catch (error) {
    throw error;
  }
};
