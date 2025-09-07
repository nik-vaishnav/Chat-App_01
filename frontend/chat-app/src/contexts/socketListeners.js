import { getId } from '../utils/utils';

export function setupSocketListeners({
  socket,
  notify,
  setIsConnected,
  setOnlineUsers,
  setMessages,
  setConversations,
  setCurrentConversation,
  setTypingUsers,
  setUnreadCounts,
  currentConversation,
  location,
}) {
  // Prevent duplicate listeners
  socket.removeAllListeners();

  // --- Connection Events ---
  socket.on('connect', () => {
    console.log('✅ Connected to socket server');
    setIsConnected(true);
    socket.emit('getOnlineUsers'); // Immediately request online users
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
    setIsConnected(false);
    setOnlineUsers([]); // Clear online users
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err);
    setIsConnected(false);
  });

  socket.on('authenticated', () => {
    console.log('🔐 Authenticated by server');
    socket.emit('getOnlineUsers');
  });

  // --- Online Users Events ---
  socket.on('onlineUsers', (users = []) => {
    console.log('🟢 Received online users:', users);
    if (!Array.isArray(users)) return;

    const transformed = users.map(user => ({
      userId: user.userId || user.id,
      name: user.name || user.username || 'Unknown',
      profile_pic: user.profile_pic,
      isOnline: user.isOnline !== false,
    }));

    setOnlineUsers(transformed);
  });

  socket.on('online_users_updated', (users = []) => {
    console.log('🔄 online_users_updated:', users);
    if (!Array.isArray(users)) {
      setOnlineUsers([]);
      return;
    }

    const transformed = users.map(user => ({
      userId: user.userId || user.id,
      name: user.name || user.username,
      profile_pic: user.profile_pic,
      isOnline: user.isOnline !== false,
    }));

    setOnlineUsers(transformed);
  });

  socket.on('userOnline', (user) => {
    setOnlineUsers(prev => {
      const exists = prev.find(u => u.userId === user.userId);
      return exists
        ? prev.map(u => u.userId === user.userId ? { ...u, ...user, isOnline: true } : u)
        : [...prev, { ...user, isOnline: true }];
    });
  });

  socket.on('userOffline', (user) => {
    setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId));
  });

  socket.on('userStatusUpdate', (user) => {
    setOnlineUsers(prev =>
      prev.map(u => u.userId === user.userId ? { ...u, ...user } : u)
    );
  });

  socket.on('friend_status_changed', (data) => {
    setOnlineUsers(prev =>
      prev.map(u => u.userId === data.userId ? { ...u, isOnline: data.isOnline } : u)
    );
  });

  socket.on('userProfileUpdate', (data) => {
    setOnlineUsers(prev =>
      prev.map(u => u.userId === data.userId ? { ...u, ...data } : u)
    );
  });

  // --- Friend Requests ---
  socket.on('friend_request_sent_ack', (data) => {
    notify('success', data.message || 'Friend request sent!');
  });

  socket.on('friend_request_received', ({ sender }) => {
    notify('info', `${sender.username} sent you a friend request.`);
  });

  socket.on('friend_request_responded', ({ responder, response }) => {
    notify('info', `${responder.username} ${response === 'accept' ? 'accepted' : 'rejected'} your friend request.`);
  });

  // --- Messaging Events ---
  socket.on('new_message', (msg) => {
    console.log('💬 New message:', msg);
    const { conversationId, tempId } = msg;

    setMessages(prev =>
      tempId
        ? prev.map(m => m.tempId === tempId ? msg : m)
        : [...prev, msg]
    );

    const isViewing =
      location.pathname === '/chat' &&
      currentConversation &&
      getId(currentConversation) === conversationId;

    if (!isViewing) {
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || 0) + 1,
      }));
    }
  });

  socket.on('messageDelivered', ({ messageId, deliveredAt }) => {
    setMessages(prev =>
      prev.map(msg =>
        getId(msg) === messageId
          ? { ...msg, delivered: true, deliveredAt }
          : msg
      )
    );
  });

  socket.on('messageSeenUpdate', ({ messageId, seenAt }) => {
    setMessages(prev =>
      prev.map(msg =>
        getId(msg) === messageId
          ? { ...msg, seen: true, seenAt }
          : msg
      )
    );
  });

  // --- Typing Events ---
  socket.on('userTyping', ({ conversationId, userId, isTyping }) => {
    setTypingUsers(prev => {
      const current = new Set(prev[conversationId] || []);
      isTyping ? current.add(userId) : current.delete(userId);
      return {
        ...prev,
        [conversationId]: Array.from(current),
      };
    });

    if (isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => {
          const current = new Set(prev[conversationId] || []);
          current.delete(userId);
          return {
            ...prev,
            [conversationId]: Array.from(current),
          };
        });
      }, 3000);
    }
  });

  // --- Conversations ---
  socket.on('conversationCreated', (conversation) => {
    console.log('🗨️ Conversation created:', conversation);
    setConversations(prev => [conversation, ...prev]);
  });

  socket.on('conversationUpdated', (updatedConv) => {
    setConversations(prev =>
      prev.map(conv =>
        getId(conv) === getId(updatedConv) ? updatedConv : conv
      )
    );
  });

  socket.on('conversationDeleted', (conversationId) => {
    setConversations(prev =>
      prev.filter(conv => getId(conv) !== conversationId)
    );
    setCurrentConversation(prev =>
      prev && getId(prev) === conversationId ? null : prev
    );
  });

  // --- Error Handling ---
  socket.on('error', (err) => {
    console.error('🚨 Socket error:', err);
    notify('error', 'Socket error occurred.');
  });

  // --- Optional Debug ---
  socket.emit = new Proxy(socket.emit, {
    apply(target, thisArg, args) {
      console.log('📤 Emit:', args[0], args.slice(1));
      return Reflect.apply(target, thisArg, args);
    },
  });

  socket.onAny((event, ...args) => {
    console.log('📥 Incoming:', event, ...args);
  });
}