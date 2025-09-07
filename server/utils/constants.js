const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy'
};

const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
};

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video'
};

const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  PRIVATE_MESSAGE: 'privateMessage',
  GROUP_MESSAGE: 'groupMessage',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_DELIVERED: 'messageDelivered',
  MESSAGE_SEEN: 'messageSeen',
  USER_TYPING: 'userTyping',
  USER_STOPPED_TYPING: 'userStoppedTyping',
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  FRIEND_REQUEST_SENT: 'friendRequestSent',
  FRIEND_REQUEST_RECEIVED: 'friendRequestReceived',
  FRIEND_REQUEST_RESPONSE: 'friendRequestResponse',
  ONLINE_USERS_UPDATED: 'online_users_updated'
};

module.exports = {
  USER_STATUS,
  FRIEND_REQUEST_STATUS,
  MESSAGE_TYPES,
  SOCKET_EVENTS
};
