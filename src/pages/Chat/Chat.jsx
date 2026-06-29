import React, { useState, useEffect, useRef } from 'react';
import { chatApi, profilesApi, miscApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Users, Send, Sparkles, Plus, PlusCircle, Trash, Trash2, LogOut, UserMinus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/css/Chat.css';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { type: 'one-on-one'|'group', data: ... }
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // Group creation modal state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  // AI assistant loading
  const [rewriting, setRewriting] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatData();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages();
      // Setup simple polling every 5s for active messages to make it feel alive!
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async () => {
    setLoading(true);
    try {
      const resConversations = await chatApi.getConversations();
      if (resConversations.data) {
        setConversations(resConversations.data);
      }

      const resGroups = await chatApi.getGroupChats();
      if (resGroups.data) {
        setGroupChats(resGroups.data);
      }

      // Fetch friends for group modal
      const friendsRes = await profilesApi.getFriendsList();
      if (friendsRes.data) {
        setFriendsList(friendsRes.data);
      }
    } catch (err) {
      console.error('Error fetching chats', err);
      toast.error('Failed to load active chats list');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!activeChat) return;
    try {
      if (activeChat.type === 'one-on-one') {
        const res = await chatApi.getConversationMessages(activeChat.data.id);
        if (res.data) setMessages(res.data);
      } else {
        const res = await chatApi.getGroupChatMessages(activeChat.data.id);
        if (res.data) setMessages(res.data);
      }
    } catch (err) {
      console.error('Error loading messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText;
    setInputText('');

    try {
      if (activeChat.type === 'one-on-one') {
        await chatApi.createMessage(activeChat.data.id, { message: { body: messageContent } });
      } else {
        await chatApi.createGroupChatMessage(activeChat.data.id, { group_chat_message: { body: messageContent } });
      }
      loadMessages();
    } catch (err) {
      toast.error('Failed to send message');
      setInputText(messageContent); // Restore text on failure
    }
  };

  const handleAiRewrite = async () => {
    if (!inputText.trim()) {
      toast.error('Enter some text first for the AI assistant to optimize');
      return;
    }
    setRewriting(true);
    try {
      const res = await miscApi.rewriteMessage({ text: inputText });
      if (res.data) {
        setInputText(res.data.rewritten_text || res.data.text || res.data);
        toast.success('Optimized by Sangam-AI!');
      }
    } catch (err) {
      toast.error('AI features are currently offline');
    } finally {
      setRewriting(false);
    }
  };

  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedFriends.length === 0) {
      toast.error('Enter group name and select at least 1 companion');
      return;
    }

    try {
      // Create group chat with selected members
      const res = await chatApi.createGroupChat({ 
        group_chat: {
          name: groupName, 
          user_ids: selectedFriends 
        } 
      });
      if (res.data) {
        toast.success(`Group "${groupName}" initialized`);
        setShowCreateGroup(false);
        setGroupName('');
        setSelectedFriends([]);
        loadChatData();
      }
    } catch (err) {
      toast.error('Failed to initialize group chat');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Do you wish to leave this group chat?')) return;
    try {
      await chatApi.leaveGroupChat(groupId);
      toast.success('Left group chat');
      setActiveChat(null);
      setMessages([]);
      loadChatData();
    } catch (err) {
      toast.error('Failed to leave group');
    }
  };

  const handleFriendSelection = (id) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleAddMember = async (userId) => {
    try {
      await chatApi.addGroupChatMember(activeChat.data.id, userId);
      toast.success('Member added successfully');
      loadMessages();
    } catch (err) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await chatApi.removeGroupChatMember(activeChat.data.id, userId);
      toast.success('Member removed successfully');
      loadMessages();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="chat-page-container">
      <div className="chat-layout-wrapper glass">
        
        {/* Left Side: Chats Directory */}
        <aside className="chat-directory-sidebar">
          <div className="sidebar-header">
            <h3>Chats</h3>
            <button onClick={() => setShowCreateGroup(true)} className="create-group-btn" title="Create Group Chat">
              <Plus size={18} />
            </button>
          </div>

          <div className="directory-scroll-area">
            
            {/* 1-on-1 Conversations */}
            <div className="directory-section">
              <span className="section-title">Direct Messages</span>
              {conversations.length > 0 ? (
                conversations.map(conv => {
                  const counterpart = conv.user1?.id === user.id ? conv.user2 : conv.user1;
                  return (
                    <div 
                      key={conv.id} 
                      onClick={() => setActiveChat({ type: 'one-on-one', data: conv, recipient: counterpart })}
                      className={`directory-item ${activeChat?.type === 'one-on-one' && activeChat.data.id === conv.id ? 'active' : ''}`}
                    >
                      <img 
                        src={counterpart?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"} 
                        alt="Avatar" 
                        className="item-avatar"
                      />
                      <div className="item-info">
                        <div className="item-name-row">
                          <h4 className="item-name">{counterpart?.name}</h4>
                        </div>
                        <p className="item-preview">{conv.last_message_body || 'No messages yet'}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="empty-section-txt">No active conversations</p>
              )}
            </div>

            {/* Group Chats */}
            <div className="directory-section">
              <span className="section-title">Group Channels</span>
              {groupChats.length > 0 ? (
                groupChats.map(g => (
                  <div 
                    key={g.id} 
                    onClick={() => setActiveChat({ type: 'group', data: g })}
                    className={`directory-item ${activeChat?.type === 'group' && activeChat.data.id === g.id ? 'active' : ''}`}
                  >
                    <div className="group-icon-bubble">
                      <Users size={18} />
                    </div>
                    <div className="item-info">
                      <h4 className="item-name">{g.name}</h4>
                      <p className="item-preview">Group Channel</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-section-txt">No active groups</p>
              )}
            </div>

          </div>
        </aside>

        {/* Right Side: Conversation Area */}
        <main className="chat-window-container">
          {activeChat ? (
            <div className="chat-window-wrapper">
              
              {/* Header */}
              <div className="chat-window-header">
                <div className="header-chat-details">
                  {activeChat.type === 'one-on-one' ? (
                    <>
                      <img 
                        src={activeChat.recipient?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"} 
                        alt="Avatar" 
                        className="header-avatar"
                      />
                      <div>
                        <h4>{activeChat.recipient?.name}</h4>
                        <span className="header-status">1-on-1 Encrypted</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="group-header-icon">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4>{activeChat.data.name}</h4>
                        <span className="header-status">Group Room</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="header-chat-actions">
                  {activeChat.type === 'group' && (
                    <button onClick={() => handleLeaveGroup(activeChat.data.id)} className="leave-group-btn" title="Leave Group">
                      <LogOut size={16} /> Leave Group
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Panel */}
              <div className="chat-messages-panel">
                {messages.length > 0 ? (
                  messages.map(msg => {
                    const isOwn = msg.user_id === user.id || msg.sender?.id === user.id;
                    const senderName = isOwn ? 'You' : (msg.sender?.name || msg.user?.name || 'User');
                    return (
                      <div key={msg.id} className={`chat-message-bubble-wrapper ${isOwn ? 'own' : 'recipient'}`}>
                        {!isOwn && (
                          <span className="sender-label">{senderName}</span>
                        )}
                        <div className="message-bubble">
                          <p>{msg.body}</p>
                          <span className="message-timestamp">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="chat-messages-empty">
                    <MessageSquare size={36} />
                    <p>No transmissions logged. Send a message to start!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="chat-input-row">
                <button type="button" onClick={handleAiRewrite} disabled={rewriting} className="ai-rewrite-btn" title="AI Rewrite Message">
                  <Sparkles size={16} /> {rewriting ? 'Optimizing...' : 'AI Rewrite'}
                </button>
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="chat-message-input"
                />
                <button type="submit" className="glow-btn chat-send-btn">
                  <Send size={16} />
                </button>
              </form>

            </div>
          ) : (
            <div className="chat-window-placeholder">
              <MessageSquare size={52} />
              <h3>Select a Conversation</h3>
              <p>Establish a secure link from the sidebar, or create a group chat.</p>
            </div>
          )}
        </main>

      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Group Chat</h3>
              <button onClick={() => setShowCreateGroup(false)} className="modal-close-btn">
                Close
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="modal-form-scroll">
              <div className="form-group">
                <label>Group Name</label>
                <input 
                  type="text" 
                  value={groupName} 
                  onChange={(e) => setGroupName(e.target.value)} 
                  placeholder="e.g. Code Collaborators"
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Friends to Add</label>
                <div className="friends-checklist-container">
                  {friendsList.length > 0 ? (
                    friendsList.map(friend => (
                      <div 
                        key={friend.id} 
                        onClick={() => handleFriendSelection(friend.id)}
                        className={`friend-check-item ${selectedFriends.includes(friend.id) ? 'selected' : ''}`}
                      >
                        <img 
                          src={friend.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"} 
                          alt="Friend Avatar" 
                        />
                        <span>{friend.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-friends-txt">No friends found to start a group chat. Add some friends first!</p>
                  )}
                </div>
              </div>

              <button type="submit" className="glow-btn modal-submit-btn">Initialize Group</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
