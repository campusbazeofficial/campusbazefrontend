// src/utils/serviceCategories.js

export const SERVICE_CATEGORIES = {
  graphic_design: {
    label: 'Graphic Design',
    icon: 'fa-solid fa-paint-brush'
  },
  content_writing: {
    label: 'Content Writing',
    icon: 'fa-solid fa-pen'
  },
  programming: {
    label: 'Programming & Development',
    icon: 'fa-solid fa-code'
  },
  web_dev: {
    label: 'Web Development',
    icon: 'fa-solid fa-globe'
  },
  tutoring: {
    label: 'Tutoring & Lessons',
    icon: 'fa-solid fa-chalkboard-user'
  },
  video_production: {
    label: 'Video Production',
    icon: 'fa-solid fa-video'
  },
  digital_marketing: {
    label: 'Digital Marketing',
    icon: 'fa-solid fa-chart-line'
  },
  music_audio: {
    label: 'Music & Audio',
    icon: 'fa-solid fa-music'
  },
  legal: {
    label: 'Legal Services',
    icon: 'fa-solid fa-scale-balanced'
  },
  engineering: {
    label: 'Engineering',
    icon: 'fa-solid fa-gears'
  },
  translation: {
    label: 'Translation',
    icon: 'fa-solid fa-language'
  },
  consulting: {
    label: 'Consulting',
    icon: 'fa-solid fa-people-arrows'
  },
  data_analytics: {
    label: 'Data Analytics',
    icon: 'fa-solid fa-chart-pie'
  },
  other: {
    label: 'Other',
    icon: 'fa-solid fa-ellipsis'
  }
}

export function getCategoryLabel(category) {
  return SERVICE_CATEGORIES[category]?.label || category?.replace(/_/g, ' ') || ''
}

export function getCategoryIcon(category) {
  return SERVICE_CATEGORIES[category]?.icon || 'fa-solid fa-tag'
}

export const categoryOptions = Object.entries(SERVICE_CATEGORIES).map(([value, { label }]) => ({
  value,
  label
}))