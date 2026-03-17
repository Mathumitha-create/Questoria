import admin from "firebase-admin";

let firebaseReady = false;

function normalizePrivateKey(rawKey) {
  if (!rawKey) return "";

  const trimmed = String(rawKey).trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  const normalized = unquoted.replace(/\\n/g, "\n");

  const looksLikePem =
    normalized.includes("-----BEGIN PRIVATE KEY-----") &&
    normalized.includes("-----END PRIVATE KEY-----");
  const isPlaceholder = normalized.includes("...");

  if (!looksLikePem || isPlaceholder) return "";
  return normalized;
}

export function initFirebaseAdmin() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    // eslint-disable-next-line no-console
    console.warn(
      "⚠️ Firebase Admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and a valid FIREBASE_PRIVATE_KEY.",
    );
    return null;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    firebaseReady = true;
    return admin;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      "⚠️ Firebase Admin credential is invalid. Google token verification will be disabled.",
    );
    // eslint-disable-next-line no-console
    console.warn(error?.message || error);
    firebaseReady = false;
    return null;
  }
}

export async function verifyFirebaseIdToken(idToken) {
  if (!firebaseReady) {
    throw new Error("Firebase Admin is not initialized");
  }

  return admin.auth().verifyIdToken(idToken);
}
