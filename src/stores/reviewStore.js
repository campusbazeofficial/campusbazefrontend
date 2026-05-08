import { defineStore } from "pinia";
import { reviewApi } from "@/api/reviewApi";

export const useReviewStore = defineStore("review", {
  state: () => ({
    myReviews: [],
    userReviews: [],
    publicReviews: [], // Added for public reviews

    loading: false,
    error: null,

    meta: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },

    submitting: false,
  }),

  getters: {
    hasReviews: (state) => state.myReviews.length > 0,
  },

  actions: {
    // ─────────────────────────────────────────────
    // RESET
    // ─────────────────────────────────────────────
    reset() {
      this.myReviews = [];
      this.userReviews = [];
      this.publicReviews = [];
      this.error = null;
      this.meta = {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    },

    // ─────────────────────────────────────────────
    // CREATE REVIEW
    // ─────────────────────────────────────────────
    async createReview(payload) {
      this.submitting = true;
      this.error = null;

      try {
        const res = await reviewApi.createReview(payload);

        const review = res?.data?.review;

        // Optimistic insert (so UI updates instantly)
        if (review) {
          this.myReviews.unshift(review);
        }

        return review;
      } catch (err) {
        this.error =
          err?.response?.data?.message || "Failed to submit review";
        throw err;
      } finally {
        this.submitting = false;
      }
    },

    // ─────────────────────────────────────────────
    // GET MY REVIEWS
    // ─────────────────────────────────────────────
    async fetchMyReviews(params = { page: 1, limit: 20 }) {
      this.loading = true;
      this.error = null;

      try {
        const res = await reviewApi.getMyReviews(params);

        this.myReviews = res?.data || [];
        this.meta = res?.meta || this.meta;

        return res;
      } catch (err) {
        this.error =
          err?.response?.data?.message || "Failed to load your reviews";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ─────────────────────────────────────────────
    // GET PUBLIC REVIEWS (for testimonials)
    // ─────────────────────────────────────────────
    async fetchPublicReviews(params = { page: 1, limit: 20 }) {
      this.loading = true;
      this.error = null;

      try {
        const res = await reviewApi.getPublicReviews(params);

        this.publicReviews = res?.data || [];
        this.meta = res?.meta || this.meta;

        return res;
      } catch (err) {
        this.error =
          err?.response?.data?.message || "Failed to load reviews";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ─────────────────────────────────────────────
    // GET PUBLIC USER REVIEWS
    // ─────────────────────────────────────────────
    async fetchUserReviews(userId, params = { page: 1, limit: 20 }) {
      this.loading = true;
      this.error = null;

      try {
        const res = await reviewApi.getUserReviews(userId, params);

        this.userReviews = res?.data || [];
        this.meta = res?.meta || this.meta;

        return res;
      } catch (err) {
        this.error =
          err?.response?.data?.message || "Failed to load user reviews";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});