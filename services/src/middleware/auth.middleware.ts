import { RequestHandler } from "express";
import { verifyToken } from "@clerk/backend";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import {
  ACCOUNT_AUTH_CACHE_TTL_SECONDS,
  getAccountAuthCacheKey,
} from "../config/constants.js";
import { redis } from "../config/redis.js";
import { db } from "../database/client.js";
import { accounts } from "../database/schema.js";
import { and, eq } from "drizzle-orm";

const accountRoles = ["client", "freelancer"] as const;
type AccountRole = (typeof accountRoles)[number];

interface CachedAccountAuth {
  userId: string;
  role: "client" | "freelancer";
  accountExists: boolean;
  isOnboarded: boolean;
}

const isAccountRole = (value: unknown): value is AccountRole =>
  typeof value === "string" && (accountRoles as readonly string[]).includes(value);

const getBearerToken = (
  authorizationHeader: string | undefined,
): string | null => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
};

const isAccountAvailable = async (
  requestedRole: "client" | "freelancer",
  userId: string,
) => {
  const cacheKey = getAccountAuthCacheKey(userId, requestedRole);
  const cacheValue = await redis.get(cacheKey);

  if (cacheValue) {
    await redis.expire(cacheKey, ACCOUNT_AUTH_CACHE_TTL_SECONDS);
    return JSON.parse(cacheValue);
  }
  const databaseRole = requestedRole === "client" ? "CLIENT" : "FREELANCER";
  const [account] = await db
    .select({
      isOnboardingComplete: accounts.is_onboarding_complete,
    })
    .from(accounts)
    .where(and(eq(accounts.auth_id, userId), eq(accounts.role, databaseRole)))
    .limit(1);

    const accountAuth = {
        userId,
        accountExists: Boolean(account),
        role: requestedRole,
        isOnboarded: account?.isOnboardingComplete === true
    }

    await redis.setEx(cacheKey, ACCOUNT_AUTH_CACHE_TTL_SECONDS, JSON.stringify(accountAuth))
    return accountAuth;
};

export const isAuthenticated: RequestHandler = asyncHandler(
  async (request, response, next) => {
    const token = getBearerToken(request.headers.authorization);
    const rawRole = request.body?.role ?? request?.query?.role;
    if (!token) {
      throw new ApiError("Unauthorized", 401);
    }

    if (!isAccountRole(rawRole)) {
      throw new ApiError("Forbidden", 403);
    }
    let claims: Awaited<ReturnType<typeof verifyToken>>;
    const requestedRole: AccountRole = rawRole;
    try {
      claims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const accountAuth = await isAccountAvailable(requestedRole, claims.sub);
      request.auth = {
        userId: claims.sub,
        sessionId: typeof claims.sid === "string" ? claims.sid : undefined,
        role: requestedRole,
        accountExists: accountAuth.accountExists,
        isOnboarded: accountAuth.isOnboarded
      }
    } catch (err) {
      throw new ApiError("Authenticated fail", 401);
    }
  },
);
