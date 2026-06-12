import { PrismaClient } from '@prisma/client';
import { verifyFirebaseToken } from './firebase_auth';
import { DecodedIdToken } from 'firebase-admin/auth';

const prisma = new PrismaClient();

export async function checkOrCreateUser(uid: string, decodedData: DecodedIdToken): Promise<any> {
  return prisma.user.upsert({
    create: {
      email: decodedData.email,
      firebase_uid: uid,
      full_name: decodedData.displayName ?? 'Unknown',
    },
    update: {},
    where: { firebase_uid: uid },
  });
}