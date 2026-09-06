# Messaging Feature Development Plan

**Status**: Phases 1–2 complete. Feature is fully working with split-pane layout, conversation search, new-conversation dialog, date separators, read receipts, and 15-second auto-poll.

---

## Completed Work

### Phase 1: Critical Bug Fixes ✅ (Done)
| # | Bug | Fix | File |
|---|-----|-----|------|
| 1.1 | API paths pointed at `/messages` | All 4 paths → `/communication/send`, `/communication`, `/communication/conversation/:id`, `/communication/:id/mark-read` | `CommunicationHub.jsx` |
| 1.2 | `isMe` compared senderId to itself | `useAuth()` imported; `isMe = msg.senderId === authUser?.id` | `CommunicationHub.jsx` |
| 1.3 | Unread logic had same self-compare flaw | `isForMe = m.receiverId === authUser?.id` | `CommunicationHub.jsx` |
| 1.4 | Agent missing messages route | Added `<Route path="messages" element={<CommunicationHub />} />` in agent section | `App.jsx` (line 386) |
| 1.5 | Agent missing nav entry | Added `'messages'` to Agent pages array | `NavigationConfig.js` |

### Phase 2: Conversation UX Improvements ✅ (Done)
| # | Feature | Details |
|---|---------|---------|
| 2.1 | Split-pane layout | Sidebar (320px) + thread side-by-side on desktop; stacked on mobile ≤768px |
| 2.2 | Partner info | Avatar with initials, role-based styling |
| 2.3 | New conversation button | `+` button → modal dialog listing all other users; searches by name/email; click to start |
| 2.4 | Conversation search | Inline search filter on sidebar (shows when >3 conversations) |
| 2.5 | Date separators | `useMemo` groups messages with "Today", "Yesterday", or dated labels |

**Extras delivered:**
- Read receipt icons (single check / double check) on sent messages
- Relative time labels ("now", "5m", "2h") on conversation list
- Loading spinner animation
- Sending state guard (button disabled while post in-flight)
- 15-second polling interval on backend for new messages
- "No conversation selected" welcome state in thread pane
- Empty state with "Start a conversation" CTA

---

## Remaining (Future)

### Phase 3: Real-Time Messaging — Not Started
| # | Feature | Notes |
|---|---------|-------|
| 3.1 | WebSocket / SSE | Replace polling with true push. Backend communication module needs socket server. |
| 3.2 | Toast on incoming msg | Cross-page notification — requires CommunicationContext lift. |
| 3.3 | Typing indicator | Optional, low priority. |

### Phase 4: Admin Capabilities — Not Started
| # | Feature | Notes |
|---|---------|-------|
| 4.1 | Global inbox filter | Admin sees all conversations system-wide. |
| 4.2 | Filter sidebar | By user pair, date range, read status. |
| 4.3 | Soft delete | New `PATCH /communication/:id/delete` endpoint + UI. |
| 4.4 | CSV export | For admin reporting. |

---

## File Inventory (Updated)

### Modified
```
prms-frontend/src/
  components/CommunicationHub.jsx     # Full rewrite — all bugs fixed, split-pane, dialog, search, date groups
  components/CommunicationHub.css     # Full rewrite — split-pane, modal, responsive, date separator
  App.jsx                             # Added agent messages route (line 386)
  components/NavigationConfig.js      # Added 'messages' to Agent pages array
  config/routes.ts                    # Added agent.messages path
```

### Existing (untouched, working)
```
prms-backend/
  prisma/schema.prisma                          # Message model
  src/modules/communication/
    controller_communication.ts                 # 4 endpoints
    service_communication.ts                    # CRUD
    routes_communication.ts                     # mounted at /communication
```

### Not yet created (Phase 3–4)
```
  context/CommunicationContext.jsx              # global unread state, toast trigger
  hooks/useCommunication.js                     # centralized messaging + WS support
```

---

## Build Verification
- `npm run build` — 0 errors, 2441 modules, ✓ passed
- Backend `GET /health` — ok, db connected
- Backend `GET /communication` — 401 on bad token (route exists, auth active)
- All 4 communication endpoints wired and responding
