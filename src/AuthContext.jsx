import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { signInWithGoogle as firebaseGoogleSignIn, auth } from "./firebase";
import { api, getStoredToken, setStoredToken } from "./lib/api";

const AuthContext = createContext({
  user: null,
  profile: null,
  token: "",
  loading: true,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

function normalizeUser(user) {
  return {
    uid: user.id,
    email: user.email,
    displayName: user.username,
  };
}

function normalizeProfile(user) {
  return {
    uid: user.id,
    displayName: user.username,
    email: user.email,
    photoURL: user.profilePhoto,
    role: user.role,
    level: user.level,
    levelTitle: user.levelTitle,
    points: user.points ?? user.xpPoints,
    xp: user.xpPoints,
    xpPoints: user.xpPoints,
    streak: user.streak,
    weeklyPoints: user.weeklyPoints || 0,
    interviewsCompleted: user.interviewsCompleted || 0,
    badges: user.badges || [],
    problemsSolved: user.problemsSolved || 0,
    contestRating: user.contestRating || 1200,
  };
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = (nextToken, backendUser) => {
    setStoredToken(nextToken);
    setToken(nextToken);
    setUser(normalizeUser(backendUser));
    setProfile(normalizeProfile(backendUser));

    api
      .post("/gamification/reward/update", { action: "daily_login" })
      .then(() => refreshProfile())
      .catch(() => {});
  };

  const clearSession = () => {
    setStoredToken("");
    setToken("");
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const { user: backendUser } = await api.get("/auth/me");
    setUser(normalizeUser(backendUser));
    setProfile(normalizeProfile(backendUser));
  };

  useEffect(() => {
    const bootstrap = async () => {
      const existingToken = getStoredToken();
      if (!existingToken) {
        setLoading(false);
        return;
      }

      setToken(existingToken);
      try {
        await refreshProfile();
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    const { token: jwt, user: backendUser } = await api.post("/auth/login", {
      email,
      password,
    });
    applySession(jwt, backendUser);
  };

  const signup = async (username, email, password) => {
    const { token: jwt, user: backendUser } = await api.post("/auth/signup", {
      username,
      email,
      password,
    });
    applySession(jwt, backendUser);
  };

  const loginWithGoogle = async () => {
    const cred = await firebaseGoogleSignIn();
    const idToken = await cred.user.getIdToken();
    const { token: jwt, user: backendUser } = await api.post("/auth/google", {
      idToken,
    });
    applySession(jwt, backendUser);
  };

  const forgotPassword = async (email) => {
    return api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (tokenValue, password) => {
    return api.post("/auth/reset-password", { token: tokenValue, password });
  };

  const logout = () => {
    auth.signOut().catch(() => {});
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      token,
      loading,
      login,
      signup,
      loginWithGoogle,
      forgotPassword,
      resetPassword,
      logout,
      refreshProfile,
    }),
    [user, profile, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
