import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private auth: admin.auth.Auth | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length > 0) {
      this.auth = admin.auth();
      return;
    }

    process.env.DB_USER
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (credentialsPath) {
      try {
        const resolved = path.isAbsolute(credentialsPath)
          ? credentialsPath
          : path.resolve(process.cwd(), credentialsPath);
        const keyFile = JSON.parse(fs.readFileSync(resolved, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(keyFile) });
      } catch (e) {
        console.warn('Firebase: could not load GOOGLE_APPLICATION_CREDENTIALS', e);
      }
    } else if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      try {
        admin.initializeApp();
      } catch {
      }
    }
    this.auth = admin.apps.length > 0 ? admin.auth() : null;
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    if (!this.auth) {
      throw new Error('Firebase Admin is not initialized.');
    }
    return this.auth.verifyIdToken(idToken);
  }
}
