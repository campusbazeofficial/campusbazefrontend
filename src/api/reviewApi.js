// src/api/reviewApi.js
import api from "./api";
import { withRetry, withRetryDecorator } from "./apiRetry";

export const reviewApi = {
  // ── Create Review ────────────────────────────────────────
  async createReview(data) {
    /**
     * data:
     * {
     *   refId: string,
     *   refType: "order" | "errand",
     *   rating: number,
     *   comment: string
     * }
     */
    const retryableCreate = withRetryDecorator(
      (d) => api.post("/api/v1/reviews", d),
      "createReview",
    );

    const response = await retryableCreate(data);
    return response.data;
  },

  // ── My Reviews (auth user) ───────────────────────────────
  async getMyReviews(params = {}) {
    const response = await withRetry(
      () => api.get("/api/v1/reviews/mine", { params }),
      "getMyReviews",
    );

    return response.data;
  },

  // ── Public User Reviews ───────────────────────────────────
    async getPublicReviews(params = {}) {
    const response = await withRetry(
      () => api.get("/api/v1/reviews", { params }),
      "getPublicReviews",
    );

    return response.data;
  },
};