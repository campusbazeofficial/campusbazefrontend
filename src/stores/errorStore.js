// src/stores/errorStore.js
import { defineStore } from 'pinia';

export const useErrorStore = defineStore('error', {
  state: () => ({
    message: null,
    type: null,
    status: null,
    visible: false,
  }),

  actions: {
    setError(payload) {
      this.message = payload.message;
      this.type = payload.type;
      this.status = payload.status;
      this.visible = true;
    },

    clearError() {
      this.message = null;
      this.type = null;
      this.status = null;
      this.visible = false;
    },
  },
});