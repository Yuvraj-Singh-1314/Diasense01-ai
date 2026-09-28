import {
  AXIOS_TIMEOUT_MS,
  COOKIE_NAME,
  ONE_YEAR_MS,
  decodeOAuthState,
} from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import type {
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  GetUserInfoResponse,
  GetUserInfoWithJwtRequest,
  GetUserInfoWithJwtResponse,
} from "./types/manusTypes";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

const EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;

const GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;

const GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;

/* =========================================================
   OAUTH SERVICE
   ========================================================= */

class OAuthService {
  constructor(private client: ReturnType<typeof axios.create>) {
    if (ENV.oAuthServerUrl) {
      console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    } else {
      console.log(
        "[OAuth] OAuth server not configured. Using local authentication."
      );
    }
  }

  private decodeState(state: string): string {
    return decodeOAuthState(state).redirectUri;
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    if (!ENV.oAuthServerUrl) {
      throw new Error("OAuth server is not configured.");
    }

    const payload: ExchangeTokenRequest = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state),
    };

    const { data } = await this.client.post<ExchangeTokenResponse>(
      EXCHANGE_TOKEN_PATH,
      payload
    );

    return data;
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    if (!ENV.oAuthServerUrl) {
      throw new Error("OAuth server is not configured.");
    }

    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken,
      }
    );

    return data;
  }
}

/* =========================================================
   HTTP CLIENT
   ========================================================= */

const createOAuthHttpClient = (): AxiosInstance =>
  axios.create({
    baseURL: ENV.oAuthServerUrl,
    timeout: AXIOS_TIMEOUT_MS,
  });

/* =========================================================
   SDK SERVER
   ========================================================= */

class SDKServer {
  private readonly client: AxiosInstance;
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }

  /* =======================================================
     LOGIN METHOD
     ======================================================= */

  private deriveLoginMethod(
    platforms: unknown,
    fallback: string | null | undefined
  ): string | null {
    if (fallback && fallback.length > 0) {
      return fallback;
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return null;
    }

    const set = new Set<string>(
      platforms.filter((p): p is string => typeof p === "string")
    );

    if (set.has("REGISTERED_PLATFORM_EMAIL")) {
      return "email";
    }

    if (set.has("REGISTERED_PLATFORM_GOOGLE")) {
      return "google";
    }

    if (set.has("REGISTERED_PLATFORM_APPLE")) {
      return "apple";
    }

    if (
      set.has("REGISTERED_PLATFORM_MICROSOFT") ||
      set.has("REGISTERED_PLATFORM_AZURE")
    ) {
      return "microsoft";
    }

    if (set.has("REGISTERED_PLATFORM_GITHUB")) {
      return "github";
    }

    const first = Array.from(set)[0];

    return first ? first.toLowerCase() : null;
  }

  /* =======================================================
     OAUTH METHODS
     ======================================================= */

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    return this.oauthService.getTokenByCode(code, state);
  }

  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken,
    } as ExchangeTokenResponse);

    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );

    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoResponse;
  }

  /* =======================================================
     COOKIE PARSER
     ======================================================= */

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);

    return new Map(Object.entries(parsed));
  }

  /* =======================================================
     JWT SECRET
     ======================================================= */

  private getSessionSecret() {
    const secret = ENV.cookieSecret?.trim();

    if (!secret) {
      throw new Error(
        "JWT_SECRET is missing. Add JWT_SECRET to the .env file."
      );
    }

    return new TextEncoder().encode(secret);
  }

  /* =======================================================
     CREATE SESSION TOKEN
     ======================================================= */

  async createSessionToken(
    openId: string,
    options: {
      expiresInMs?: number;
      name?: string;
    } = {}
  ): Promise<string> {
    const safeOpenId = openId.trim();

    if (!safeOpenId) {
      throw new Error("Cannot create session without openId.");
    }

    return this.signSession(
      {
        openId: safeOpenId,

        appId: ENV.appId?.trim() || "diasense-local-auth",

        name: options.name?.trim() || safeOpenId,
      },
      options
    );
  }

  /* =======================================================
     SIGN JWT
     ======================================================= */

  async signSession(
    payload: SessionPayload,
    options: {
      expiresInMs?: number;
    } = {}
  ): Promise<string> {
    const issuedAt = Date.now();

    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;

    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,

      appId: payload.appId || "diasense-local-auth",

      name: payload.name || payload.openId,
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setIssuedAt(Math.floor(issuedAt / 1000))
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /* =======================================================
     VERIFY JWT
     ======================================================= */

  async verifySession(cookieValue: string | undefined | null): Promise<{
    openId: string;
    appId: string;
    name: string;
  } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();

      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });

      const openId =
        typeof payload.openId === "string" ? payload.openId.trim() : "";

      const appId =
        typeof payload.appId === "string" && payload.appId.trim()
          ? payload.appId.trim()
          : "diasense-local-auth";

      const name =
        typeof payload.name === "string" && payload.name.trim()
          ? payload.name.trim()
          : openId;

      if (!isNonEmptyString(openId)) {
        console.warn("[Auth] Session payload missing openId");

        return null;
      }

      return {
        openId,
        appId,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));

      return null;
    }
  }

  /* =======================================================
     OAUTH JWT USER INFO
     ======================================================= */

  async getUserInfoWithJwt(
    jwtToken: string
  ): Promise<GetUserInfoWithJwtResponse> {
    if (!ENV.oAuthServerUrl) {
      throw new Error("OAuth server is not configured.");
    }

    const payload: GetUserInfoWithJwtRequest = {
      jwtToken,
      projectId: ENV.appId,
    };

    const { data } = await this.client.post<GetUserInfoWithJwtResponse>(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );

    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );

    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoWithJwtResponse;
  }

  /* =======================================================
     AUTHENTICATE REQUEST
     ======================================================= */

  async authenticateRequest(req: Request): Promise<AuthenticatedUser> {
    /*
     * 1. Read local session cookie.
     */
    const cookies = this.parseCookies(req.headers.cookie);

    let sessionToken = cookies.get(COOKIE_NAME);

    /*
     * 2. Authorization Bearer
     *    fallback.
     */
    if (!sessionToken) {
      const authHeader = req.headers.authorization;

      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }

    /*
     * 3. Verify JWT.
     */
    const session = await this.verifySession(sessionToken);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    /*
     * 4. Cron sessions.
     *
     * Keep this functionality intact.
     */
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      if (!ENV.oAuthServerUrl) {
        throw ForbiddenError("Cron authentication requires OAuth server");
      }

      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");

      const taskUid = userInfo.taskUid ?? null;

      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }

      return buildCronUser(userInfo);
    }

    /*
     * 5. LOCAL EMAIL/PASSWORD AUTH
     *
     * Local registration/login already
     * creates the user in the database.
     *
     * Therefore we DO NOT call OAuth here.
     */
    const sessionUserId = session.openId;

    const signedInAt = new Date();

    const user = await db.getUserByOpenId(sessionUserId);

    /*
     * 6. Local user must exist.
     */
    if (!user) {
      throw ForbiddenError("Local user not found");
    }

    /*
     * 7. Update last signed-in time.
     */
    await db.upsertUser({
      openId: user.openId,

      lastSignedIn: signedInAt,
    });

    /*
     * 8. Return authenticated user.
     */
    return user;
  }
}

/* =========================================================
   CRON USER
   ========================================================= */

const CRON_OPEN_ID_PREFIX = "cron_";

export type AuthenticatedUser = User & {
  taskUid?: string;
  isCron?: boolean;
};

function buildCronUser(
  userInfo: GetUserInfoWithJwtResponse
): AuthenticatedUser {
  const now = new Date();

  return {
    id: -1,

    openId: userInfo.openId,

    name: userInfo.name || "Manus Scheduled Task",

    email: null,

    loginMethod: null,

    role: "user",

    createdAt: now,

    updatedAt: now,

    lastSignedIn: now,

    taskUid: userInfo.taskUid ?? undefined,

    isCron: true,
  } as AuthenticatedUser;
}

/* =========================================================
   SINGLETON
   ========================================================= */

export const sdk = new SDKServer();
