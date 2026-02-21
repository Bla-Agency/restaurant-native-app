import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthResponse, LoginCredentials, SignupCredentials } from '../types/index';
import api from './client';

async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/signup', credentials);
  return response.data;
}

async function logout(token: string): Promise<void> {
  await api.post('/auth/logout', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function verify(token: string): Promise<AuthResponse['user']> {
  const response = await api.get<AuthResponse['user']>('/auth/verify', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('[auth] verify response:', response.data);
  return response.data;
}

export const useLoginMutation = () =>
  useMutation({
    mutationFn: login,
  });

export const useSignupMutation = () =>
  useMutation({
    mutationFn: signup,
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: logout,
  });

export const useVerifyQuery = (token: string | null) =>
  useQuery({
    queryKey: ['auth', 'verify', token],
    queryFn: () => verify(token!),
    enabled: !!token,
    retry: false,
  });