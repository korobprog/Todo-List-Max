import { getAuthToken, setAuthToken } from './api';

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getToken = (): string | null => {
  return getAuthToken();
};

export const saveToken = (token: string): void => {
  setAuthToken(token);
};

export const removeToken = (): void => {
  setAuthToken(null);
};

