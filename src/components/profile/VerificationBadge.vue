<!-- src/components/profile/VerificationBadge.vue -->
<template>
  <span
    v-if="badge"
    class="vbadge"
    :class="[`vbadge--${badge.tier}`, `vbadge--${size}`]"
    :title="badge.tooltip"
  >
    <span class="vbadge__icon" aria-hidden="true">
      <component :is="badge.iconComponent" />
    </span>

    <template v-if="showLabel">
      <span class="vbadge__label">{{ badge.label }}</span>
      <span v-if="showTier" class="vbadge__meta">· {{ tierLabel }}</span>
      <span v-if="showTooltip && badge.institution" class="vbadge__meta">
        · {{ badge.institution }}
      </span>
    </template>
  </span>
</template>

<script setup>
import { computed, h } from "vue";

const props = defineProps({
  user:        { type: Object,  required: true },
  company:     { type: Object,  default: null  },
  status:      { type: Object,  default: null  },
  size:        { type: String,  default: "sm"  },
  showLabel:   { type: Boolean, default: true  },
  showTooltip: { type: Boolean, default: true  },
  showTier:    { type: Boolean, default: true  },
});

// ── Inline SVG icon components (replaces FA dependency) ──────────────────
const IconShieldCheck = () =>
  h("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
    h("polyline", { points: "9 12 11 14 15 10" }),
  ]);

const IconBuilding = () =>
  h("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("rect", { x: "2", y: "7", width: "20", height: "14", rx: "2" }),
    h("path", { d: "M16 7V5a2 2 0 0 0-4 0v2" }),
    h("path", { d: "M8 7V5a2 2 0 0 0-4 0v2" }),
  ]);

const IconGradCap = () =>
  h("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("path", { d: "M22 10v6M2 10l10-5 10 5-10 5z" }),
    h("path", { d: "M6 12v5c3 3 9 3 12 0v-5" }),
  ]);

const IconShieldPlus = () =>
  h("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
    h("line", { x1: "12", y1: "8", x2: "12", y2: "16" }),
    h("line", { x1: "8",  y1: "12", x2: "16", y2: "12" }),
  ]);

const IconCircleCheck = () =>
  h("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" }, [
    h("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
    h("polyline", { points: "22 4 12 14.01 9 11.01" }),
  ]);

// ── Tier label ────────────────────────────────────────────────────────────
const tierLabel = computed(() => {
  if (!props.status?.verificationTierLabel) return "";
  const label = props.status.verificationTierLabel;
  const match = label.match(/Tier\s*\d+[A-Za-z]*/i);
  if (match) return match[0];
  const level = props.status.verificationLevel ?? 0;
  return `Level ${level}`;
});

// ── Badge resolution (priority order preserved) ───────────────────────────
const badge = computed(() => {
  const u = props.user;
  if (!u) return null;

  const statusLabel = props.status?.verificationTierLabel ?? "";
  const level       = props.status?.verificationLevel ?? -1;
  const isStudent   = props.status?.isStudent ?? u.isStudent ?? false;

  // ① Fully Verified — Tier 2
  if (
    statusLabel === "Tier 2 — Gold Verified" ||
    statusLabel.includes("Gold") ||
    level >= 2
  ) {
    return {
      tier: "fully",
      iconComponent: IconShieldCheck,
      label: "Fully Verified",
      tooltip: "Fully Verified — Highest trust level (Tier 2: ID + Facial)",
      institution: null,
    };
  }

  // ② Corporate Verified
  const hasCacDoc = props.status?.documents?.some(
    (d) => d.docType === "cac" && d.status === "verified",
  );
  if (u.role === "corporate" && hasCacDoc) {
    return {
      tier: "corporate",
      iconComponent: IconBuilding,
      label: "Company Verified",
      tooltip: "Corporate account verified with CAC Certificate of Incorporation",
      institution: null,
    };
  }

  // ③ Student Verified — Tier 1A
  if (isStudent && statusLabel === "Tier 1A — Student Verified") {
    return {
      tier: "student",
      iconComponent: IconGradCap,
      label: "Student Verified",
      tooltip: u.institutionName
        ? `Student at ${u.institutionName} (Tier 1A)`
        : "Student identity verified (Tier 1A)",
      institution: u.institutionName || null,
    };
  }

  // ④ ID Verified — Tier 1B
  if (!isStudent && statusLabel === "Tier 1B — ID Verified") {
    return {
      tier: "id",
      iconComponent: IconShieldPlus,
      label: "ID Verified",
      tooltip: "Government-issued ID verified (Tier 1B)",
      institution: null,
    };
  }

  // ⑤ Basic — Tier 0
  if (u.isEmailVerified && u.isPhoneVerified) {
    return {
      tier: "basic",
      iconComponent: IconCircleCheck,
      label: "Basic",
      tooltip: "Email & phone verified (Tier 0)",
      institution: null,
    };
  }

  return null;
});
</script>

<style scoped>
/* ── Base ── */
.vbadge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1;
  position: relative;
  border: none;
  transition: filter 0.15s ease, transform 0.12s ease;
}
.vbadge:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

/* Shimmer highlight on top edge */
.vbadge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 55%);
  pointer-events: none;
}

/* ── Sizes ── */
.vbadge--xs { font-size: 0.6rem;  padding: 3px 9px;  }
.vbadge--sm { font-size: 0.68rem; padding: 4px 11px; }
.vbadge--md { font-size: 0.77rem; padding: 5px 13px; }
.vbadge--lg { font-size: 0.87rem; padding: 7px 16px; }

.vbadge__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 0.95em;
}
.vbadge__label { font-weight: 600; }
.vbadge__meta  { font-weight: 400; opacity: 0.72; font-size: 0.88em; }

/* ── Tier colours ── */

/* ① Fully Verified — Gold */
.vbadge--fully {
  background: linear-gradient(110deg, #c9a227 0%, #f5d170 42%, #b8841a 100%);
  color: #3d2400;
  box-shadow:
    0 0 0 1px rgba(255,200,50,0.55),
    0 2px 8px rgba(180,130,10,0.35),
    inset 0 1px 0 rgba(255,255,220,0.4);
}

/* ② Corporate — Deep navy */
.vbadge--corporate {
  background: linear-gradient(110deg, #0d1e35 0%, #1a3358 55%, #0d1e35 100%);
  color: #7ec8f8;
  box-shadow:
    0 0 0 1px rgba(78,160,230,0.4),
    0 2px 8px rgba(10,40,80,0.5),
    inset 0 1px 0 rgba(120,200,255,0.12);
}

/* ③ Student — Sapphire */
.vbadge--student {
  background: linear-gradient(110deg, #1242a8 0%, #2563eb 55%, #1242a8 100%);
  color: #dbeafe;
  box-shadow:
    0 0 0 1px rgba(96,165,250,0.45),
    0 2px 8px rgba(20,60,180,0.35),
    inset 0 1px 0 rgba(220,240,255,0.18);
}

/* ④ ID Verified — Emerald */
.vbadge--id {
  background: linear-gradient(110deg, #065f35 0%, #059669 55%, #065f35 100%);
  color: #d1fae5;
  box-shadow:
    0 0 0 1px rgba(52,199,130,0.4),
    0 2px 8px rgba(5,80,40,0.35),
    inset 0 1px 0 rgba(200,255,225,0.15);
}

/* ⑤ Basic — Graphite */
.vbadge--basic {
  background: linear-gradient(110deg, #2a2a2e 0%, #3c3c43 50%, #2a2a2e 100%);
  color: #b0b0bc;
  box-shadow:
    0 0 0 1px rgba(180,180,200,0.2),
    0 2px 6px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
</style>