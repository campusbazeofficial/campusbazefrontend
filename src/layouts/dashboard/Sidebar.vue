<!-- src/layouts/dashboard/Sidebar.vue -->
<template>
  <aside
    class="sidebar"
    :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }"
  >
   
    <!-- Logo -->
    <div class="sidebar-logo">
      <router-link to="/" class="logo-link" v-show="!isCollapsed">
          <img
          :src="currentLogo"
          alt="CampusBase Logo"
          class="h-8 w-auto object-contain"
        />
      </router-link>

      <button
        class="collapse-btn"
        @click="$emit('toggle-collapse')"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <i
          :class="
            isCollapsed
              ? 'fa-solid fa-chevron-right'
              : 'fa-solid fa-chevron-left'
          "
        ></i>
      </button>
    </div>

    <!-- Nav links -->
    <nav class="sidebar-nav">
      <template v-for="group in navLinks" :key="group.group || '__ungrouped__'">
        <!-- Group label (only when sidebar is expanded) -->
        <p v-if="group.group && !isCollapsed" class="nav-group-label">
          {{ group.group }}
        </p>

        <!-- Regular links (no accordion, just standard items) -->
        <template v-if="!group.group">
          <router-link
            v-for="link in group.items"
            :key="link.path"
            :to="link.path"
            class="nav-item"
            active-class="active"
            @click="$emit('close-mobile')"
            @mouseenter="isCollapsed && showTooltip($event, link.label)"
            @mouseleave="hideTooltip"
          >
            <span class="nav-icon" style="position:relative">
              <i :class="link.icon"></i>
              <span v-if="isCollapsed && getBadgeValue(link)" class="nav-badge-dot"></span>
            </span>
            <span class="nav-label" v-show="!isCollapsed">{{ link.label }}</span>
            <span v-if="getBadgeValue(link) && !isCollapsed" class="nav-badge">
              {{ formatBadgeValue(getBadgeValue(link)) }}
            </span>
          </router-link>
        </template>

        <!-- Accordion groups (when sidebar is expanded) -->
        <template v-else-if="!isCollapsed">
          <div class="accordion-item">
            <button
              class="accordion-header"
              @click="toggleAccordion(group.group)"
            >
              <span class="accordion-icon">
                <i
                  :class="
                    openAccordions[group.group]
                      ? 'fa-solid fa-chevron-down'
                      : 'fa-solid fa-chevron-right'
                  "
                ></i>
              </span>
              <span class="accordion-label">{{ group.group }}</span>
            </button>
            <div
              class="accordion-content"
              :class="{ expanded: openAccordions[group.group] }"
            >
              <router-link
                v-for="link in group.items"
                :key="link.path"
                :to="link.path"
                class="nav-item accordion-link"
                active-class="active"
                @click="$emit('close-mobile')"
              >
                <span class="nav-icon"><i :class="link.icon"></i></span>
                <span class="nav-label">{{ link.label }}</span>
                <span v-if="getBadgeValue(link)" class="nav-badge">
                  {{ formatBadgeValue(getBadgeValue(link)) }}
                </span>
              </router-link>
            </div>
          </div>
        </template>

        <!-- Collapsed mode: show accordion items as separate icons with tooltips -->
        <template v-else-if="group.group && isCollapsed">
          <router-link
            v-for="link in group.items"
            :key="link.path"
            :to="link.path"
            class="nav-item"
            active-class="active"
            @click="$emit('close-mobile')"
            @mouseenter="isCollapsed && showTooltip($event, link.label)"
            @mouseleave="hideTooltip"
          >
            <span class="nav-icon" style="position:relative">
              <i :class="link.icon"></i>
              <span v-if="getBadgeValue(link)" class="nav-badge-dot"></span>
            </span>
            <span class="nav-label" v-show="!isCollapsed">{{ link.label }}</span>
          </router-link>
        </template>
      </template>
    </nav>

    <!-- Logout -->
    <div class="sidebar-footer">
      <button
        class="logout-btn"
        @click="$emit('logout')"
        @mouseenter="isCollapsed && showTooltip($event, 'Logout')"
        @mouseleave="hideTooltip"
      >
        <span class="nav-icon"
          ><i class="fa-solid fa-arrow-right-from-bracket"></i
        ></span>
        <span class="nav-label" v-show="!isCollapsed">Logout</span>
      </button>
    </div>

    <!-- Fixed tooltip rendered via JS -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="sidebar-tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        {{ tooltip.text }}
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useTheme } from "@/composables/Usetheme";

import logoLight from "@/assets/img/campusBaseLogo-light.png";
import logoDark from "@/assets/img/campusBaseLogo-dark.png";

const { theme } = useTheme();

const currentLogo = computed(() =>
  theme.value === "dark" ? logoLight : logoDark,
);

let roomPollInterval = null;

const props = defineProps({
  navLinks: { type: Array, required: true },
  isCollapsed: { type: Boolean, default: false },
  isMobileOpen: { type: Boolean, default: false },
});

defineEmits(["toggle-collapse", "close-mobile", "logout"]);

const chatStore = useChatStore();
const notificationStore = useNotificationStore();

onMounted(() => {
  // Only fetch if not already loaded — Chat.vue fetches on its own mount,
  // so avoid firing a duplicate request that gets cancelled by api.js
  if (!chatStore.rooms.length && !chatStore.roomsLoading) {
    chatStore.fetchRooms();
  }

  // Poll every 15s BUT skip when socket is live — the socket keeps
  // unread counts up to date in real time via injectSocketMessage
  roomPollInterval = setInterval(() => {
    if (!chatStore.socketConnected && !chatStore.roomsLoading) {
      chatStore.fetchRooms();
    }
  }, 15_000);
});

onUnmounted(() => {
  if (roomPollInterval) clearInterval(roomPollInterval);
});

const tooltip = ref({ visible: false, text: "", x: 0, y: 0 });

// Track open accordion groups
const openAccordions = reactive({});

// Load saved accordion state from localStorage
const loadAccordionState = () => {
  const saved = localStorage.getItem("sidebar-accordion-state");
  if (saved) {
    try {
      const state = JSON.parse(saved);
      Object.assign(openAccordions, state);
    } catch (e) {}
  }
};

// Save accordion state to localStorage
const saveAccordionState = () => {
  localStorage.setItem(
    "sidebar-accordion-state",
    JSON.stringify(openAccordions),
  );
};

// Toggle accordion group
const toggleAccordion = (groupName) => {
  openAccordions[groupName] = !openAccordions[groupName];
  saveAccordionState();
};

// Initialize accordion state
loadAccordionState();

// Auto-open accordion if current route is inside it
watch(
  () => props.navLinks,
  () => {
    const currentPath = window.location.pathname;
    props.navLinks.forEach((group) => {
      if (group.group && group.items) {
        const isInGroup = group.items.some((item) =>
          currentPath.startsWith(item.path),
        );
        if (isInGroup && !openAccordions[group.group]) {
          openAccordions[group.group] = true;
          saveAccordionState();
        }
      }
    });
  },
  { immediate: true, deep: true },
);

// Get badge value based on link configuration
function getBadgeValue(link) {
  if (!link.badge) return null;

  if (typeof link.badge === "string") {
    switch (link.badge) {
      case "unreadCount":
        return chatStore.totalUnread;
      case "notificationCount":
        return notificationStore.unreadCount;
      default:
        return null;
    }
  }

  if (typeof link.badge === "number") return link.badge;
  if (typeof link.badge === "function") return link.badge();
  return null;
}

// Format badge value for display
function formatBadgeValue(value) {
  if (value === null || value === undefined || value === 0) return null;
  if (value > 99) return "99+";
  return value;
}

function showTooltip(e, text) {
  const rect = e.currentTarget.getBoundingClientRect();
  tooltip.value = {
    visible: true,
    text,
    x: rect.right + 12,
    y: rect.top + rect.height / 2,
  };
}

function hideTooltip() {
  tooltip.value.visible = false;
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  background-color: var(--color-cb-card);
  border-right: 1px solid var(--color-cb-divider);
  transition:
    width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  width: 68px;
}

@media (max-width: 1023px) {
  .sidebar {
    transform: translateX(-100%);
    width: 240px !important;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--color-cb-divider);
  min-height: 64px;
  overflow: hidden;
}

.logo-link {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  flex-shrink: 0;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-cb-divider);
  background: var(--color-cb-base);
  color: var(--color-cb-muted);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.7rem;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
  margin-left: auto;
}

.collapse-btn:hover {
  background-color: var(--color-cb-field);
  border-color: var(--color-cb-accent);
  color: var(--color-cb-accent);
}

@media (min-width: 1024px) {
  .collapse-btn {
    display: flex;
  }
}

/* When collapsed, center the logo and btn */
.sidebar.collapsed .sidebar-logo {
  justify-content: center;
  gap: 0;
}

.sidebar.collapsed .collapse-btn {
  margin-left: 0;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: visible;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-width: none;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.nav-group-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-cb-muted);
  padding: 0.75rem 0.75rem 0.25rem;
  margin: 0;
}

/* Accordion Styles */
.accordion-item {
  margin-bottom: 2px;
}

.accordion-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: var(--color-cb-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  font-family: var(--font-sans);
}

.accordion-header:hover {
  background-color: var(--color-cb-field);
  color: var(--color-cb-text);
}

.accordion-icon {
  width: 20px;
  text-align: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.accordion-label {
  flex: 1;
  text-align: left;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-left: 1.5rem;
}

.accordion-content.expanded {
  max-height: 500px;
}

.accordion-link {
  padding-left: 0.75rem;
  margin-top: 2px;
}

/* Regular nav items */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  text-decoration: none;
  color: var(--color-cb-muted);
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-item:hover {
  background-color: var(--color-cb-field);
  color: var(--color-cb-text);
}

.nav-item.active {
  background-color: var(--color-cb-accent-subtle);
  color: var(--color-cb-accent);
  font-weight: 600;
}

.nav-item.active .nav-icon {
  color: var(--color-cb-accent);
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 0.95rem;
  flex-shrink: 0;
  color: inherit;
}

.nav-label {
  overflow: hidden;
}

.nav-badge {
  background-color: var(--color-cb-accent);
  color: var(--color-cb-contrast);
  font-size: 0.65rem;
  font-weight: 400;
  padding:  3px 4px;
  /* height: 8px;
  width: 8px; */
  border-radius: 100%;
  min-width: 20px;
  text-align: center;
  line-height: 1.2;
  flex-shrink: 0;
}

/* Collapsed dot — tiny indicator when badge exists but sidebar is collapsed */
.nav-badge-dot {
  position: absolute;
  top: -3px;
  right: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-cb-negative);
  border: 2px solid var(--color-cb-card);
  pointer-events: none;
}

/* Footer */
.sidebar-footer {
  padding: 0.5rem;
  border-top: 1px solid var(--color-cb-divider);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--color-cb-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  font-family: var(--font-sans);
  position: relative;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.logout-btn:hover {
  background-color: var(--color-cb-negative-subtle);
  color: var(--color-cb-negative);
}
</style>

<style>
/* Global — not scoped so it applies to the teleported tooltip */
.sidebar-tooltip {
  position: fixed;
  transform: translateY(-50%);
  background-color: var(--color-cb-card);
  color: var(--color-cb-text);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
  border: 1px solid var(--color-cb-divider);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: tooltipIn 0.15s ease forwards;
}

.sidebar-tooltip::before {
  content: "";
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: var(--color-cb-divider);
}

.sidebar-tooltip::after {
  content: "";
  position: absolute;
  right: calc(100% - 1px);
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: var(--color-cb-card);
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}
</style>