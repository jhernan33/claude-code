import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';

describe('useUser Hook', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useUser());
    }).toThrow('useUser debe ser usado dentro de AuthProvider');
  });

  it('should return context when used inside AuthProvider', () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should return authenticated user after login', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.loginAsMock(42);
    });

    await waitFor(() => {
      expect(result.current.user?.id).toBe(42);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle logout correctly', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    // Login primero
    act(() => {
      result.current.loginAsMock(42);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Luego logout
    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('should provide correct user data', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.loginAsMock(123);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: 123,
        email: 'user123@platziflix.local',
        name: 'User 123',
      });
    });
  });
});
