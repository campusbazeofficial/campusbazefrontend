import { useErrorStore } from '@/stores/errorStore';
import { resolveError } from '@/utils/errorResolver';

export function useErrorHandler() {
  const errorStore = useErrorStore();

  const handleError = (error) => {
    const normalized = resolveError(error);

    errorStore.setError({
      message: normalized.message,
      type: normalized.type,
      status: normalized.status || null,
    });
  };

  return { handleError };
}