<template>
  <div class="chat-root">

    <!-- ══════════════════════════════════════════════════════════
         SIDEBAR — Contacts grouped by person
    ══════════════════════════════════════════════════════════ -->
    <aside class="chat-sidebar" :class="{ 'sidebar-hidden': activeRoomId && !showRoomList }">

      <!-- Header -->
      <div class="sidebar-header">
        <div class="sidebar-header-left">
          <h1 class="sidebar-title">Messages</h1>
          <div class="sidebar-meta">
            <span v-if="chatStore.totalUnread > 0" class="unread-pill">
              {{ chatStore.totalUnread }} new
            </span>
            <span v-else class="sidebar-meta-text">All conversations</span>
          </div>
        </div>
        <div class="sidebar-header-actions">
          <!-- connection managed silently -->
        </div>
      </div>

      <!-- Search -->
      <div class="sidebar-search">
        <div class="search-wrap">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="roomSearch" type="text" placeholder="Search people or chats…" class="search-input" />
          <button v-if="roomSearch" class="search-clear" @click="roomSearch = ''">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contact list -->
      <div class="contact-list">

        <!-- Loading skeletons -->
        <template v-if="chatStore.roomsLoading && !chatStore.groupedContacts.length">
          <div v-for="i in 4" :key="i" class="contact-skeleton">
            <div class="skeleton-avatar" />
            <div class="skeleton-lines">
              <div class="skeleton-line" style="width: 60%;" />
              <div class="skeleton-line" style="width: 80%; height: 10px; margin-top: 6px;" />
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else-if="!filteredContacts.length" class="contact-empty">
          <div class="empty-icon"><i class="fa-regular fa-comments"></i></div>
          <p class="empty-title">{{ roomSearch ? 'No results found' : 'No conversations yet' }}</p>
          <p class="empty-sub">{{ roomSearch ? 'Try a different name or keyword' : 'Start by bidding or posting an errand' }}</p>
        </div>

        <!-- Contact groups -->
        <template v-else>
          <div
            v-for="contact in filteredContacts"
            :key="contact.contactId"
            class="contact-group"
            :class="{ 'is-expanded': expandedContactId === contact.contactId }"
          >
            <!-- Contact row -->
            <button
              class="contact-row"
              :class="{ 'contact-active': activeContact?.contactId === contact.contactId }"
              @click="handleContactClick(contact)"
            >
              <!-- Avatar -->
              <div class="contact-avatar-wrap">
                <img
                  v-if="contact.otherParty?.avatar"
                  :src="contact.otherParty.avatar"
                  :alt="contact.otherParty.firstName"
                  class="contact-avatar"
                />
                <div v-else class="contact-avatar-fallback">
                  {{ initials(contact.otherParty) }}
                </div>
                <!-- Unread ring -->
                <div v-if="contact.totalUnread > 0" class="avatar-unread-ring" />
              </div>

              <!-- Info -->
              <div class="contact-info">
                <div class="contact-info-top">
                  <span class="contact-name">
                    {{ contact.otherParty?.firstName }} {{ contact.otherParty?.lastName }}
                  </span>
                  <span class="contact-time">
                    {{ chatStore.formatRoomTime(contact.lastActivity) }}
                  </span>
                </div>
                <div class="contact-info-bottom">
                  <span class="contact-context" v-if="contact.lastContextTitle">
                    {{ contact.lastContextTitle }}
                  </span>
                </div>
                <p v-if="contact.lastMessage" class="contact-preview" :class="{ 'preview-unread': contact.totalUnread > 0 }">
                  <span v-if="contact.lastMessage.senderId === currentUserId" class="preview-you">You · </span>{{ contact.lastMessage.content }}
                </p>
                <p v-else class="contact-preview preview-empty">No messages yet</p>
              </div>

              <!-- Trailing -->
              <div class="contact-trailing">
                <span v-if="contact.totalUnread > 0" class="unread-badge">
                  {{ contact.totalUnread > 99 ? '99+' : contact.totalUnread }}
                </span>
                <svg
                  v-if="contact.rooms.length > 1"
                  class="chevron-icon"
                  :class="{ 'chevron-open': expandedContactId === contact.contactId }"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <!-- Sub-rooms (for multi-room contacts) -->
            <Transition name="sub-rooms">
              <div v-if="contact.rooms.length > 1 && expandedContactId === contact.contactId" class="sub-rooms">
                <button
                  v-for="room in contact.rooms"
                  :key="room.roomId"
                  class="sub-room-row"
                  :class="{ 'sub-room-active': activeRoomId === room.roomId }"
                  @click.stop="openRoom(room)"
                >
                  <i :class="['sub-room-icon', chatStore.getRoomTypeIcon(room.roomType)]"></i>
                  <div class="sub-room-info">
                    <span class="sub-room-title">{{ room.contextTitle }}</span>
                    <span class="sub-room-type">{{ chatStore.getRoomTypeLabel(room.roomType) }}</span>
                  </div>
                  <span v-if="room.unreadCount > 0" class="sub-room-badge">{{ room.unreadCount }}</span>
                  <span v-if="activeRoomId === room.roomId" class="sub-room-active-dot" />
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </aside>

    <!-- ══════════════════════════════════════════════════════════
         CHAT WINDOW
    ══════════════════════════════════════════════════════════ -->
    <main
      class="chat-main"
      :class="{ 'chat-main-visible': activeRoomId || !showRoomList }"
      :style="swipeDragStyle"
      @touchstart.passive="onSwipeStart"
      @touchmove.passive="onSwipeMove"
      @touchend.passive="onSwipeEnd"
    >
      <!-- Empty / no room selected -->
      <div v-if="!activeRoomId" class="chat-empty">
        <div class="chat-empty-inner">
          <div class="chat-empty-icon">
            <span><i class="fa-regular fa-comments"></i></span>
          </div>
          <h2 class="chat-empty-title">Pick up where you left off</h2>
          <p class="chat-empty-sub">Select a conversation from your inbox to start messaging.</p>
        </div>
      </div>

      <!-- Active conversation -->
      <template v-else-if="activeRoom">

        <!-- ── Chat Header ── -->
        <header class="chat-header">
          <!-- Back (mobile) -->
          <button class="back-btn" @click="backToList">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Avatar -->
          <div class="header-avatar-wrap">
            <img
              v-if="activeRoom.otherParty?.avatar"
              :src="activeRoom.otherParty.avatar"
              :alt="activeRoom.otherParty.firstName"
              class="header-avatar"
            />
            <div v-else class="header-avatar-fallback">{{ initials(activeRoom.otherParty) }}</div>
            <!-- Live indicator -->
            <div v-if="chatStore.socketConnected" class="header-online-dot" />
          </div>

          <!-- Name + context -->
          <div class="header-info">
            <p class="header-name">
              {{ activeRoom.otherParty?.firstName }} {{ activeRoom.otherParty?.lastName }}
            </p>
            <p class="header-sub">
              <i :class="chatStore.getRoomTypeIcon(activeRoom.roomType)" class="header-sub-icon"></i>
              <span>{{ activeRoom.contextTitle }}</span>
              <span v-if="activeRoom.isLocked" class="header-locked">
                <i class="fa-solid fa-lock"></i> Locked
              </span>
            </p>
          </div>
        </header>

        <!-- ── Thread bar — own row, always visible when multi-room ── -->
        <div v-if="siblingRooms.length > 1" class="thread-bar">
          <div class="thread-bar-inner">
            <button
              v-for="room in siblingRooms"
              :key="room.roomId"
              class="thread-chip"
              :class="{ 'thread-chip-active': activeRoomId === room.roomId }"
              @click="openRoom(room)"
            >
              <i :class="chatStore.getRoomTypeIcon(room.roomType)"></i>
              <span class="thread-chip-label">{{ room.contextTitle }}</span>
              <span v-if="room.unreadCount > 0" class="thread-chip-badge">{{ room.unreadCount }}</span>
            </button>
          </div>
        </div>

        <!-- ── Messages area ── -->
        <div ref="messagesEl" class="messages-area">

          <!-- Load more -->
          <div v-if="chatStore.activeHasMore" class="load-more-wrap">
            <button class="load-more-btn" :disabled="chatStore.activeMessagesLoading" @click="loadMore">
              <svg v-if="chatStore.activeMessagesLoading" class="h-3.5 w-3.5 spin mr-1.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <i v-if="!chatStore.activeMessagesLoading" class="fa-solid fa-arrow-up mr-1.5"></i>
              {{ chatStore.activeMessagesLoading ? 'Loading…' : 'Load earlier' }}
            </button>
          </div>

          <!-- Message skeletons -->
          <template v-if="chatStore.activeMessagesLoading && !chatStore.activeMessages.length">
            <div v-for="i in 7" :key="i" class="msg-skeleton" :class="i % 3 === 0 ? 'msg-skeleton-own' : ''">
              <div class="skeleton-bubble" :style="{ width: `${80 + i * 18}px` }" />
            </div>
          </template>

          <!-- Empty state -->
          <div v-else-if="!chatStore.activeMessages.length" class="messages-empty">
            <div class="messages-empty-icon"><i class="fa-solid fa-paper-plane"></i></div>
            <p class="messages-empty-title">Start the conversation</p>
            <p class="messages-empty-sub">Say hello to {{ activeRoom.otherParty?.firstName }}</p>
          </div>

          <!-- Messages grouped by date -->
          <template v-else>
            <template v-for="(group, gi) in groupedMessages" :key="gi">
              <!-- Date separator -->
              <div class="date-separator">
                <div class="date-line" />
                <span class="date-label">{{ group.date }}</span>
                <div class="date-line" />
              </div>

              <!-- Message bubbles -->
              <div
                v-for="(msg, mi) in group.messages"
                :key="msg._id || msg.id"
                class="msg-row"
                :class="isOwn(msg) ? 'msg-row-own' : 'msg-row-other'"
              >
                <!-- Other party avatar -->
                <div v-if="!isOwn(msg)" class="msg-avatar-slot">
                  <img
                    v-if="shouldShowAvatar(group.messages, mi) && activeRoom.otherParty?.avatar"
                    :src="activeRoom.otherParty.avatar"
                    :alt="activeRoom.otherParty.firstName"
                    class="msg-avatar"
                  />
                  <div v-else-if="shouldShowAvatar(group.messages, mi)" class="msg-avatar-fallback">
                    {{ initials(activeRoom.otherParty) }}
                  </div>
                  <div v-else class="msg-avatar-spacer" />
                </div>

                <div class="msg-col" :class="isOwn(msg) ? 'msg-col-own' : 'msg-col-other'">

                  <!-- Quoted reply preview (shows actual replied-to content) -->
                  <div
                    v-if="msg.replyToId"
                    class="reply-quote"
                    :class="isOwn(msg) ? 'reply-quote-own' : 'reply-quote-other'"
                  >
                    <div class="reply-quote-bar" />
                    <div class="reply-quote-body">
                      <span class="reply-quote-name">
                        {{ isOwn(findMessage(msg.replyToId)) ? 'You' : activeRoom.otherParty?.firstName }}
                      </span>
                      <span class="reply-quote-text">
                        {{ findMessage(msg.replyToId)?.content || 'Message not found' }}
                      </span>
                    </div>
                  </div>

                  <!-- Bubble + hover reply button wrapper -->
                  <div
                    class="bubble-wrap"
                    :class="isOwn(msg) ? 'bubble-wrap-own' : 'bubble-wrap-other'"
                  >
                    <!-- Reply button — desktop hover -->
                    <button
                      v-if="!msg.isDeleted"
                      class="reply-hover-btn"
                      :class="isOwn(msg) ? 'reply-hover-btn-own' : 'reply-hover-btn-other'"
                      @click.stop="setReply(msg)"
                      title="Reply"
                    >
                      <i class="fa-solid fa-reply"></i>
                    </button>

                    <!-- Bubble -->
                    <div
                      class="msg-bubble"
                      :class="[
                        isOwn(msg) ? 'bubble-own' : 'bubble-other',
                        msg.isDeleted ? 'bubble-deleted' : '',
                        isLastInRun(group.messages, mi) ? (isOwn(msg) ? 'bubble-tail-own' : 'bubble-tail-other') : ''
                      ]"
                      @contextmenu.prevent="openContextMenu(msg, $event)"
                      @touchstart.passive="onBubbleTouchStart(msg, $event)"
                      @touchend.passive="onBubbleTouchEnd"
                      @touchmove.passive="onBubbleTouchMove"
                    >
                      <p class="bubble-text">{{ msg.isDeleted ? 'This message was deleted' : msg.content }}</p>
                    </div>
                  </div>

                  <!-- Meta -->
                  <div class="msg-meta" :class="isOwn(msg) ? 'msg-meta-own' : 'msg-meta-other'">
                    <span class="meta-time">{{ chatStore.formatMessageTime(msg.createdAt) }}</span>
                    <span v-if="msg.isEdited" class="meta-edited">· edited</span>
                    <!-- Delivery ticks -->
                    <span
                      v-if="isOwn(msg)"
                      class="meta-ticks"
                      :class="{
                        'ticks-read': msg.deliveryStatus === 'read' || msg.readAt,
                      }"
                    >
                      <template v-if="msg.deliveryStatus === 'read' || msg.readAt">
                        <i class="fa-solid fa-check-double"></i>
                      </template>
                      <template v-else-if="msg._id || msg.id">
                        <i class="fa-solid fa-check-double"></i>
                      </template>
                      <template v-else>
                        <i class="fa-solid fa-check"></i>
                      </template>
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </template>

          <!-- Typing indicator -->
          <div v-if="chatStore.activeTyping" class="typing-row">
            <img
              v-if="activeRoom.otherParty?.avatar"
              :src="activeRoom.otherParty.avatar"
              class="msg-avatar"
              :alt="activeRoom.otherParty.firstName"
            />
            <div v-else class="msg-avatar-fallback">{{ initials(activeRoom.otherParty) }}</div>
            <div class="typing-bubble">
              <span class="typing-dot" />
              <span class="typing-dot" />
              <span class="typing-dot" />
            </div>
          </div>

          <!-- Scroll anchor -->
          <div ref="bottomEl" class="scroll-anchor" />
        </div>

        <!-- ── Reply preview bar ── -->
        <Transition name="reply-bar">
          <div v-if="replyTo" class="reply-bar-wrap">
            <div class="reply-bar-inner">
              <div class="reply-accent-bar" />
              <div class="reply-bar-body">
                <span class="reply-bar-label">Replying to</span>
                <p class="reply-bar-text">{{ replyTo.content }}</p>
              </div>
            </div>
            <button class="reply-close" @click="replyTo = null">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </Transition>

        <!-- ── Input bar (or locked notice) ── -->
        <div v-if="activeRoom.isLocked" class="locked-bar">
          <i class="fa-solid fa-lock locked-bar-icon"></i>
          <span>This conversation is locked and no longer accepts messages.</span>
        </div>
        <div v-else class="input-bar">
          <div class="input-wrap" :class="{ 'input-focused': inputFocused }">
            <textarea
              ref="inputEl"
              v-model="messageInput"
              rows="1"
              placeholder="Message…"
              class="message-input"
              @keydown.enter.exact.prevent="handleSend"
              @keydown.enter.shift.exact="messageInput += '\n'"
              @focus="inputFocused = true"
              @blur="inputFocused = false"
              @input="autoResize"
            />
          </div>
          <button
            class="send-btn"
            :class="{ 'send-btn-ready': messageInput.trim() && !chatStore.actionLoading }"
            :disabled="!messageInput.trim() || chatStore.actionLoading"
            @click="handleSend"
          >
            <svg v-if="!chatStore.actionLoading" class="send-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg v-else class="h-4 w-4 spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </button>
        </div>

      </template>
    </main>

    <ToastContainer />

    <!-- ── Mobile long-press action sheet ── -->
    <Transition name="action-sheet">
      <div v-if="actionSheetMsg" class="action-sheet-backdrop" @click="actionSheetMsg = null">
        <div class="action-sheet" @click.stop>
          <div class="action-sheet-handle" />
          <div class="action-sheet-preview">
            <span class="action-sheet-preview-name">
              {{ isOwn(actionSheetMsg) ? 'You' : activeRoom?.otherParty?.firstName }}
            </span>
            <p class="action-sheet-preview-text">{{ actionSheetMsg.content }}</p>
          </div>
          <div class="action-sheet-divider" />
          <button class="action-sheet-btn" @click="setReply(actionSheetMsg); actionSheetMsg = null">
            <i class="fa-solid fa-reply action-sheet-btn-icon"></i>
            Reply
          </button>
          <button class="action-sheet-btn" @click="copyMessage(actionSheetMsg); actionSheetMsg = null">
            <i class="fa-regular fa-copy action-sheet-btn-icon"></i>
            Copy text
          </button>
          <button class="action-sheet-btn action-sheet-btn-cancel" @click="actionSheetMsg = null">
            Cancel
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Desktop right-click context menu ── -->
    <Transition name="ctx-menu">
      <div
        v-if="contextMenu.msg"
        class="ctx-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @click.stop
      >
        <button class="ctx-menu-item" @click="setReply(contextMenu.msg); contextMenu.msg = null">
          <i class="fa-solid fa-reply"></i> Reply
        </button>
        <button class="ctx-menu-item" @click="copyMessage(contextMenu.msg); contextMenu.msg = null">
          <i class="fa-regular fa-copy"></i> Copy
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import { useAuthStore } from "@/stores/authStore";  // ← FIX: import authStore for token
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/reusables/ToastContainer.vue";

const route     = useRoute();
const chatStore = useChatStore();
const userStore = useUserStore();
const authStore = useAuthStore();  // ← FIX: use authStore for token
const toast     = useToast();

const currentUserId = computed(() => userStore.user?._id || null);

// ── FIX: token lives on authStore.accessToken, NOT userStore ──────────
// userStore.token / userStore.user?.token do not exist and return undefined,
// which causes connectSocket() to connect unauthenticated — works in local dev
// because the server may accept it, but fails silently in production.
const authToken = computed(() => authStore.accessToken || null);

// ── Refs ──────────────────────────────────────────────────────
const roomSearch    = ref("");
const messageInput  = ref("");
const replyTo       = ref(null);
const messagesEl    = ref(null);
const bottomEl      = ref(null);
const inputEl       = ref(null);
const inputFocused  = ref(false);
const showRoomList  = ref(true);

const expandedContactId = ref(null);

let longPressTimer    = null;
const actionSheetMsg  = ref(null);
const contextMenu     = reactive({ msg: null, x: 0, y: 0 });
let bubbleTouchMoved  = false;

// ── Swipe-to-go-back ─────────────────────────────────────────
const swipeStartX   = ref(0);
const swipeStartY   = ref(0);
const swipeDeltaX   = ref(0);
const swipeActive   = ref(false);
const SWIPE_THRESHOLD  = 72;
const SWIPE_EDGE_ZONE  = 40;

const swipeDragStyle = computed(() => {
  if (!swipeActive.value || swipeDeltaX.value <= 0) return {};
  const clamped = Math.min(swipeDeltaX.value, SWIPE_THRESHOLD * 1.5);
  const opacity = 1 - clamped / (SWIPE_THRESHOLD * 3);
  return {
    transform: `translate3d(${clamped}px, 0, 0)`,
    opacity,
    transition: "none",
  };
});

function onSwipeStart(e) {
  const touch = e.touches[0];
  if (SWIPE_EDGE_ZONE > 0 && touch.clientX > SWIPE_EDGE_ZONE) {
    swipeActive.value = false;
    return;
  }
  swipeStartX.value = touch.clientX;
  swipeStartY.value = touch.clientY;
  swipeDeltaX.value = 0;
  swipeActive.value = true;
}

function onSwipeMove(e) {
  if (!swipeActive.value) return;
  const touch = e.touches[0];
  const dx = touch.clientX - swipeStartX.value;
  const dy = touch.clientY - swipeStartY.value;
  if (Math.abs(dy) > Math.abs(dx)) {
    swipeActive.value = false;
    swipeDeltaX.value = 0;
    return;
  }
  swipeDeltaX.value = Math.max(0, dx);
}

function onSwipeEnd() {
  if (!swipeActive.value) return;
  const triggered = swipeDeltaX.value >= SWIPE_THRESHOLD;
  swipeActive.value = false;
  if (triggered) {
    swipeDeltaX.value = 0;
    backToList();
  } else {
    requestAnimationFrame(() => { swipeDeltaX.value = 0; });
  }
}

// ── Typing debounce ───────────────────────────────────────────
let typingTimer = null;
const isTyping  = ref(false);

// ── Sound helpers ─────────────────────────────────────────────
function playSendSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.18);
  } catch {}
}

function playReceiveSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.07);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
  } catch {}
}

// ── Computed ──────────────────────────────────────────────────
const activeRoomId = computed(() => chatStore.activeRoomId);
const activeRoom   = computed(() => chatStore.activeRoom);

const activeContact = computed(() => {
  if (!activeRoomId.value) return null;
  return chatStore.groupedContacts.find((c) =>
    c.rooms.some((r) => r.roomId === activeRoomId.value)
  );
});

const siblingRooms = computed(() => activeContact.value?.rooms || []);

const filteredContacts = computed(() => {
  const q = roomSearch.value.trim().toLowerCase();
  if (!q) return chatStore.groupedContacts;
  return chatStore.groupedContacts.filter(
    (c) =>
      c.otherParty?.firstName?.toLowerCase().includes(q) ||
      c.otherParty?.lastName?.toLowerCase().includes(q) ||
      c.rooms.some((r) => r.contextTitle?.toLowerCase().includes(q))
  );
});

const groupedMessages = computed(() => {
  const msgs = chatStore.activeMessages;
  if (!msgs.length) return [];
  const groups = [];
  let currentDate = null, currentGroup = null;
  for (const msg of msgs) {
    const dateStr = chatStore.formatMessageDate(msg.createdAt);
    if (dateStr !== currentDate) {
      currentDate  = dateStr;
      currentGroup = { date: dateStr, messages: [] };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  }
  return groups;
});

// ── Helpers ───────────────────────────────────────────────────
function initials(party) {
  if (!party) return "?";
  return `${party.firstName?.[0] || ""}${party.lastName?.[0] || ""}`.toUpperCase();
}
function isOwn(msg) { return msg.senderId === currentUserId.value; }
function shouldShowAvatar(messages, index) {
  const next = messages[index + 1];
  return !next || next.senderId !== messages[index].senderId;
}
function isLastInRun(messages, index) {
  const next = messages[index + 1];
  return !next || next.senderId !== messages[index].senderId;
}

function autoResize(e) {
  const el = e.target;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 128) + "px";
  handleTyping();
}

function handleTyping() {
  if (!activeRoomId.value) return;
  if (!isTyping.value) {
    isTyping.value = true;
    chatStore.emitTyping(activeRoomId.value);
  }
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    isTyping.value = false;
    chatStore.emitStopTyping(activeRoomId.value);
  }, 2000);
}

function stopTyping() {
  clearTimeout(typingTimer);
  if (isTyping.value) {
    isTyping.value = false;
    chatStore.emitStopTyping(activeRoomId.value);
  }
}

// ── Actions ───────────────────────────────────────────────────
function handleContactClick(contact) {
  if (contact.rooms.length === 1) {
    openRoom(contact.rooms[0]);
  } else {
    expandedContactId.value =
      expandedContactId.value === contact.contactId ? null : contact.contactId;
  }
}

async function openRoom(room) {
  chatStore.setActiveRoom(room.roomId);
  showRoomList.value = false;
  if (!chatStore.messagesByRoom[room.roomId]) {
    // First time opening — full fetch (shows skeleton)
    try {
      await chatStore.fetchMessages(room.roomId);
    } catch (err) {
      if (err?.code !== "ERR_CANCELED") toast.error("Failed to load messages");
    }
  } else {
    // Already cached — silently pull any new messages in background
    chatStore.silentFetchMessages(room.roomId);
  }
  chatStore.markRoomRead(room.roomId);
  await nextTick();
  scrollToBottom();
  inputEl.value?.focus();
}

function backToList() {
  showRoomList.value = true;
  chatStore.clearActiveRoom();
}

async function handleSend() {
  const content = messageInput.value.trim();
  if (!content || !activeRoomId.value) return;
  const replyToId = replyTo.value?._id || replyTo.value?.id || null;
  messageInput.value = "";
  replyTo.value      = null;
  stopTyping();
  if (inputEl.value) inputEl.value.style.height = "auto";
  try {
    await chatStore.sendMessage(activeRoomId.value, content, replyToId);
    playSendSound();
    await nextTick();
    scrollToBottom(true);
  } catch {
    toast.error(chatStore.error || "Failed to send message");
    messageInput.value = content;
  }
}

async function loadMore() {
  const before = chatStore.nextCursorByRoom[activeRoomId.value];
  if (!before) return;
  const el         = messagesEl.value;
  const prevHeight = el?.scrollHeight || 0;
  try {
    await chatStore.fetchMessages(activeRoomId.value, { before });
    await nextTick();
    if (el) el.scrollTop = el.scrollHeight - prevHeight;
  } catch (err) {
    if (err?.code !== "ERR_CANCELED") toast.error("Failed to load more messages");
  }
}

function openContextMenu(msg, event) {
  if (msg.isDeleted) return;
  actionSheetMsg.value = null;
  const x = Math.min(event.clientX, window.innerWidth - 160);
  const y = Math.min(event.clientY, window.innerHeight - 100);
  contextMenu.msg = msg;
  contextMenu.x   = x;
  contextMenu.y   = y;
}

function setReply(msg) {
  if (msg.isDeleted) return;
  replyTo.value = msg;
  nextTick(() => inputEl.value?.focus());
}

function copyMessage(msg) {
  if (!msg.content) return;
  navigator.clipboard?.writeText(msg.content).catch(() => {});
}

function findMessage(id) {
  if (!id) return null;
  return chatStore.activeMessages.find((m) => (m._id || m.id) === id) || null;
}

function onBubbleTouchStart(msg, e) {
  if (msg.isDeleted) return;
  bubbleTouchMoved = false;
  clearTimeout(longPressTimer);
  longPressTimer = setTimeout(() => {
    if (!bubbleTouchMoved) actionSheetMsg.value = msg;
  }, 500);
}
function onBubbleTouchMove() { bubbleTouchMoved = true; clearTimeout(longPressTimer); }
function onBubbleTouchEnd()  { clearTimeout(longPressTimer); }

async function refreshRooms() {
  try {
    await chatStore.fetchRooms();
  } catch (err) {
    if (err?.code !== "ERR_CANCELED") toast.error("Failed to refresh chats");
  }
}

function scrollToBottom(smooth = false) {
  bottomEl.value?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
}

// ── FIX: Socket connection + reconnection helpers ─────────────
// In production, load balancers / proxies kill idle WebSocket connections.
// We need to (a) connect with the correct token, (b) reconnect on disconnect,
// and (c) sync + reconnect when the tab becomes visible again.

function ensureSocketConnected() {
  const token = authToken.value;
  if (!token) return; // not authenticated yet — skip
  if (!chatStore.socketConnected) {
    chatStore.connectSocket(token);
  }
}

let reconnectTimer = null;

function scheduleReconnect() {
  clearTimeout(reconnectTimer);
  // Back-off: wait 3s before attempting — avoids hammering on rapid disconnect events
  reconnectTimer = setTimeout(() => {
    ensureSocketConnected();
  }, 3000);
}

// ── Ambient silent poll — runs regardless of socket state ─────
// Production load balancers sometimes silently drop WebSocket connections
// without triggering a disconnect event. A 15s silent background poll
// ensures messages always arrive even when the socket appears "connected".
let ambientPollTimer = null;

function startAmbientPoll() {
  if (ambientPollTimer) return;
  ambientPollTimer = setInterval(() => {
    chatStore.silentSyncRooms();
    if (chatStore.activeRoomId) {
      chatStore.silentFetchMessages(chatStore.activeRoomId);
    }
  }, 15_000);
}

function stopAmbientPoll() {
  if (ambientPollTimer) {
    clearInterval(ambientPollTimer);
    ambientPollTimer = null;
  }
}

// ── Watchers ──────────────────────────────────────────────────
watch(
  () => chatStore.activeMessages.length,
  async (newLen, oldLen) => {
    if (newLen > oldLen) {
      const latest = chatStore.activeMessages[newLen - 1];
      if (latest && !isOwn(latest)) {
        playReceiveSound();
        chatStore.markRoomRead(activeRoomId.value);
      }
      await nextTick();
      scrollToBottom(true);
    }
  }
);

watch(
  () => chatStore.activeTyping,
  async (val) => {
    if (val) { await nextTick(); scrollToBottom(true); }
  }
);

watch(
  () => route.params.roomId,
  async (roomId) => {
    if (!roomId) return;
    const room = chatStore.rooms.find((r) => r.roomId === roomId);
    if (room) {
      await openRoom(room);
    } else {
      chatStore.setActiveRoom(roomId);
      showRoomList.value = false;
      try {
        await chatStore.fetchMessages(roomId);
      } catch {
        toast.error("Failed to load conversation");
      }
      await nextTick();
      scrollToBottom();
    }
  },
  { immediate: true }
);

// ── FIX: Watch socket disconnect — reconnect automatically ────
// chatStore.socketConnected goes false when the production server drops the
// connection (load balancer timeout, deploy, etc.). Reconnect automatically.
watch(
  () => chatStore.socketConnected,
  (connected) => {
    if (!connected) {
      scheduleReconnect();
    } else {
      // Reconnected — re-sync current room so we don't miss messages
      // that arrived while the socket was down
      clearTimeout(reconnectTimer);
      if (activeRoomId.value) {
        chatStore.syncActiveRoom();
      }
    }
  }
);

// ── FIX: Watch token — reconnect when auth is established ─────
// On a hard reload, authStore may not have restored the token yet when
// onMounted fires. Watching it ensures we connect once the token lands.
watch(authToken, (token) => {
  if (token && !chatStore.socketConnected) {
    chatStore.connectSocket(token);
  }
});

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(async () => {
  try {
    await chatStore.fetchRooms();
  } catch {
    toast.error("Failed to load chats");
  }

  await nextTick();
  ensureSocketConnected();
  startAmbientPoll();

  document.addEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("click", onDocClick);
});

onUnmounted(() => {
  clearTimeout(reconnectTimer);
  stopAmbientPoll();
  chatStore.disconnectSocket();
  document.removeEventListener("visibilitychange", onVisibilityChange);
  document.removeEventListener("click", onDocClick);
});

function onVisibilityChange() {
  if (document.visibilityState === "visible") {
    ensureSocketConnected();
    // Sync silently — no loading states, no visible flicker
    chatStore.syncActiveRoom();
  }
}

function onDocClick() {
  if (contextMenu.msg) contextMenu.msg = null;
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════════════════ */
.chat-root {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: var(--color-cb-base);
  font-family: -apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.chat-sidebar {
  display: flex;
  flex-direction: column;
  width: 320px;
  flex-shrink: 0;
  background: var(--color-cb-card);
  border-right: 1px solid var(--color-cb-divider);
  overflow: hidden;
  z-index: 20;
}

@media (max-width: 639px) {
  .chat-sidebar {
    position: absolute;
    inset: 0;
    width: 100%;
    transform: translate3d(0, 0, 0);
    will-change: transform;
    backface-visibility: hidden;
    transition: transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .chat-sidebar.sidebar-hidden {
    transform: translate3d(-100%, 0, 0);
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--color-cb-divider);
  flex-shrink: 0;
}
.sidebar-header-left { display: flex; flex-direction: column; gap: 2px; }
.sidebar-title { font-size: 1.15rem; font-weight: 700; color: var(--color-cb-text); letter-spacing: -0.02em; }
.sidebar-meta { display: flex; align-items: center; gap: 6px; }
.sidebar-meta-text { font-size: 0.72rem; color: var(--color-cb-muted); }
.unread-pill { font-size: 0.68rem; font-weight: 600; background: var(--color-cb-accent); color: white; padding: 1px 7px; border-radius: 99px; }
.sidebar-header-actions { display: flex; align-items: center; gap: 8px; }

.socket-dot { width: 7px; height: 7px; border-radius: 50%; transition: background 0.4s; }
.socket-dot.connected { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
.socket-dot.disconnected { background: #f59e0b; animation: pulse-dot 1.5s ease-in-out infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

.icon-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--color-cb-divider); color: var(--color-cb-muted); background: transparent; cursor: pointer; transition: color 0.15s, background 0.15s; }
.icon-btn:hover { color: var(--color-cb-text); background: var(--color-cb-field); }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.sidebar-search { padding: 10px 12px; border-bottom: 1px solid var(--color-cb-divider); flex-shrink: 0; }
.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; width: 15px; height: 15px; color: var(--color-cb-muted); flex-shrink: 0; }
.search-input { width: 100%; background: var(--color-cb-field); border: 1px solid transparent; border-radius: 12px; padding: 8px 32px; font-size: 0.83rem; color: var(--color-cb-text); outline: none; transition: border-color 0.15s; }
.search-input::placeholder { color: var(--color-cb-muted); opacity: 0.7; }
.search-input:focus { border-color: color-mix(in srgb, var(--color-cb-accent) 40%, transparent); }
.search-clear { position: absolute; right: 8px; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: var(--color-cb-muted); opacity: 0.5; color: white; cursor: pointer; border: none; transition: opacity 0.15s; }
.search-clear:hover { opacity: 0.8; }

.contact-list { flex: 1; min-height: 0; overflow-y: auto; scroll-behavior: smooth; }
.contact-list::-webkit-scrollbar { width: 3px; }
.contact-list::-webkit-scrollbar-thumb { background: var(--color-cb-divider); border-radius: 2px; }

.contact-skeleton { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--color-cb-divider); }
.skeleton-avatar { width: 46px; height: 46px; border-radius: 50%; background: var(--color-cb-field); animation: shimmer 1.4s ease-in-out infinite; flex-shrink: 0; }
.skeleton-lines { flex: 1; }
.skeleton-line { height: 12px; border-radius: 6px; background: var(--color-cb-field); animation: shimmer 1.4s ease-in-out infinite; }
@keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }

.contact-empty { display: flex; flex-direction: column; align-items: center; padding: 64px 24px; text-align: center; gap: 8px; }
.empty-icon { font-size: 2rem; color: var(--color-cb-muted); opacity: 0.5; margin-bottom: 4px; }
.empty-title { font-size: 0.875rem; font-weight: 600; color: var(--color-cb-text); }
.empty-sub { font-size: 0.75rem; color: var(--color-cb-muted); }

.contact-group { border-bottom: 1px solid var(--color-cb-divider); }
.contact-row { display: flex; width: 100%; align-items: center; gap: 12px; padding: 12px 16px; text-align: left; background: transparent; cursor: pointer; transition: background 0.12s; border: none; }
.contact-row:hover { background: color-mix(in srgb, var(--color-cb-field) 80%, transparent); }
.contact-row.contact-active { background: color-mix(in srgb, var(--color-cb-accent) 8%, transparent); }

.contact-avatar-wrap { position: relative; flex-shrink: 0; }
.contact-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; display: block; }
.contact-avatar-fallback { width: 46px; height: 46px; border-radius: 50%; background: color-mix(in srgb, var(--color-cb-accent) 15%, transparent); color: var(--color-cb-accent); font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.avatar-unread-ring { position: absolute; inset: -2px; border-radius: 50%; border: 2px solid var(--color-cb-accent); pointer-events: none; }

.contact-info { flex: 1; min-width: 0; }
.contact-info-top { display: flex; align-items: baseline; justify-content: space-between; gap: 4px; }
.contact-name { font-size: 0.875rem; font-weight: 600; color: var(--color-cb-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-time { font-size: 0.68rem; color: var(--color-cb-muted); flex-shrink: 0; }
.contact-info-bottom { margin-top: 1px; }
.contact-context { font-size: 0.7rem; color: var(--color-cb-accent); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.contact-preview { margin-top: 2px; font-size: 0.75rem; color: var(--color-cb-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.8; }
.contact-preview.preview-unread { font-weight: 600; color: var(--color-cb-text); opacity: 1; }
.contact-preview.preview-empty { font-style: italic; opacity: 0.5; }
.preview-you { color: var(--color-cb-accent); font-weight: 600; }

.contact-trailing { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.unread-badge { min-width: 20px; height: 20px; padding: 0 6px; border-radius: 99px; background: var(--color-cb-accent); color: white; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.chevron-icon { width: 14px; height: 14px; color: var(--color-cb-muted); transition: transform 0.2s ease; }
.chevron-open { transform: rotate(180deg); }

.sub-rooms { background: color-mix(in srgb, var(--color-cb-base) 60%, transparent); border-top: 1px solid var(--color-cb-divider); overflow: hidden; }
.sub-room-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 16px 10px 24px; border: none; background: transparent; cursor: pointer; text-align: left; border-bottom: 1px solid color-mix(in srgb, var(--color-cb-divider) 50%, transparent); transition: background 0.12s; }
.sub-room-row:last-child { border-bottom: none; }
.sub-room-row:hover { background: color-mix(in srgb, var(--color-cb-field) 60%, transparent); }
.sub-room-row.sub-room-active { background: color-mix(in srgb, var(--color-cb-accent) 10%, transparent); }
.sub-room-icon { font-size: 0.9rem; flex-shrink: 0; width: 16px; text-align: center; color: var(--color-cb-muted); }
.sub-room-info { flex: 1; min-width: 0; }
.sub-room-title { font-size: 0.78rem; font-weight: 500; color: var(--color-cb-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.sub-room-type { font-size: 0.65rem; color: var(--color-cb-muted); }
.sub-room-badge { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; background: var(--color-cb-accent); color: white; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.sub-room-active-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-cb-accent); flex-shrink: 0; }

.sub-rooms-enter-active, .sub-rooms-leave-active { transition: max-height 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease; max-height: 300px; overflow: hidden; }
.sub-rooms-enter-from, .sub-rooms-leave-to { max-height: 0; opacity: 0; }

.chat-main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--color-cb-base); }

@media (max-width: 639px) {
  .chat-main { position: absolute; inset: 0; z-index: 10; transform: translate3d(100%, 0, 0); will-change: transform; backface-visibility: hidden; transition: transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
  .chat-main.chat-main-visible { transform: translate3d(0, 0, 0); }
  .chat-main.chat-main-visible::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(to right, color-mix(in srgb, var(--color-cb-accent) 30%, transparent), transparent); z-index: 1; pointer-events: none; opacity: 0.5; }
}

.chat-empty { flex: 1; display: none; align-items: center; justify-content: center; }
@media (min-width: 640px) { .chat-empty { display: flex; } }
.chat-empty-inner { text-align: center; padding: 32px; }
.chat-empty-icon { width: 72px; height: 72px; border-radius: 24px; background: var(--color-cb-card); border: 1px solid var(--color-cb-divider); font-size: 1.8rem; color: var(--color-cb-muted); opacity: 0.6; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
.chat-empty-title { font-size: 1.05rem; font-weight: 700; color: var(--color-cb-text); margin-bottom: 6px; letter-spacing: -0.01em; }
.chat-empty-sub { font-size: 0.8rem; color: var(--color-cb-muted); max-width: 260px; margin: 0 auto; }

.chat-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--color-cb-card); border-bottom: 1px solid var(--color-cb-divider); flex-shrink: 0; min-height: 62px; position: relative; overflow: visible; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; color: var(--color-cb-muted); background: transparent; border: none; cursor: pointer; flex-shrink: 0; transition: color 0.15s, background 0.15s; }
.back-btn:hover { color: var(--color-cb-text); background: var(--color-cb-field); }
@media (min-width: 640px) { .back-btn { display: none; } }

.header-avatar-wrap { position: relative; flex-shrink: 0; }
.header-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.header-avatar-fallback { width: 38px; height: 38px; border-radius: 50%; background: color-mix(in srgb, var(--color-cb-accent) 15%, transparent); color: var(--color-cb-accent); font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.header-online-dot { position: absolute; bottom: 0; right: 0; width: 9px; height: 9px; border-radius: 50%; background: #22c55e; border: 2px solid var(--color-cb-card); }
.header-info { flex: 1; min-width: 0; }
.header-name { font-size: 0.9rem; font-weight: 700; color: var(--color-cb-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
.header-sub { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: var(--color-cb-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.header-sub-icon { font-size: 0.65rem; opacity: 0.7; flex-shrink: 0; }
.header-locked { display: inline-flex; align-items: center; gap: 3px; font-size: 0.65rem; font-weight: 600; color: var(--color-cb-negative, #ef4444); background: color-mix(in srgb, var(--color-cb-negative, #ef4444) 10%, transparent); padding: 1px 6px; border-radius: 99px; flex-shrink: 0; }

.thread-bar { flex-shrink: 0; border-bottom: 1px solid var(--color-cb-divider); background: var(--color-cb-card); }
.thread-bar-inner { display: flex; align-items: center; gap: 6px; padding: 8px 12px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
.thread-bar-inner::-webkit-scrollbar { display: none; }
.thread-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 99px; border: 1.5px solid var(--color-cb-divider); background: var(--color-cb-field); color: var(--color-cb-muted); font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; scroll-snap-align: start; transition: border-color 0.15s, color 0.15s, background 0.15s; max-width: 200px; will-change: border-color, background-color; }
.thread-chip:hover { border-color: var(--color-cb-accent); color: var(--color-cb-accent); }
.thread-chip.thread-chip-active { border-color: var(--color-cb-accent); background: color-mix(in srgb, var(--color-cb-accent) 10%, transparent); color: var(--color-cb-accent); }
.thread-chip-label { overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.thread-chip-badge { min-width: 17px; height: 17px; padding: 0 4px; border-radius: 99px; background: var(--color-cb-accent); color: white; font-size: 0.6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.locked-bar { flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; background: color-mix(in srgb, var(--color-cb-negative, #ef4444) 6%, transparent); border-top: 1px solid color-mix(in srgb, var(--color-cb-negative, #ef4444) 20%, transparent); font-size: 0.78rem; color: var(--color-cb-muted); text-align: center; }
.locked-bar-icon { color: var(--color-cb-negative, #ef4444); font-size: 0.8rem; flex-shrink: 0; }

.messages-area { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; background: var(--color-cb-base); }
.messages-area::-webkit-scrollbar { width: 3px; }
.messages-area::-webkit-scrollbar-thumb { background: var(--color-cb-divider); border-radius: 2px; }
@media (min-width: 640px) { .messages-area { padding: 20px; } }

.load-more-wrap { display: flex; justify-content: center; padding: 8px 0 16px; }
.load-more-btn { display: flex; align-items: center; padding: 6px 16px; border-radius: 99px; border: 1px solid var(--color-cb-divider); background: var(--color-cb-card); color: var(--color-cb-muted); font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: color 0.15s, border-color 0.15s; }
.load-more-btn:hover:not(:disabled) { color: var(--color-cb-text); border-color: var(--color-cb-text); }
.load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.msg-skeleton { display: flex; padding: 4px 0; }
.msg-skeleton.msg-skeleton-own { justify-content: flex-end; }
.skeleton-bubble { height: 38px; border-radius: 16px; background: var(--color-cb-card); animation: shimmer 1.4s ease-in-out infinite; }

.messages-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 32px; }
.messages-empty-icon { font-size: 1.8rem; color: var(--color-cb-accent); opacity: 0.6; margin-bottom: 4px; }
.messages-empty-title { font-size: 0.9rem; font-weight: 600; color: var(--color-cb-text); }
.messages-empty-sub { font-size: 0.78rem; color: var(--color-cb-muted); }

.date-separator { display: flex; align-items: center; gap: 10px; padding: 12px 0 8px; }
.date-line { flex: 1; height: 1px; background: var(--color-cb-divider); }
.date-label { font-size: 0.68rem; font-weight: 600; color: var(--color-cb-muted); white-space: nowrap; padding: 0 4px; letter-spacing: 0.03em; text-transform: uppercase; }

.msg-row { display: flex; align-items: flex-end; gap: 6px; margin: 1px 0; }
.msg-row-own { justify-content: flex-end; }
.msg-row-other { justify-content: flex-start; }
.msg-avatar-slot { width: 28px; flex-shrink: 0; }
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; display: block; }
.msg-avatar-fallback { width: 28px; height: 28px; border-radius: 50%; background: color-mix(in srgb, var(--color-cb-accent) 15%, transparent); color: var(--color-cb-accent); font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.msg-avatar-spacer { width: 28px; height: 28px; }
.msg-col { display: flex; flex-direction: column; max-width: min(72%, 360px); }
.msg-col-own { align-items: flex-end; }
.msg-col-other { align-items: flex-start; }

.reply-quote { display: flex; align-items: stretch; gap: 6px; margin-bottom: 4px; max-width: 100%; padding: 6px 10px; border-radius: 10px; cursor: default; }
.reply-quote-own { background: color-mix(in srgb, white 15%, transparent); border: 1px solid color-mix(in srgb, white 25%, transparent); }
.reply-quote-other { background: var(--color-cb-field); border: 1px solid var(--color-cb-divider); }
.reply-quote-bar { width: 3px; border-radius: 2px; background: var(--color-cb-accent); flex-shrink: 0; }
.reply-quote-body { flex: 1; min-width: 0; }
.reply-quote-name { font-size: 0.68rem; font-weight: 700; color: var(--color-cb-accent); display: block; margin-bottom: 2px; }
.reply-quote-text { font-size: 0.72rem; color: var(--color-cb-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

.bubble-wrap { display: flex; align-items: center; gap: 6px; position: relative; }
.bubble-wrap-own { flex-direction: row-reverse; }
.bubble-wrap-other { flex-direction: row; }
.reply-hover-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--color-cb-divider); background: var(--color-cb-card); color: var(--color-cb-muted); font-size: 0.72rem; cursor: pointer; flex-shrink: 0; opacity: 0; transform: scale(0.8); transition: opacity 0.15s, transform 0.15s, color 0.15s; pointer-events: none; }
.bubble-wrap:hover .reply-hover-btn { opacity: 1; transform: scale(1); pointer-events: auto; }
.reply-hover-btn:hover { color: var(--color-cb-accent); border-color: var(--color-cb-accent); background: color-mix(in srgb, var(--color-cb-accent) 8%, transparent); }
@media (hover: none) { .reply-hover-btn { display: none; } }

.action-sheet-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; }
.action-sheet { width: 100%; background: var(--color-cb-card); border-radius: 20px 20px 0 0; padding-bottom: max(12px, env(safe-area-inset-bottom)); box-shadow: 0 -8px 40px rgba(0,0,0,0.25); }
.action-sheet-handle { width: 36px; height: 4px; border-radius: 2px; background: var(--color-cb-divider); margin: 10px auto 8px; }
.action-sheet-preview { padding: 8px 20px 12px; border-bottom: 1px solid var(--color-cb-divider); }
.action-sheet-preview-name { font-size: 0.72rem; font-weight: 700; color: var(--color-cb-accent); display: block; margin-bottom: 3px; }
.action-sheet-preview-text { font-size: 0.82rem; color: var(--color-cb-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.action-sheet-divider { height: 1px; background: var(--color-cb-divider); }
.action-sheet-btn { display: flex; align-items: center; gap: 14px; width: 100%; padding: 15px 20px; border: none; background: transparent; color: var(--color-cb-text); font-size: 0.95rem; font-weight: 500; cursor: pointer; text-align: left; font-family: inherit; transition: background 0.1s; }
.action-sheet-btn:hover { background: var(--color-cb-field); }
.action-sheet-btn-icon { color: var(--color-cb-accent); width: 18px; text-align: center; }
.action-sheet-btn-cancel { color: var(--color-cb-muted); font-weight: 600; border-top: 1px solid var(--color-cb-divider); margin-top: 4px; justify-content: center; }
.action-sheet-enter-active, .action-sheet-leave-active { transition: opacity 0.2s ease; }
.action-sheet-enter-active .action-sheet, .action-sheet-leave-active .action-sheet { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
.action-sheet-enter-from, .action-sheet-leave-to { opacity: 0; }
.action-sheet-enter-from .action-sheet, .action-sheet-leave-to .action-sheet { transform: translateY(100%); }

.ctx-menu { position: fixed; z-index: 300; background: var(--color-cb-card); border: 1px solid var(--color-cb-divider); border-radius: 12px; padding: 4px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); min-width: 140px; }
.ctx-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 14px; border: none; background: transparent; color: var(--color-cb-text); font-size: 0.83rem; font-weight: 500; cursor: pointer; border-radius: 8px; text-align: left; font-family: inherit; transition: background 0.1s; }
.ctx-menu-item:hover { background: var(--color-cb-field); }
.ctx-menu-item i { color: var(--color-cb-accent); width: 16px; text-align: center; }
.ctx-menu-enter-active, .ctx-menu-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.ctx-menu-enter-from, .ctx-menu-leave-to { opacity: 0; transform: scale(0.95); }

.msg-bubble { padding: 9px 13px; border-radius: 16px; line-height: 1.45; word-break: break-word; position: relative; transition: opacity 0.15s; }
.bubble-own { background: var(--color-cb-accent); color: white; border-bottom-right-radius: 4px; }
.bubble-own.bubble-tail-own { border-bottom-right-radius: 4px; }
.bubble-other { background: var(--color-cb-card); color: var(--color-cb-text); border: 1px solid var(--color-cb-divider); border-bottom-left-radius: 4px; }
.bubble-other.bubble-tail-other { border-bottom-left-radius: 4px; }
.bubble-deleted { opacity: 0.5; font-style: italic; }
.bubble-text { font-size: 0.875rem; margin: 0; }

.msg-meta { display: flex; align-items: center; gap: 3px; margin-top: 3px; padding: 0 2px; }
.msg-meta-own { flex-direction: row-reverse; }
.meta-time { font-size: 0.65rem; color: var(--color-cb-muted); }
.meta-edited { font-size: 0.62rem; color: var(--color-cb-muted); font-style: italic; }
.meta-ticks { font-size: 0.68rem; color: var(--color-cb-muted); }
.meta-ticks.ticks-read { color: var(--color-cb-accent); }

.typing-row { display: flex; align-items: flex-end; gap: 6px; padding: 2px 0 6px; }
.typing-bubble { display: flex; align-items: center; gap: 4px; background: var(--color-cb-card); border: 1px solid var(--color-cb-divider); border-radius: 16px; border-bottom-left-radius: 4px; padding: 10px 14px; }
.typing-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-cb-muted); opacity: 0.6; animation: typing-bounce 1.2s ease-in-out infinite; }
.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.18s; }
.typing-dot:nth-child(3) { animation-delay: 0.36s; }
@keyframes typing-bounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }

.scroll-anchor { height: 1px; }

.reply-bar-wrap { display: flex; align-items: center; gap: 10px; padding: 10px 16px; flex-shrink: 0; border-top: 1px solid var(--color-cb-divider); background: var(--color-cb-card); }
.reply-bar-inner { flex: 1; display: flex; align-items: stretch; gap: 8px; background: var(--color-cb-field); border-radius: 10px; padding: 8px 12px; min-width: 0; }
.reply-accent-bar { width: 3px; border-radius: 2px; background: var(--color-cb-accent); flex-shrink: 0; }
.reply-bar-body { flex: 1; min-width: 0; }
.reply-bar-label { font-size: 0.68rem; font-weight: 600; color: var(--color-cb-accent); display: block; margin-bottom: 2px; }
.reply-bar-text { font-size: 0.75rem; color: var(--color-cb-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.reply-close { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--color-cb-divider); background: transparent; color: var(--color-cb-muted); cursor: pointer; flex-shrink: 0; transition: color 0.15s, background 0.15s; }
.reply-close:hover { color: var(--color-cb-text); background: var(--color-cb-field); }
.reply-bar-enter-active, .reply-bar-leave-active { transition: opacity 0.18s ease, transform 0.18s ease, max-height 0.18s ease; max-height: 80px; overflow: hidden; }
.reply-bar-enter-from, .reply-bar-leave-to { opacity: 0; transform: translateY(6px); max-height: 0; }

.input-bar { display: flex; align-items: flex-end; gap: 8px; padding: 10px 12px 14px; padding-bottom: max(14px, env(safe-area-inset-bottom)); background: var(--color-cb-card); border-top: 1px solid var(--color-cb-divider); flex-shrink: 0; }
.input-wrap { flex: 1; border-radius: 22px; border: 1.5px solid var(--color-cb-divider); background: var(--color-cb-field); padding: 10px 14px; transition: border-color 0.2s, box-shadow 0.2s; }
.input-wrap.input-focused { border-color: color-mix(in srgb, var(--color-cb-accent) 50%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-cb-accent) 10%, transparent); }
.message-input { display: block; width: 100%; background: transparent; border: none; outline: none; resize: none; font-size: 0.9rem; color: var(--color-cb-text); line-height: 1.45; max-height: 128px; overflow-y: auto; font-family: inherit; }
.message-input::placeholder { color: var(--color-cb-muted); opacity: 0.7; }
.message-input::-webkit-scrollbar { width: 2px; }
.send-btn { display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; border: none; background: color-mix(in srgb, var(--color-cb-accent) 30%, transparent); color: var(--color-cb-accent); cursor: pointer; flex-shrink: 0; transition: background 0.2s, color 0.2s, transform 0.15s; }
.send-btn:disabled { cursor: not-allowed; }
.send-btn.send-btn-ready { background: var(--color-cb-accent); color: white; box-shadow: 0 2px 12px color-mix(in srgb, var(--color-cb-accent) 40%, transparent); }
.send-btn.send-btn-ready:hover { transform: scale(1.05); }
.send-btn.send-btn-ready:active { transform: scale(0.96); }
.send-icon { width: 18px; height: 18px; transform: rotate(-45deg) translate(1px, -1px); }

.spin { animation: spin 0.7s linear infinite; }
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

@media (max-width: 1023px) {
  .input-bar { padding-bottom: max(calc(60px + env(safe-area-inset-bottom)), 74px); }
  .locked-bar { padding-bottom: max(calc(60px + env(safe-area-inset-bottom)), 74px); }
}
</style>