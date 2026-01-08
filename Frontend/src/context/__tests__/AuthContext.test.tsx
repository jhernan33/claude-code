import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with null user', async () => {
      let contextValue;

      const TestComponent = () => {
        contextValue = useContext(AuthContext);
        return <div>Initialized</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.user).toBeNull();
        expect(contextValue?.isAuthenticated).toBe(false);
        expect(contextValue?.isLoading).toBe(false);
      });
    });
  });

  describe('Login', () => {
    it('should login user and persist to localStorage', async () => {
      const TestComponent = () => {
        const { user, loginAsMock } = useUser();

        return (
          <div>
            <button onClick={() => loginAsMock(123)}>Login as User 123</button>
            {user && <p>Logged in: {user.email}</p>}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const button = screen.getByText('Login as User 123');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Logged in:/)).toBeInTheDocument();
      });

      // Verificar localStorage
      const stored = localStorage.getItem('platziflix_auth_user');
      expect(stored).toBeTruthy();

      const session = JSON.parse(stored!);
      expect(session.user.id).toBe(123);
      expect(session.user.email).toBe('user123@platziflix.local');
    });

    it('should set isLoading to false after login', async () => {
      const TestComponent = () => {
        const { isLoading } = useUser();
        return <div>Loading: {isLoading.toString()}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Loading: false')).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    it('should logout user and clear localStorage', async () => {
      const TestComponent = () => {
        const { user, logout, loginAsMock } = useUser();

        return (
          <div>
            <button onClick={() => loginAsMock(456)}>Login</button>
            <button onClick={logout}>Logout</button>
            {user ? <p>Logged in: {user.email}</p> : <p>Not logged in</p>}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login
      await userEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByText(/Logged in:/)).toBeInTheDocument();
      });

      // Logout
      await userEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });

      // Verificar localStorage está limpio
      const stored = localStorage.getItem('platziflix_auth_user');
      expect(stored).toBeNull();
    });
  });

  describe('Session Persistence', () => {
    it('should restore user from localStorage on mount', async () => {
      // Simular sesión guardada
      const session = {
        version: 1,
        user: { id: 789, email: 'user789@platziflix.local', name: 'User 789' },
        timestamp: Date.now(),
      };

      localStorage.setItem('platziflix_auth_user', JSON.stringify(session));

      const TestComponent = () => {
        const { user } = useUser();
        return user ? <p>{user.email}</p> : <p>Loading...</p>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('user789@platziflix.local')).toBeInTheDocument();
      });
    });

    it('should clear storage if version mismatch', async () => {
      // Simular sesión con versión antigua
      const session = {
        version: 0, // Versión antigua
        user: { id: 999, email: 'old@test.com', name: 'Old User' },
        timestamp: Date.now(),
      };

      localStorage.setItem('platziflix_auth_user', JSON.stringify(session));

      const TestComponent = () => {
        const { user } = useUser();
        return <p>{user ? 'Logged in' : 'Not logged in'}</p>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
        expect(localStorage.getItem('platziflix_auth_user')).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is logged in', async () => {
      const TestComponent = () => {
        const { isAuthenticated, loginAsMock } = useUser();

        return (
          <div>
            <button onClick={() => loginAsMock(111)}>Login</button>
            <p>Authenticated: {isAuthenticated.toString()}</p>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await userEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByText('Authenticated: true')).toBeInTheDocument();
      });
    });

    it('should return false when user is not logged in', async () => {
      const TestComponent = () => {
        const { isAuthenticated } = useUser();
        return <p>Authenticated: {isAuthenticated.toString()}</p>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Authenticated: false')).toBeInTheDocument();
      });
    });
  });
});
