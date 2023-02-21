"use strict";

const chatController = require('../controllers/chat');
const router = require('express').Router();



router.get("/get-user-subscribed-channels", chatController.getUserSubscribedChannels());
router.get("/get-user-private-chats-with-last-messages", chatController.getUserPrivateChatsWithLastMessages());
router.get("/get-user-private-chats-and-channels-with-last-messages", chatController.getUserPrivateChatsAndChannelsWithLastMessages());
router.get("/get-channel-plebs", chatController.getChannelPlebs());
router.get("/get-channel-messages", chatController.getChannelMessages());
router.get("/get-chat-messages", chatController.getChatMessages());
//creator operations
router.post("/create-channel", chatController.createChannel());
router.post("/delete-channel", chatController.deleteChannel());
router.post("/change-channel-name", chatController.changeChannelName());
router.post("/add-moderator-to-channel", chatController.addModeratorToChannel());
router.post("/remove-moderator-from-channel", chatController.removeModeratorFromChannel());
//moderator operations
router.get("/get-invited-users", chatController.getInvitedUsers());
router.post("/approve-user-to-channel", chatController.approveUserToChannel());
router.post("/decline-user-to-channel", chatController.declineUserToChannel());
router.post("/remove-user-from-channel", chatController.removeUserFromChannel());
//user opertaitons
router.post("/invite-user-to-channel", chatController.inviteUserToChannel());

router.stack.forEach(l => console.log(l.route.path, l.route.methods))

module.exports = router;