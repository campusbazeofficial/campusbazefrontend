// src/api/skillApi.js
import api from './api'

export const skillApi = {
  /**
   * Get current user's skills
   * GET /api/v1/skills
   * res: { success, data: { skills: [...] } }
   */
  async getMySkills() {
    const response = await api.get('/api/v1/skills')
    return response.data
  },

  /**
   * Create a new skill
   * POST /api/v1/skills
   * req: { name, proficiency, category?, yearsOfExperience?, description? }
   * res: { success, data: { skill: {...} } }
   */
  async createSkill(skillData) {
    const response = await api.post('/api/v1/skills', skillData)
    return response.data
  },

  /**
   * Update a skill
   * PATCH /api/v1/skills/:skillId
   * res: { success, data: { skill: {...} } }
   */
  async updateSkill(skillId, updateData) {
    const response = await api.patch(`/api/v1/skills/${skillId}`, updateData)
    return response.data
  },

  /**
   * Delete a skill
   * DELETE /api/v1/skills/:skillId
   * res: { success, message }
   */
  async deleteSkill(skillId) {
    const response = await api.delete(`/api/v1/skills/${skillId}`)
    return response.data
  },

  /**
   * Get skills by user ID (for viewing other profiles)
   * GET /api/v1/skills/user/:userId
   * res: { success, data: { skills: [...] } }
   */
  async getSkillsByUserId(userId) {
    const response = await api.get(`/api/v1/skills/user/${userId}`)
    return response.data
  },
}