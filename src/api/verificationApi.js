// src/api/verificationApi.js
import api from './api'

export const verificationApi = {

  // POST /api/v1/verifications — submit identity document (multipart/form-data)
  // fields: documentType, documentNumber, + file (document image)
  async submitVerification(payload) {
    const formData = new FormData()
    formData.append('docType', payload.docType)
    formData.append('document', payload.document)
    const response = await api.post('/api/v1/verifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // GET /api/v1/verifications/my — list own verification submissions
  async getMyVerifications() {
    const response = await api.get('/api/v1/verifications/my')
    return response.data
  },

  // GET /api/v1/verifications/status — current verification tier & status
  async getVerificationStatus() {
    const response = await api.get('/api/v1/verifications/status')
    return response.data
  },

  // POST /api/v1/verifications/phone/send-otp — send phone OTP via SMS
  async sendPhoneOtp(phone) {
    const response = await api.post('/api/v1/verifications/phone/send-otp', { phone })
    return response.data
  },

  // POST /api/v1/verifications/phone/verify — confirm phone OTP
  async verifyPhoneOtp(otp) {
    const response = await api.post('/api/v1/verifications/phone/verify', { otp })
    return response.data
  },

  // GET /api/v1/verifications/allowed-docs — get allowed document types for user
  async getAllowedDocs() {
    const response = await api.get('/api/v1/verifications/allowed-docs')
    return response.data
  },
}