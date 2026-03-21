# Authentication Security Audit

**Last Audit Date**: 2026-03-21
**Auditor**: Auth Security Agent

## Executive Summary

The DevStash authentication implementation is well-structured and demonstrates solid security fundamentals: bcrypt with 12 rounds, cryptographically-secure token generation via `crypto.randomUUID()`, single-use token enforcement, generic success messages on sensitive flows, and proper session-based authorization on all sensitive server actions. Three actionable issues were found — no none are critical — primarily around the absence of rate limiting on publicly-accessible auth endpoints and a missing maximum password length cap that could enable bcrypt DoS.

---

## Findings

### Critical Issues

_None._

---

### High Severity

#### Missing Rate Limiting on All Auth Endpoints

**Severity**: High
**Files**:
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/verify-email/route.ts`

**Vulnerable Code**:
```typescript
export async function POST(request: Request) {
  // No rate limiting — any caller can hammer this endpoint
  const body = await request.json();
  ...
  const hashedPassword = await bcrypt.hash(password, 12); // ~200ms CPU per call
}
```

**Problem**: None of the auth API routes enforce rate limiting. Attackers can:
1. **Brute-force credentials** via the NextAuth credentials flow (login is unbounded).
2. **Email bomb** victims by repeatedly hitting `/api/auth/forgot-password`.
3. **DoS the server** via bcrypt CPU exhaustion on `/api/auth/register` (each call with a long password takes ~200ms of CPU).

**Attack Scenario**: An attacker writes a script that calls `/api/auth/forgot-password` with a victim's email every second. Resend API limits aside, this is an unacceptable UX attack. For credentials brute-force, an attacker can try thousands of passwords with only a network bottleneck.

**Fix** — use an in-memory or Redis-backed rate limiter. The simplest approach for Next.js is `@upstash/ratelimit` (works on Edge + Node):

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 m'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }
  // ... rest of handler
}
```

Use tighter limits for reset (e.g. 3/hour) vs register (e.g. 5/10min).

---

### Medium Severity

#### No Maximum Password Length (bcrypt DoS Vector)

**Severity**: Medium
**Files**:
- `src/app/api/auth/register/route.ts` (line 25)
- `src/app/api/auth/reset-password/route.ts` (line 35)
- `src/actions/profile.ts` (line 37)

**Vulnerable Code**:
```typescript
// Only a minimum is checked — no maximum
if (password.length < 8) {
  return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
}
const hashedPassword = await bcrypt.hash(password, 12); // bcrypt truncates at 72 bytes but hashing a 1MB payload still takes CPU
```

**Problem**: bcrypt silently truncates passwords at 72 bytes and its cost is roughly proportional to input length in some implementations. More critically, accepting arbitrarily large strings through API requests is a general DoS concern: the server parses, allocates, and processes a giant string before truncating. A password of 1 MB still consumes memory and partial CPU time.

**Attack Scenario**: An attacker posts `{"password": "<1MB string>"}` to the register endpoint in a tight loop, exhausting request memory and bcrypt threads.

**Fix**:
```typescript
if (password.length < 8 || password.length > 128) {
  return NextResponse.json(
    { error: 'Password must be between 8 and 128 characters.' },
    { status: 400 }
  );
}
```

Apply this check in all three locations before calling `bcrypt.hash`.

---

#### Token Namespace Collision Between Verification and Reset Flows

**Severity**: Medium
**File**: `src/lib/email/verification.ts` (lines 8–22), `src/lib/email/password-reset.ts` (lines 8–9)

**Vulnerable Code**:
```typescript
// verification.ts — shared by BOTH email verification AND password reset
export async function createVerificationToken(
  email: string,
  expiresInMs = VERIFICATION_EXPIRES_MS
): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } }); // deletes ALL tokens for email
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
  return token;
}
```

```typescript
// password-reset.ts
const token = await createVerificationToken(email, RESET_EXPIRES_MS); // same table, same identifier
```

**Problem**: Both the email verification flow and the password reset flow share the same `VerificationToken` table with the same `identifier` (email). The `deleteMany` call at the top of `createVerificationToken` wipes **all tokens** for that email before creating a new one. This means:

- If a user registers (gets a verification token) and then immediately requests a password reset, the verification token is deleted. On the next click of the verification link, it will fail as "invalid-token".
- Conversely, a password reset request will invalidate a pending verification token.

While this requires a specific race condition, it can cause support issues and unexpected UX failures. It's also structurally incorrect — two distinct flows share a mutable global namespace.

**Attack Scenario**: A malicious user can intentionally invalidate another user's verification email by triggering a password reset for that user's address, since `forgot-password` calls `sendPasswordResetEmail` which calls `createVerificationToken` which deletes all tokens for that identifier.

**Fix** — add a `type` discriminator column to the `VerificationToken` model:

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  type       String   @default("email_verification") // "email_verification" | "password_reset"

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

Then scope `deleteMany` by type:
```typescript
await prisma.verificationToken.deleteMany({
  where: { identifier: email, type: tokenType },
});
```

---

### Low Severity

#### `NEXTAUTH_URL` Fallback to Localhost in Server Actions

**Severity**: Low
**Files**: `src/actions/auth.ts` (line 56), `src/actions/password-reset.ts` (line 21–22)

**Vulnerable Code**:
```typescript
const res = await fetch(
  `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/register`,
  ...
);
```

**Problem**: Server actions make a loopback HTTP fetch to own API routes. If `NEXTAUTH_URL` is not set in a production environment, the fallback is `localhost:3000`, which will silently fail or hit the wrong service. While this is a configuration/ops issue rather than a direct security flaw, the pattern also bypasses server-to-server request auth — any server action can call any internal route without authentication.

**Fix**: Extract the shared registration and reset logic directly into shared `lib/` functions rather than making an HTTP round-trip to your own API. This is more idiomatic Next.js, eliminates the env-variable risk, and reduces latency:

```typescript
// Instead of fetch('/api/auth/register'), call the shared logic directly:
import { createUser } from '@/lib/auth/register';

export async function registerUser(...) {
  const result = await createUser({ name, email, password });
  ...
}
```

---

#### Email Verification Bypass Is Env-Only Controlled

**Severity**: Low
**File**: `src/lib/constants/auth.ts`

**Vulnerable Code**:
```typescript
export const EMAIL_VERIFICATION_ENABLED =
  process.env.EMAIL_VERIFICATION_ENABLED !== 'false';
```

**Problem**: Setting `EMAIL_VERIFICATION_ENABLED=false` disables the entire verification system, globally auto-verifying all new registrations and removing the sign-in check. If this variable is accidentally set in production (e.g., copied from a dev `.env`), all new users bypass verification silently. There is no defensive check against this running in a production context.

**Fix**: Add a guard that logs a warning if verification is disabled in production:

```typescript
const verificationDisabled = process.env.EMAIL_VERIFICATION_ENABLED === 'false';

if (verificationDisabled && process.env.NODE_ENV === 'production') {
  console.warn(
    '[Security Warning] EMAIL_VERIFICATION_ENABLED is disabled in production. All new users will be auto-verified.'
  );
}

export const EMAIL_VERIFICATION_ENABLED = !verificationDisabled;
```

---

## Passed Checks ✅

- **bcrypt with 12 rounds** — above the commonly accepted minimum of 10. `src/app/api/auth/register/route.ts:25`, `src/actions/profile.ts:37`
- **No plaintext passwords logged or returned** — passwords are never in error responses or console logs
- **Cryptographically secure token generation** — `crypto.randomUUID()` (CSPRNG-backed) used for all tokens in `src/lib/email/verification.ts:12`
- **Verification tokens are single-use** — deleted immediately after successful use in `verify-email/route.ts:28` and `reset-password/route.ts:42`
- **Expired tokens are cleaned up** — both routes delete expired tokens on attempt rather than leaving them in the DB
- **Reset tokens expire in 1 hour** — correctly short-lived in `src/lib/email/password-reset.ts:6`
- **Generic success messages on sensitive flows** — forgot-password and registration do not disclose whether an email exists
- **Session ID used for all mutations** — `changePassword` and `deleteAccount` both read `session.user.id` from the server session, never from user input
- **OAuth accounts blocked from password change** — `changePassword` correctly returns an error for users without a password field
- **Middleware protects `/dashboard` and `/profile`** — `src/proxy.ts` enforces authentication on all protected routes
- **Email format validation** — regex validated in both `registerUser` and `requestPasswordReset` actions before DB access
- **Minimum password length enforced** — 8 characters enforced server-side in register, reset-password, and changePassword
- **Cascading deletes** — schema uses `onDelete: Cascade` on all user-related models; `deleteAccount` correctly uses Prisma's cascading rather than manual cleanup

---

## Recommendations Summary

| Priority | Issue | Effort |
|---|---|---|
| 1 (High) | Add rate limiting to all public auth API routes | Medium — integrate Upstash or use `next-rate-limit` |
| 2 (Medium) | Add maximum password length validation (128 chars) | Low — 1-line change in 3 files |
| 3 (Medium) | Add `type` column to `VerificationToken` to prevent cross-flow token invalidation | Medium — requires DB migration + code update |
| 4 (Low) | Eliminate loopback HTTP fetch in server actions — call shared lib functions directly | Medium — refactor register + forgot-password logic into lib |
| 5 (Low) | Add production warning when `EMAIL_VERIFICATION_ENABLED=false` | Low — 3-line guard |
