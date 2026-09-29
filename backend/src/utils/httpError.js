// Create an Error carrying an HTTP status so errorHandler can format it
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
