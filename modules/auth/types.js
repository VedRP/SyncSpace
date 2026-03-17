/**
 * User object shape reference.
 * Since we're using plain JavaScript (no TypeScript),
 * this file documents the expected data structures
 * for the auth module.
 */

/**
 * User object returned from API (password excluded)
 *
 * @typedef {Object} User
 * @property {string} _id        - MongoDB ObjectId
 * @property {string} name       - User's display name
 * @property {string} email      - User's email address
 * @property {string} role       - "admin" or "member"
 * @property {string} avatar     - Avatar URL (optional)
 * @property {string} createdAt  - ISO timestamp
 * @property {string} updatedAt  - ISO timestamp
 */

/**
 * Login request payload
 *
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * Register request payload
 *
 * @typedef {Object} RegisterPayload
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * Auth response from login API
 *
 * @typedef {Object} AuthResponse
 * @property {boolean} success
 * @property {string}  token    - JWT token
 * @property {User}    user     - User data (no password)
 * @property {string}  [message] - Error message if failed
 */

export default {};
