/**
 * Environment configuration for the server
 */
export const ENV = {
  ownerOpenId: process.env.OWNER_OPEN_ID || "",
  ownerEmail: process.env.OWNER_EMAIL || "",
  ownerPhone: process.env.OWNER_PHONE || "",
  publicAppUrl: process.env.PUBLIC_APP_URL || "",
  databaseUrl: process.env.DATABASE_URL || "",
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
};
