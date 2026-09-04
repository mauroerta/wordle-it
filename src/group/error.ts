const SIGN_IN_MESSAGE = "Accedi per i gruppi"

export class GroupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GroupError"
  }

  static signIn(): GroupError {
    return new GroupError(SIGN_IN_MESSAGE)
  }
}

// Server function errors cross the wire as plain Error, so match the message.
export function signInRequired(error: unknown): boolean {
  return error instanceof Error && error.message === SIGN_IN_MESSAGE
}
