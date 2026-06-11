class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status || 500;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource Not Found") {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation Error", details = null) {
    super(message, 422);
    this.details = details;
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
};
