import { describe, expect, it, vi } from 'vitest';
import { runSignupFlow } from './signupFlow';

describe('runSignupFlow', () => {
  it('returns invalid input for missing email/password', async () => {
    const result = await runSignupFlow(
      { email: '', password: '' },
      {
        signUp: vi.fn(),
        sendVerificationEmail: vi.fn()
      }
    );

    expect(result).toEqual({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Email and password are required.'
    });
  });

  it('returns signup error when signUp fails', async () => {
    const result = await runSignupFlow(
      { email: 'a@b.com', password: 'secret123' },
      {
        signUp: vi.fn().mockResolvedValue({
          error: { message: 'User already registered', status: 400 },
          userId: null
        }),
        sendVerificationEmail: vi.fn()
      }
    );

    expect(result).toEqual({
      ok: false,
      code: 'INVALID_INPUT',
      message: 'User already registered'
    });
  });

  it('keeps signup successful if verification email send fails', async () => {
    const warn = vi.fn();

    const result = await runSignupFlow(
      { email: 'a@b.com', password: 'secret123' },
      {
        signUp: vi.fn().mockResolvedValue({ error: null, userId: 'u-1' }),
        sendVerificationEmail: vi.fn().mockResolvedValue({ error: 'smtp down' }),
        logger: { warn }
      }
    );

    expect(result).toEqual({ ok: true, verificationMailSent: false });
    expect(warn).toHaveBeenCalledWith('[signup] optional verification email failed:', 'smtp down');
  });

  it('returns success when signup and verification mail work', async () => {
    const result = await runSignupFlow(
      { email: 'a@b.com', password: 'secret123' },
      {
        signUp: vi.fn().mockResolvedValue({ error: null, userId: 'u-1' }),
        sendVerificationEmail: vi.fn().mockResolvedValue({ error: null })
      }
    );

    expect(result).toEqual({ ok: true, verificationMailSent: true });
  });

  it('does not fail signup if userId is missing', async () => {
    const warn = vi.fn();
    const sendVerificationEmail = vi.fn();

    const result = await runSignupFlow(
      { email: 'a@b.com', password: 'secret123' },
      {
        signUp: vi.fn().mockResolvedValue({ error: null, userId: null }),
        sendVerificationEmail,
        logger: { warn }
      }
    );

    expect(result).toEqual({ ok: true, verificationMailSent: false });
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('[signup] missing user id after signUp');
  });
});
