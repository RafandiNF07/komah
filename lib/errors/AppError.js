export class AppError extends Error {
  constructor(message, code, severity = 'error') {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity; // 'info' | 'warning' | 'error'
  }
}
