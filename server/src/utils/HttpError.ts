export class HttpError extends Error {
  constructor(public status: number, message: string, public errors?: unknown) { super(message); }
}