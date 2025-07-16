export const loggingService = {
  logError: (error: unknown, context?: { [key: string]: unknown }) => {
    console.groupCollapsed('Application Error Log');
    console.error('Error:', error);
    if (context) {
      console.log('Context:', context);
    }
    console.groupEnd();
  },
};