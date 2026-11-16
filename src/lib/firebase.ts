import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: 'AIzaSyDCBzAWf8_GEKf3TBYr0JOHq4MRHw2b-wo',
  authDomain: 'azee-12ad7.firebaseapp.com',
  projectId: 'azee-12ad7',
  storageBucket: 'azee-12ad7.firebasestorage.app',
  messagingSenderId: '202396458640',
  appId: '1:202396458640:web:9e65d06425978b71d6c215',
  measurementId: 'G-1PEX55CDBW',
};

export const ADMIN_UID = 'osCRozo2yBgIk3TD0PLmRMcd2RC3';

export const BRAND_INFO = {
  name: 'LibasVibe by FARHAN',
  shortName: 'LibasVibe',
  domain: 'libasvibe.com',
  phone: '03393923100',
  whatsappIntl: '923393923100',
  email: 'libasvibebyfarhan@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61596505704038&mibextid=ZbWKwL',
  instagram: 'https://www.instagram.com/libasvibe_by_farhan?xtok=MnJ5bzc3bzFoenll',
  logoUrl: 'https://i.postimg.cc/vHwWnc32/logo.jpg',
  fallbackLogoUrl: '/logo.jpg',
  standardDeliveryFee: 199,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics optional in restricted environments
    });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isPermissionDeniedError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.toLowerCase().includes('permission') ||
    msg.toLowerCase().includes('insufficient')
  );
}

export function buildFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  silent = false
): Error {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  const jsonMsg = JSON.stringify(errInfo);
  if (!silent) {
    console.warn('Firestore notice:', jsonMsg);
  }
  return new Error(jsonMsg);
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes('offline')
    ) {
      return false;
    }
    return true;
  }
}
