import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { RatingWidget } from '../RatingWidget';
import * as ratingsApi from '@/services/ratingsApi';
import { useUser } from '@/hooks/useUser';

// Mocks
vi.mock('@/hooks/useUser');
vi.mock('@/services/ratingsApi');

const mockUseUser = useUser as unknown as {
  mockReturnValue: (value: unknown) => void;
  mockReturnValueOnce: (value: unknown) => void;
};
const mockRatingsApi = ratingsApi as unknown as Record<string, { mockResolvedValue: (value: unknown) => void; mockRejectedValue: (value: unknown) => void; mockRejectedValueOnce: (value: unknown) => void; fn: () => unknown }>;


describe('RatingWidget', () => {
  const mockCourseId = 1;
  const mockUser = { id: 42, email: 'test@test.com', name: 'Test User' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      loginAsMock: vi.fn(),
    });
  });

  describe('Initial Load', () => {
    it('should show loading state initially', () => {
      mockRatingsApi.getUserRating = vi.fn(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );

      render(<RatingWidget courseId={mockCourseId} />);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should show prompt when user has no rating', async () => {
      mockRatingsApi.getUserRating = vi.fn().mockResolvedValue(null);

      render(<RatingWidget courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Te gustó este curso/i)).toBeInTheDocument();
      });
    });

    it('should show guest message when not authenticated', async () => {
      mockUseUser.mockReturnValueOnce({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
        loginAsMock: vi.fn(),
      });

      render(<RatingWidget courseId={mockCourseId} />);

      expect(
        screen.getByText(/Inicia sesión para calificar/i)
      ).toBeInTheDocument();
    });
  });

  describe('Rating Display', () => {
    it('should display rating interface when user has already rated', async () => {
      const mockRating = {
        id: 1,
        course_id: mockCourseId,
        user_id: mockUser.id,
        rating: 4,
        created_at: '2025-11-28T00:00:00',
        updated_at: '2025-11-28T00:00:00',
      };

      mockRatingsApi.getUserRating = vi.fn().mockResolvedValue(mockRating);

      render(<RatingWidget courseId={mockCourseId} />);

      // Should eventually show something other than loading
      await waitFor(
        () => {
          // After loading completes, we should not see the loading message
          expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('User Interactions', () => {
    it('should prompt user to rate when they haven\'t rated', async () => {
      mockRatingsApi.getUserRating = vi.fn().mockResolvedValue(null);

      render(<RatingWidget courseId={mockCourseId} />);

      await waitFor(
        () => {
          expect(screen.getByText(/¿Te gustó este curso/i)).toBeInTheDocument();
          expect(screen.getByText(/Califica ahora/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should handle loading state correctly', () => {
      mockRatingsApi.getUserRating = vi.fn(
        () => new Promise(() => {}) // Never resolves
      );

      render(<RatingWidget courseId={mockCourseId} />);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  describe('Component States', () => {
    it('should transition from loading to idle state', async () => {
      mockRatingsApi.getUserRating = vi.fn().mockResolvedValue(null);

      render(<RatingWidget courseId={mockCourseId} />);

      // Initially loading
      expect(screen.getByText('Cargando...')).toBeInTheDocument();

      // Eventually should show prompt
      await waitFor(
        () => {
          expect(screen.queryByText(/¿Te gustó este curso/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should handle 204 No Content response as no rating', async () => {
      // Create a custom error that simulates 204 No Content
      const noContentError = Object.create(Error.prototype);
      noContentError.status = 204;
      noContentError.message = 'No Content';

      mockRatingsApi.getUserRating = vi
        .fn()
        .mockRejectedValue(noContentError);

      render(<RatingWidget courseId={mockCourseId} />);

      // Should eventually show prompt since 204 means "no rating yet"
      await waitFor(
        () => {
          expect(screen.queryByText(/¿Te gustó este curso/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
