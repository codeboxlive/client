export class RequiresAuthError extends Error {
  constructor() {
    super("Authentication required");
  }
}
