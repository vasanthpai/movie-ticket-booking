/**
 * Public, browser-safe configuration.
 *
 * NEXT_PUBLIC_ variables are copied into the JavaScript bundle at BUILD time,
 * so never put secrets in them. Next.js only inlines literal references like
 * `process.env.NEXT_PUBLIC_API_URL` — `process.env[name]` would be undefined
 * in the browser.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See frontend/.env.example.`);
  }
  return value;
}

export const config = {
  /** Base URL of the Express backend, e.g. http://localhost:5000 */
  apiUrl: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
};
