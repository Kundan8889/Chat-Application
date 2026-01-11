const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const UserModel = require('../models/UserModel');
const { ConversationModel, MessageModel } = require('../models/ConversationModel');
const getConversation = require('../helpers/getConversation');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

const onlineUser = new Set();
const userSockets = new Map(); // Map userId => Set of socketIds

io.on('connection', async (socket) => {
  console.log("Connected user:", socket.id);

  const token = socket.handshake.auth.token;

  try {
    const user = await getUserDetailsFromToken(token);
    if (!user) {
      console.log('Unauthorized user');
      return socket.disconnect();
    }

    const userId = user._id.toString();

    // Track this socket for the user
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    // Add user to online list if first socket
    if (!onlineUser.has(userId)) {
      onlineUser.add(userId);
      io.emit('onlineUser', Array.from(onlineUser));
    }

    socket.join(userId);

    // Handle message-page event
    socket.on('message-page', async (otherUserId) => {
      console.log('User ID:', otherUserId);

      try {
        const userDetails = await UserModel.findById(otherUserId).select("-password");
        const payload = {
          _id: userDetails?._id,
          name: userDetails?.name,
          email: userDetails?.email,
          profile_pic: userDetails?.profile_pic,
          online: onlineUser.has(otherUserId)
        };
        socket.emit('message-user', payload);

        const conversation = await ConversationModel.findOne({
          "$or": [
            { sender: user._id, receiver: otherUserId },
            { sender: otherUserId, receiver: user._id }
          ]
        }).populate('messages').sort({ updatedAt: -1 });

        socket.emit('message', conversation?.messages || []);
      } catch (error) {
        console.error('Error handling message-page:', error.message);
        socket.emit('error', { message: 'Failed to load message page.' });
      }
    });

    // Handle new message
    socket.on('new message', async (data) => {
      try {
        let conversation = await ConversationModel.findOne({
          "$or": [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender }
          ]
        });

        if (!conversation) {
          conversation = new ConversationModel({
            sender: data.sender,
            receiver: data.receiver
          });
          await conversation.save();
        }

        const message = new MessageModel({
          text: data.text,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          msgByUserId: data.msgByUserId
        });
        const savedMessage = await message.save();

        await ConversationModel.updateOne(
          { _id: conversation._id },
          { "$push": { messages: savedMessage._id } }
        );

        const updatedConversation = await ConversationModel.findOne({
          "$or": [
            { sender: data.sender, receiver: data.receiver },
            { sender: data.receiver, receiver: data.sender }
          ]
        }).populate('messages').sort({ updatedAt: -1 });

        io.to(data.sender).emit('message', updatedConversation?.messages || []);
        io.to(data.receiver).emit('message', updatedConversation?.messages || []);

        const conversationSender = await getConversation(data.sender);
        const conversationReceiver = await getConversation(data.receiver);

        io.to(data.sender).emit('conversation', conversationSender);
        io.to(data.receiver).emit('conversation', conversationReceiver);
      } catch (error) {
        console.error('Error handling new message:', error.message);
        socket.emit('error', { message: 'Failed to send new message.' });
      }
    });

    // Handle sidebar update
    socket.on('sidebar', async (currentUserId) => {
      try {
        const conversation = await getConversation(currentUserId);
        socket.emit('conversation', conversation);
      } catch (error) {
        console.error('Error handling sidebar:', error.message);
        socket.emit('error', { message: 'Failed to load sidebar.' });
      }
    });

    // Handle message seen event
    socket.on('seen', async (msgByUserId) => {
      try {
        const conversation = await ConversationModel.findOne({
          "$or": [
            { sender: user._id, receiver: msgByUserId },
            { sender: msgByUserId, receiver: user._id }
          ]
        });

        const conversationMessageIds = conversation?.messages || [];

        await MessageModel.updateMany(
          { _id: { "$in": conversationMessageIds }, msgByUserId: msgByUserId },
          { "$set": { seen: true } }
        );

        const conversationSender = await getConversation(user._id.toString());
        const conversationReceiver = await getConversation(msgByUserId);

        io.to(user._id.toString()).emit('conversation', conversationSender);
        io.to(msgByUserId).emit('conversation', conversationReceiver);
      } catch (error) {
        console.error('Error handling seen event:', error.message);
        socket.emit('error', { message: 'Failed to update seen status.' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          onlineUser.delete(userId);
          io.emit('onlineUser', Array.from(onlineUser));
        }
      }
      console.log('Disconnected user:', socket.id);
    });
  } catch (error) {
    console.error('Error during socket connection:', error.message);
    socket.disconnect();
  }
});

module.exports = {
  app,
  server
};
