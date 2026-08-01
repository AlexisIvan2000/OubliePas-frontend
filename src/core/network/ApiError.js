export class ApiError extends Error {
  constructor({ status, code, message, fieldErrors = [] }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isValidation() {
    return this.code === "VALIDATION_ERROR";
  }

  get isNetwork() {
    return this.code === "NETWORK_ERROR";
  }

  get isRateLimited() {
    return this.status === 429;
  }
}

export function toFieldErrorMap(error) {
  if (!(error instanceof ApiError) || !error.fieldErrors.length) {
    return {};
  }
  return error.fieldErrors.reduce((map, entry) => {
    if (!map[entry.field]) {
      map[entry.field] = entry.message;
    }
    return map;
  }, {});
}
