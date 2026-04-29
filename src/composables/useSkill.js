// src/composables/useSkill.js
import { useSkillStore } from '@/stores/skillStore'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export function useSkill() {
  const skillStore = useSkillStore()

  // Reactive refs from store
  const { skills, loading, error } = storeToRefs(skillStore)

  // ── Computed helpers ───────────────────────────────────────────────────────
  const allSkills = computed(() => skills.value)
  const hasSkills = computed(() => skills.value.length > 0)
  const totalSkillsCount = computed(() => skills.value.length)

  /** Skills grouped by category */
  const skillsByCategory = computed(() => {
    const grouped = {}
    skills.value.forEach((skill) => {
      const cat = skill.category || 'Uncategorized'
      ;(grouped[cat] ??= []).push(skill)
    })
    return grouped
  })

  /** Skills grouped by proficiency level */
  const skillsByProficiency = computed(() => {
    const grouped = { beginner: [], intermediate: [], advanced: [], expert: [] }
    skills.value.forEach((skill) => {
      const level = skill.proficiency || 'beginner'
      ;(grouped[level] ?? grouped.beginner).push(skill)
    })
    return grouped
  })

  // ── Proficiency config ─────────────────────────────────────────────────────
  const proficiencyLevels = [
    { value: 'beginner',     label: 'Beginner',     color: 'info'    },
    { value: 'intermediate', label: 'Intermediate', color: 'warning' },
    { value: 'advanced',     label: 'Advanced',     color: 'success' },
    { value: 'expert',       label: 'Expert',       color: 'primary' },
  ]

  const getProficiencyLabel = (level) =>
    proficiencyLevels.find((p) => p.value === level)?.label || level || 'Not specified'

  const getProficiencyColor = (level) =>
    proficiencyLevels.find((p) => p.value === level)?.color || 'secondary'

  // ── Utility methods ────────────────────────────────────────────────────────
  const getSkillsByCategory = (category) =>
    skills.value.filter((s) => s.category === category)

  const getSkillById = (skillId) =>
    skills.value.find((s) => s._id === skillId)

  const searchSkills = (term) => {
    if (!term) return skills.value
    const t = term.toLowerCase()
    return skills.value.filter(
      (s) =>
        s.name.toLowerCase().includes(t) ||
        (s.description && s.description.toLowerCase().includes(t)) ||
        (s.category && s.category.toLowerCase().includes(t)),
    )
  }

  const getSkillsByProficiencyLevel = (level) =>
    skills.value.filter((s) => s.proficiency === level)

  /** Validate before submitting to the API */
  const validateSkillData = (skillData) => {
    const errors = {}
    if (!skillData.name?.trim()) errors.name = 'Skill name is required'
    else if (skillData.name.length > 100) errors.name = 'Skill name must be under 100 characters'
    if (!skillData.proficiency) errors.proficiency = 'Proficiency level is required'
    if (
      skillData.yearsOfExperience != null &&
      (skillData.yearsOfExperience < 0 || skillData.yearsOfExperience > 50)
    ) errors.yearsOfExperience = 'Must be between 0 and 50'
    if (skillData.description && skillData.description.length > 500)
      errors.description = 'Description must be under 500 characters'
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  const formatSkillForDisplay = (skill, maxName = 30, maxDesc = 100) => ({
    ...skill,
    displayName: skill.name.length > maxName ? skill.name.slice(0, maxName) + '…' : skill.name,
    displayDescription:
      skill.description && skill.description.length > maxDesc
        ? skill.description.slice(0, maxDesc) + '…'
        : skill.description,
  })

  return {
    // State (reactive)
    skills,
    loading,
    error,

    // Computed
    allSkills,
    hasSkills,
    totalSkillsCount,
    skillsByCategory,
    skillsByProficiency,

    // Config
    proficiencyLevels,

    // Helpers
    getProficiencyLabel,
    getProficiencyColor,
    getSkillsByCategory,
    getSkillById,
    searchSkills,
    getSkillsByProficiencyLevel,
    validateSkillData,
    formatSkillForDisplay,

    // Store actions
    fetchMySkills:        skillStore.fetchMySkills,
    fetchSkillsByUserId:  skillStore.fetchSkillsByUserId,
    createSkill:          skillStore.createSkill,
    updateSkill:          skillStore.updateSkill,
    deleteSkill:          skillStore.deleteSkill,
    resetStore:           skillStore.resetStore,
    clearError:           skillStore.clearError,
    setLoading:           skillStore.setLoading,
    setError:             skillStore.setError,
  }
}