export class PasswordException extends Error {}
export class InvalidPDFException extends Error {}
export class UnknownErrorException extends Error {
  constructor(message, details) {
    super(message);
    this.name = "UnknownErrorException";
    this.details = details;
  }
}

export function getDocument() {
  return {
    promise: Promise.resolve({
      numPages: 1,
      getPage: async () => {
        throw new UnknownErrorException(
          "synthetic format failure",
          "FormatError: Corrupted page tree dictionary",
        );
      },
    }),
    destroy: async () => {},
  };
}
