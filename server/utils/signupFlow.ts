export interface SignupRequest {
  email: string;
  password: string;
  options?: {
    data?: Record<string, any>;
  };
}

export interface SignupResponse {
  ok: boolean;
  verificationMailSent?: boolean;
  code?: string;
  message?: string;
}

interface SignupDeps {
  signUp: (
    email: string,
    password: string,
    options?: { data?: Record<string, any> }
  ) => Promise<{ error: { message: string; status?: number } | null; userId: string | null }>;
  sendVerificationEmail: (email: string, userId: string, language?: string) => Promise<{ error: string | null }>;
  logger?: Pick<Console, 'warn'>;
}

const errorCodeFromStatus = (status?: number) => {
  if (status === 400) return 'INVALID_INPUT';
  if (status === 422) return 'WEAK_PASSWORD';
  if (status === 429) return 'RATE_LIMITED';
  return 'SIGNUP_FAILED';
};

export const runSignupFlow = async (input: SignupRequest, deps: SignupDeps): Promise<SignupResponse> => {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Email and password are required.'
    };
  }

  const signupResult = await deps.signUp(email, password, input.options);
  if (signupResult.error) {
    return {
      ok: false,
      code: errorCodeFromStatus(signupResult.error.status),
      message: signupResult.error.message
    };
  }

  if (!signupResult.userId) {
    deps.logger?.warn('[signup] missing user id after signUp');
    return { ok: true, verificationMailSent: false };
  }

  const language = input.options?.data?.language;
  const mailResult = await deps.sendVerificationEmail(email, signupResult.userId, language);
  if (mailResult.error) {
    deps.logger?.warn('[signup] optional verification email failed:', mailResult.error);
    return { ok: true, verificationMailSent: false };
  }

  return { ok: true, verificationMailSent: true };
};
