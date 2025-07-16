import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../types';
import { loggingService } from '../services/loggingService'; // Import loggingService

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>
  // errorHandler?: (error: ApiError) => void // Remove errorHandler
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const apiError: ApiError = error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            code: error.name,
            status: (error as { status?: number }).status || 500
          }
        : {
            name: 'UNKNOWN_ERROR',
            message: 'Unknown error',
            code: 'UNKNOWN_ERROR',
            status: 500
          };
      
      setState({ data: null, loading: false, error: apiError });
      
      // Always log errors using loggingService
      loggingService.logError(error, { context: 'useAsync hook', apiError });
      
      // if (errorHandler) { // Remove errorHandler call
      //   errorHandler(apiError);
      // }
    }
  }, [asyncFunction]);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { ...state, refetch };
}
