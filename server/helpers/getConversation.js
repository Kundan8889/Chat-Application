const { ConversationModel } = require("../models/ConversationModel");

const getConversation = async (currentUserId) => {
    if (!currentUserId) {
        return [];
    }

    try {
        const currentUserConversations = await ConversationModel.find({
            "$or": [
                { sender: currentUserId },
                { receiver: currentUserId }
            ]
        })
        .sort({ updatedAt: -1 })
        .populate('messages')
        .populate('sender')
        .populate('receiver');

        if (!currentUserConversations.length) {
            return [];
        }

        const conversations = currentUserConversations.map((conv) => {
            const unseenMsgCount = conv.messages.reduce((count, msg) => {
                const msgByUserId = msg.msgByUserId.toString();
                return msgByUserId !== currentUserId ? count + (msg.seen ? 0 : 1) : count;
            }, 0);

            return {
                _id: conv._id,
                sender: conv.sender,
                receiver: conv.receiver,
                unseenMsg: unseenMsgCount,
                lastMsg: conv.messages[conv.messages.length - 1]
            };
        });

        return conversations;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
};

module.exports = getConversation;
