export enum ErrorType {
  NotFound,
  InvalidPassword,
  DuplicateEmail,
}

export abstract class CustomError extends Error {}

export class NotFoundError extends CustomError {
  constructor(message: string, public type = ErrorType.NotFound) {
    super(message);
  }
}

export class InvalidPasswordError extends CustomError {
  constructor(message: string, public type = ErrorType.InvalidPassword) {
    super(message);
  }
}

export class DuplicateEmailError extends CustomError {
  constructor(message: string, public type = ErrorType.DuplicateEmail) {
    super(message);
  }
}
