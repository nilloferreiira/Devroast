/**
 * Returns the absolute base URL for the current environment.
 * Safe to use in server components, route handlers, and generateMetadata.
 */
export const getBaseUrl = (): string => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};
