// Mock user data for testing
import type { LoginResponse } from '@policy-flow/contracts';

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  nickname: '테스트유저',
  profileImage: null,
  createdAt: Math.floor(Date.now() / 1000),
};

export const mockLoginResponse: LoginResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600,
  user: mockUser,
};

export const mockUser2 = {
  id: 'user-2',
  email: 'test2@example.com',
  nickname: '익명사용자',
  profileImage: 'https://example.com/avatar2.jpg',
  createdAt: Math.floor(Date.now() / 1000) - 86400,
};
