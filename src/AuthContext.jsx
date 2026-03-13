import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
const OperationType = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LIST: "list",
  GET: "get",
  WRITE: "write",
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const AuthContext = createContext({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);

        // Listen to profile changes
        const unsubProfile = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data());
              setLoading(false);
            } else {
              // Initialize profile if it doesn't exist
              const newProfile = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || "Explorer",
                email: firebaseUser.email || "",
                level: 1,
                xp: 0,
                coins: 100,
                streak: 0,
                badges: [],
                unlockedZones: ["Coding Kingdom"],
                skills: {},
              };
              setDoc(userRef, newProfile).catch((err) =>
                handleFirestoreError(
                  err,
                  OperationType.WRITE,
                  `users/${firebaseUser.uid}`,
                ),
              );
              setProfile(newProfile);
              setLoading(false);
            }
          },
          (error) => {
            handleFirestoreError(
              error,
              OperationType.GET,
              `users/${firebaseUser.uid}`,
            );
            setLoading(false);
          },
        );

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
