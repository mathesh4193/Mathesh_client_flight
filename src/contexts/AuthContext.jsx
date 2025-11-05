import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async (form) => {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      dateOfBirth: form.dateOfBirth,
      preferences: {
        seatPreference: form.seatPreference,
        mealPreference: form.mealPreference,
      },
    };
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      alert(" Registration successful!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    }
  };

  const login = async ({ email, password }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (profile) => {
    try {
      const { data } = await api.put("/user/me", profile);
      setUser(data.user);
      alert(" Profile updated successfully!");
    } catch {
      alert("Failed to update profile.");
    }
  };

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, updateProfile, api }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
