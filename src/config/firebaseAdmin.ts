import firebaseAdmin from "firebase-admin";

import dotenv from "dotenv";

dotenv.config();

const formatPrivateKey = (privateKey: string): string => {
  privateKey = privateKey.trim();

  privateKey = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "");

  privateKey = privateKey.replace(/\\n/g, "");

  const lines: string[] = [];
  for (let i = 0; i < privateKey.length; i += 64) {
    lines.push(privateKey.substr(i, 64));
  }

  let processedKey = lines.join("\n");

  processedKey =
    "-----BEGIN PRIVATE KEY-----\n" +
    processedKey +
    "\n-----END PRIVATE KEY-----\n";

  return processedKey;
};

export const firebaseAdminConfig = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY!),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN,
} as any;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseAdminConfig),
});

export { firebaseAdmin };
