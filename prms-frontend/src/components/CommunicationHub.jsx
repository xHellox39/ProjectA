import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  Send,
  MessageCircle,
  Search,
  Plus,
  X,
  ChevronLeft,
  Clock,
  Check,
  CheckCheck,
} from 'lucide-react';
import './CommunicationHub.css';

/* ──── helpers ──── */

function dateLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) return 'Today';
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return dateLabel(dateStr);
}

/* ──── New Conversation Dialog ──── */

function NewConversationDialog({ open, onClose, onSelect, currentUser }) {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiClient.get('/users')
      .then((res) => {
        const all = res.data?.data ?? [];
        setUsers(all.filter((u) => u.id !== currentUser?.id));
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = useMemo(() =>
    users.filter((u) =>
      (u.full_name || '').toLowerCase().includes(query.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(query.toLowerCase())
    ), [users, query]);

  if (!open) return null;

  return (
    <motion.div
      className="comm-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="comm-modal"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="comm-modal-header">
          <h3>Start New Conversation</h3>
          <button className="comm-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <input
          className="comm-modal-search"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="comm-modal-list">
          {loading ? <p className="comm-modal-empty">Loading…</p> : filtered.length === 0 ? (
            <p className="comm-modal-empty">No users found</p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                className="comm-modal-user"
                onClick={() => { onSelect(u); onClose(); }}
              >
                <div className="comm-avatar">{(u.full_name || '?')[0].toUpperCase()}</div>
                <div className="comm-modal-user-info">
                  <div className="comm-modal-user-name">{u.full_name || 'User'}</div>
                  <div className="comm-modal-user-email">{u.email}</div>
                </div>
                <span className="comm-modal-user-role">{u.role}</span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──── Main Hub ──── */

function CommunicationHub() {
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  /* ── Load all conversations on mount ── */
  useEffect(() => {
    loadConversations();
    // Poll for new messages every 15s
    const id = setInterval(loadConversations, 15000);
    return () => clearInterval(id);
  }, []);

  /* ── Load messages when conversation changes ── */
  useEffect(() => {
    if (selectedConv) loadMessages();
  }, [selectedConv]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    try {
      const res = await apiClient.get('/communication');
      const msgs = res.data?.data ?? [];
      const convMap = {};
      msgs.forEach((m) => {
        const cid = m.conversationId;
        const isForMe = m.receiverId === authUser?.id;
        if (!convMap[cid]) {
          const partner = m.senderId === authUser?.id ? m.receiver : m.sender;
          convMap[cid] = {
            id: cid,
            partner: partner || { full_name: 'User', id: 'unknown' },
            lastMessage: m.content.substring(0, 60),
            lastAt: m.created_at,
            unread: isForMe && !m.isRead ? 1 : 0,
          };
        } else {
          if (isForMe && !m.isRead) convMap[cid].unread += 1;
        }
      });
      setConversations(
        Object.values(convMap).sort(
          (a, b) => new Date(b.lastAt) - new Date(a.lastAt)
        )
      );
    } catch (e) { console.error('loadConversations', e); }
    finally { setLoading(false); }
  }

  async function loadMessages() {
    try {
      const res = await apiClient.get(`/communication/conversation/${selectedConv.id}`);
      const allMsgs = res.data?.data ?? [];
      setMessages(allMsgs);
      // Mark unread as read
      const unread = allMsgs.filter((m) => !m.isRead && m.receiverId === authUser?.id);
      await Promise.all(
        unread.map((m) => apiClient.patch(`/communication/${m.id}/mark-read`))
      );
      setConversations((prev) =>
        prev.map((c) => c.id === selectedConv.id ? { ...c, unread: 0 } : c)
      );
    } catch (e) { console.error('loadMessages', e); }
  }

  async function handleSend() {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await apiClient.post('/communication/send', {
        content: newMessage,
        conversationId: selectedConv.id,
        receiverId: selectedConv.partner.id,
      });
      setNewMessage('');
      await loadMessages();
    } catch (e) { console.error('handleSend', e); }
    finally { setSending(false); }
  }

  function handleNewConversation(partner) {
    const cid = `conv-${authUser?.id}-${partner.id}`;
    // Check if conversation already exists
    const existing = conversations.find((c) => c.id === cid);
    if (existing) {
      setSelectedConv(existing);
      return;
    }
    setSelectedConv({
      id: cid,
      partner: { id: partner.id, full_name: partner.full_name },
      lastMessage: '',
      lastAt: new Date().toISOString(),
      unread: 0,
    });
    setMessages([]);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  /* Group messages with date separators */
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastLabel = '';
    messages.forEach((msg) => {
      const label = dateLabel(msg.created_at);
      if (label !== lastLabel) {
        lastLabel = label;
        groups.push({ type: 'separator', label });
      }
      groups.push({ type: 'message', data: msg });
    });
    return groups;
  }, [messages]);

  /* Filtered conversations for sidebar search */
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      (c.partner?.full_name || '').toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  /* ── Date Separator Component ── */
  const DateSeparator = ({ label }) => (
    <div className="comm-date-separator">
      <span className="comm-date-label">{label}</span>
    </div>
  );

  /* ── Render ── */
  if (loading && conversations.length === 0)
    return <div className="comm-loading"><Clock size={24} className="comm-spin" /> <span>Loading messages…</span></div>;

  return (
    <div className="communication-hub">
      {/* ── Sidebar ── */}
      <div className="comm-sidebar">
        <div className="comm-sidebar-header">
          <h2 className="comm-title">Messages</h2>
          <button
            className="comm-new-btn"
            title="New conversation"
            onClick={() => setShowNewDialog(true)}
          >
            <Plus size={18} />
          </button>
        </div>

        {conversations.length > 3 && (
          <div className="comm-search-wrap">
            <Search size={14} className="comm-search-icon" />
            <input
              className="comm-search-input"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="comm-list">
          {filteredConversations.length === 0 ? (
            <div className="comm-empty">
              <MessageCircle size={32} className="comm-empty-icon" />
              <p>{searchQuery ? 'No match found' : 'No conversations yet'}</p>
              {!searchQuery && (
                <button
                  className="comm-start-first"
                  onClick={() => setShowNewDialog(true)}
                >
                  Start a conversation
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                className={`comm-list-item ${selectedConv?.id === conv.id ? 'comm-list-active' : ''}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedConv(conv)}
              >
                <div className="comm-avatar">
                  {conv.partner?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="comm-list-content">
                  <div className="comm-list-header">
                    <span className="comm-list-name">
                      {conv.partner?.full_name || 'User'}
                    </span>
                    <span className="comm-list-time">
                      {relativeTime(conv.lastAt)}
                    </span>
                  </div>
                  <div className="comm-list-preview">{conv.lastMessage}</div>
                </div>
                {conv.unread > 0 && (
                  <span className="comm-unread-badge">{conv.unread}</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── Thread ── */}
      <div className="comm-thread">
        {!selectedConv ? (
          <div className="comm-no-thread">
            <MessageCircle size={56} className="comm-no-thread-icon" />
            <p>Select a conversation</p>
            <button
              className="comm-start-first"
              onClick={() => setShowNewDialog(true)}
            >
              Or start a new one
            </button>
          </div>
        ) : (
          <>
            <div className="comm-thread-header">
              <button
                className="comm-back-btn comm-desktop-hidden"
                onClick={() => setSelectedConv(null)}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="comm-thread-avatar">
                {selectedConv.partner?.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="comm-thread-info">
                <span className="comm-thread-name">
                  {selectedConv.partner?.full_name || 'User'}
                </span>
              </div>
            </div>

            <div className="comm-messages">
              <AnimatePresence>
                {groupedMessages.map((item, idx) => {
                  if (item.type === 'separator')
                    return <DateSeparator key={`sep-${idx}`} label={item.label} />;
                  const msg = item.data;
                  const isMe = msg.senderId === authUser?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      className={`comm-msg-bubble ${isMe ? 'comm-msg-mine' : 'comm-msg-theirs'}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="comm-msg-text">{msg.content}</div>
                      <div className="comm-msg-time">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && (
                          <span className={`comm-read-icon comm-read-${msg.isRead ? 'read' : 'sent'}`}>
                            {msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="comm-input-row">
              <input
                type="text"
                className="comm-input"
                placeholder="Type a message…"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={`comm-send-btn ${sending ? 'comm-send-btn-loading' : ''}`}
                onClick={handleSend}
                disabled={sending}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── New conversation dialog ── */}
      <AnimatePresence>
        {showNewDialog && (
          <NewConversationDialog
            open
            currentUser={authUser}
            onClose={() => setShowNewDialog(false)}
            onSelect={handleNewConversation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CommunicationHub;
