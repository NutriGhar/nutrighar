'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerSession } from '@/lib/customerAuth';

interface CustomerAuthContextType {
  customer: CustomerSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string, name?: string) => Promise<{ success: boolean; message?: string; demoOtp?: string; error?: string }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (emailOrPhone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithPassword: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCustomer(data.user);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const sendOtp = async (phone: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (phone: string, otp: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCustomer(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Verification failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification error' };
    }
  };

  const loginWithPassword = async (emailOrPhone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCustomer(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  const registerWithPassword = async (formData: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCustomer(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setCustomer(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithPassword,
        registerWithPassword,
        logout,
        refreshSession,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
