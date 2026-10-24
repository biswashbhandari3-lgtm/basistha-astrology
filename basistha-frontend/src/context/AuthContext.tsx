"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  quickDemoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check saved session in localStorage
    try {
      const saved = localStorage.getItem("basistha_auth_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to read user from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulating authentication (or connecting to FastAPI /api/v1/auth/login)
    await new Promise(r => setTimeout(r, 600));

    if (password.length >= 4) {
      const loggedUser: User = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        name: email.split("@")[0].toUpperCase() || "ज्योतिष अनुसन्धाता",
        email: email,
        role: "astrologer",
        role_ne: "प्रमाणित ज्योतिषी",
        token: "jwt_basistha_" + Date.now()
      };
      setUser(loggedUser);
      localStorage.setItem("basistha_auth_user", JSON.stringify(loggedUser));
      setIsLoginModalOpen(false);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const roleNameNe = role === "astrologer" ? "ज्योतिष विज्ञ" : "सामान्य प्रयोगकर्ता";
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name,
      email: email,
      role: role as any,
      role_ne: roleNameNe,
      token: "jwt_basistha_" + Date.now()
    };
    setUser(newUser);
    localStorage.setItem("basistha_auth_user", JSON.stringify(newUser));
    setIsLoginModalOpen(false);
    setIsLoading(false);
    return true;
  };

  const quickDemoLogin = () => {
    const demoUser: User = {
      id: "usr_demo_108",
      name: "पण्डित वसिष्ठ (Demo)",
      email: "astrologer@basistha.com",
      role: "astrologer",
      role_ne: "वरिष्ठ ज्योतिषी (Admin)",
      token: "jwt_basistha_demo_token"
    };
    setUser(demoUser);
    localStorage.setItem("basistha_auth_user", JSON.stringify(demoUser));
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("basistha_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
