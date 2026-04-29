// src/stores/skillStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { skillApi } from '@/api/skillApi'

export const useSkillStore = defineStore('skill', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const skills = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ── Getters ────────────────────────────────────────────────────────────────
  const hasSkills = computed(() => skills.value.length > 0)
  const totalSkillsCount = computed(() => skills.value.length)

  const skillsByProficiency = computed(() => {
    const grouped = { beginner: [], intermediate: [], advanced: [], expert: [] }
    skills.value.forEach((skill) => {
      const level = skill.proficiency || 'beginner'
      ;(grouped[level] ?? grouped.beginner).push(skill)
    })
    return grouped
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setLoading = (status) => { loading.value = status }

  const setError = (message) => {
    error.value = message
    setTimeout(() => { if (error.value === message) error.value = null }, 5000)
  }

  const clearError = () => { error.value = null }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch the current user's skills.
   * GET /api/v1/skills → res.data.skills
   */
  const fetchMySkills = async () => {
    setLoading(true)
    error.value = null
    try {
      const res = await skillApi.getMySkills()
      if (res.success) {
        skills.value = res.data?.skills ?? []
        return { success: true, data: skills.value }
      }
      throw new Error(res.message || 'Failed to fetch skills')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching skills'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch skills for any user by ID (read-only / other profiles).
   * GET /api/v1/skills/user/:userId → res.data.skills
   * NOTE: does NOT overwrite the store's `skills` ref so the current
   * user's own skills list is unaffected.
   */
  const fetchSkillsByUserId = async (userId) => {
    setLoading(true)
    error.value = null
    try {
      const res = await skillApi.getSkillsByUserId(userId)
      if (res.success) {
        const userSkills = res.data?.skills ?? []
        return { success: true, data: userSkills }
      }
      throw new Error(res.message || 'Failed to fetch user skills')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error fetching user skills'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Create a skill and prepend it to the local list.
   * POST /api/v1/skills → res.data.skill
   */
  const createSkill = async (skillData) => {
    setLoading(true)
    error.value = null
    try {
      const res = await skillApi.createSkill(skillData)
      if (res.success) {
        const newSkill = res.data?.skill
        if (newSkill) skills.value.unshift(newSkill)
        return { success: true, data: newSkill }
      }
      throw new Error(res.message || 'Failed to create skill')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error creating skill'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update a skill and patch it in-place in the local list.
   * PATCH /api/v1/skills/:skillId → res.data.skill
   */
  const updateSkill = async (skillId, updateData) => {
    setLoading(true)
    error.value = null
    try {
      const res = await skillApi.updateSkill(skillId, updateData)
      if (res.success) {
        const updated = res.data?.skill
        const idx = skills.value.findIndex((s) => s._id === skillId)
        if (idx !== -1 && updated) {
          skills.value[idx] = { ...skills.value[idx], ...updated }
        }
        return { success: true, data: updated }
      }
      throw new Error(res.message || 'Failed to update skill')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error updating skill'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete a skill and remove it from the local list.
   * DELETE /api/v1/skills/:skillId
   */
  const deleteSkill = async (skillId) => {
    setLoading(true)
    error.value = null
    try {
      const res = await skillApi.deleteSkill(skillId)
      if (res.success) {
        skills.value = skills.value.filter((s) => s._id !== skillId)
        return { success: true }
      }
      throw new Error(res.message || 'Failed to delete skill')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error deleting skill'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const resetStore = () => {
    skills.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    skills,
    loading,
    error,

    // Getters
    hasSkills,
    totalSkillsCount,
    skillsByProficiency,

    // Actions
    fetchMySkills,
    fetchSkillsByUserId,
    createSkill,
    updateSkill,
    deleteSkill,
    resetStore,
    clearError,
    setLoading,
    setError,
  }
})