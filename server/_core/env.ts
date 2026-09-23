export const ENV = {
  // App
  appId: process.env.VITE_APP_ID ?? "",

  // Authentication
  cookieSecret: process.env.JWT_SECRET ?? "",

  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // OAuth
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",

  // Environment
  isProduction: process.env.NODE_ENV === "production",

  // Old Forge configuration
  // Kept so existing project files do not break.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // OpenAI configuration
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-5.6-luna",
};