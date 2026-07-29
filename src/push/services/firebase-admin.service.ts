import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  App,
  Credential,
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { Messaging, getMessaging } from 'firebase-admin/messaging';

/**
 * Lazily initialises the Firebase Admin SDK from environment credentials so the
 * app boots even when push isn't configured. When credentials are absent it
 * stays disabled and every send becomes a logged no-op (like the Paystack
 * fallback), so nothing downstream breaks.
 *
 * Configure with ONE of:
 *  - FIREBASE_SERVICE_ACCOUNT           (the full service-account JSON as a string)
 *  - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *  - GOOGLE_APPLICATION_CREDENTIALS     (path; picked up by applicationDefault())
 */
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app: App | null = null;

  onModuleInit() {
    if (getApps().length) {
      this.app = getApp();
      return;
    }

    const credential = this.resolveCredential();
    if (!credential) {
      console.warn(
        '[FirebaseAdminService] No Firebase credentials found — push notifications are disabled. ' +
          'Set FIREBASE_SERVICE_ACCOUNT (or FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY) to enable.',
      );
      return;
    }

    try {
      this.app = initializeApp({ credential });
    } catch (err) {
      console.error('[FirebaseAdminService] Failed to initialise Firebase Admin:', err);
      this.app = null;
    }
  }

  private resolveCredential(): Credential | null {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
      try {
        return cert(JSON.parse(raw));
      } catch (err) {
        console.error('[FirebaseAdminService] FIREBASE_SERVICE_ACCOUNT is not valid JSON:', err);
        return null;
      }
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Private keys in env commonly have escaped newlines — unescape them.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (projectId && clientEmail && privateKey) {
      return cert({ projectId, clientEmail, privateKey });
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return applicationDefault();
    }

    return null;
  }

  get enabled(): boolean {
    return this.app !== null;
  }

  messaging(): Messaging | null {
    return this.app ? getMessaging(this.app) : null;
  }
}
