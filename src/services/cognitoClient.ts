import 'react-native-get-random-values';
import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

export const poolData = {
  UserPoolId: "ap-south-1_RhUmtCFhx",
  ClientId: "4qp727h14n606fb0thoikhb5oo",
};

export const userPool = new CognitoUserPool(poolData);

// Get current logged-in user session
export function getCurrentSession(): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) return reject(new Error("No current user"));
    user.getSession((err: any, session: CognitoUserSession) => {
      if (err) return reject(err);
      if (!session.isValid()) return reject(new Error("Session invalid"));
      resolve(session);
    });
  });
}

// Get current user + attributes
export function getCurrentUserAttributes(): Promise<{
  userId: string;
  username: string;
  email: string;
  name: string;
  role: string;
  preferredUsername: string;
}> {
  return new Promise((resolve, reject) => {
    const user = userPool.getCurrentUser();
    if (!user) return reject(new Error("No current user"));
    user.getSession((err: any, session: CognitoUserSession) => {
      if (err) return reject(err);
      if (!session.isValid()) return reject(new Error("Session invalid"));
      user.getUserAttributes((attrErr, attrs) => {
        if (attrErr) return reject(attrErr);
        const map: any = {};
        attrs?.forEach((a) => (map[a.getName()] = a.getValue()));
        resolve({
          userId: map.sub || "",
          username: user.getUsername(),
          email: map.email || "",
          name: map.name || map.preferred_username || map.email?.split("@")[0] || "",
          role: map["custom:role"] === "doctor" ? "doctor" : "caregiver",
          preferredUsername: map.preferred_username || "",
        });
      });
    });
  });
}

// Sign out current user
export function signOutUser(global = false): Promise<void> {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) return resolve();
    if (global) {
      user.globalSignOut({
        onSuccess: () => resolve(),
        onFailure: () => resolve(), // resolve anyway
      });
    } else {
      user.signOut();
      resolve();
    }
  });
}
