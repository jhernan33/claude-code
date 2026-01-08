'use client';

import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { ratingsApi, ApiError } from '@/services/ratingsApi';
import { StarRating } from '@/components/StarRating/StarRating';
import { RatingPrompt } from './RatingPrompt';
import { RatingModal } from './RatingModal';
import styles from './RatingWidget.module.scss';

import type { CourseRating } from '@/types/rating';

interface RatingWidgetProps {
  courseId: number;
  onRatingChange?: (rating: CourseRating | null) => void;
}

type WidgetState =
  | 'idle' // Sin rating, mostrar prompt
  | 'loading' // Cargando datos iniciales
  | 'modal-open' // Modal abierto
  | 'modal-loading' // Enviando a API
  | 'showing-rating' // Mostrar rating del usuario
  | 'delete-confirm' // Confirmación de eliminación
  | 'error'; // Error en operación

interface WidgetData {
  userRating: CourseRating | null;
  error: string | null;
  selectedRating: number;
}

/**
 * RatingWidget
 * Componente completo para el sistema de ratings
 */
export const RatingWidget: FC<RatingWidgetProps> = ({
  courseId,
  onRatingChange,
}) => {
  const { user, isLoading: isAuthLoading } = useUser();

  const [state, setState] = useState<WidgetState>('loading');
  const [data, setData] = useState<WidgetData>({
    userRating: null,
    error: null,
    selectedRating: 0,
  });

  // Ref para evitar race conditions
  const isMountedRef = useRef(true);

  /**
   * Efecto: Cargar rating del usuario al montar o cambiar usuario
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (!user || isAuthLoading) return;

    const loadUserRating = async () => {
      try {
        const rating = await ratingsApi.getUserRating(courseId, user.id);

        if (!isMountedRef.current) return;

        setData((prev) => ({
          ...prev,
          userRating: rating,
          error: null,
        }));

        setState(rating ? 'showing-rating' : 'idle');
      } catch (error) {
        if (!isMountedRef.current) return;

        // 204 No Content = usuario no ha calificado (no es error)
        if (error instanceof ApiError && error.status === 204) {
          setState('idle');
          return;
        }

        console.error('Error loading rating:', error);

        const errorMsg =
          error instanceof ApiError
            ? error.message
            : 'Error al cargar tu calificación';

        setData((prev) => ({
          ...prev,
          error: errorMsg,
        }));

        setState('error');
      }
    };

    loadUserRating();

    return () => {
      isMountedRef.current = false;
    };
  }, [courseId, user, isAuthLoading]);

  /**
   * Manejar apertura de modal
   */
  const handleOpenModal = useCallback(() => {
    setState('modal-open');
    setData((prev) => ({
      ...prev,
      selectedRating: prev.userRating?.rating ?? 0,
      error: null,
    }));
  }, []);

  /**
   * Manejar cierre de modal
   */
  const handleCloseModal = useCallback(() => {
    setState(data.userRating ? 'showing-rating' : 'idle');
    setData((prev) => ({
      ...prev,
      selectedRating: 0,
    }));
  }, [data.userRating]);

  /**
   * Manejar envío de rating (create o update)
   */
  const handleSubmitRating = useCallback(
    async (rating: number) => {
      if (!user || !isMountedRef.current) return;

      setState('modal-loading');
      setData((prev) => ({ ...prev, error: null }));

      try {
        let result: CourseRating;

        if (data.userRating) {
          // Actualizar rating existente
          result = await ratingsApi.updateRating(courseId, user.id, {
            user_id: user.id,
            rating,
          });
        } else {
          // Crear nuevo rating
          result = await ratingsApi.createRating(courseId, {
            user_id: user.id,
            rating,
          });
        }

        if (!isMountedRef.current) return;

        // Optimistic update - actualizar inmediatamente
        setData((prev) => ({
          ...prev,
          userRating: result,
          selectedRating: 0,
          error: null,
        }));

        setState('showing-rating');

        // Notificar al componente padre
        onRatingChange?.(result);

        // Feedback visual: mostrar mensaje de éxito por 2 segundos
        const successMessage = document.createElement('div');
        successMessage.className = styles.successBanner;
        successMessage.textContent = data.userRating
          ? 'Calificación actualizada'
          : 'Gracias por tu calificación';
        successMessage.setAttribute('role', 'status');
        successMessage.setAttribute('aria-live', 'polite');
        document.body.appendChild(successMessage);

        setTimeout(() => {
          successMessage.remove();
        }, 2000);
      } catch (error) {
        if (!isMountedRef.current) return;

        const errorMsg =
          error instanceof ApiError
            ? error.message
            : 'Error al enviar tu calificación';

        setData((prev) => ({
          ...prev,
          error: errorMsg,
        }));

        setState('error');
      }
    },
    [courseId, user, data.userRating, onRatingChange]
  );

  /**
   * Manejar eliminación de rating
   */
  const handleDeleteRating = useCallback(async () => {
    if (!user || !data.userRating || !isMountedRef.current) return;

    setState('modal-loading');
    setData((prev) => ({ ...prev, error: null }));

    try {
      await ratingsApi.deleteRating(courseId, user.id);

      if (!isMountedRef.current) return;

      setData((prev) => ({
        ...prev,
        userRating: null,
        error: null,
      }));

      setState('idle');
      onRatingChange?.(null);
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMsg =
        error instanceof ApiError
          ? error.message
          : 'Error al eliminar tu calificación';

      setData((prev) => ({
        ...prev,
        error: errorMsg,
      }));

      setState('error');
    }
  }, [courseId, user, data.userRating, onRatingChange]);

  /**
   * Si no hay usuario autenticado
   */
  if (!isAuthLoading && !user) {
    return (
      <div className={styles.guestMessage} role="status">
        <p>Inicia sesión para calificar este curso</p>
      </div>
    );
  }

  /**
   * Renderizar según estado actual
   */
  return (
    <div className={styles.ratingWidget}>
      {/* Error State */}
      {state === 'error' && (
        <div className={styles.errorBanner} role="alert" aria-live="polite">
          <p className={styles.errorText}>{data.error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              setState(data.userRating ? 'showing-rating' : 'idle');
              setData((prev) => ({ ...prev, error: null }));
            }}
            type="button"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State (fetch inicial) */}
      {(isAuthLoading || state === 'loading') && (
        <div className={styles.loadingState} aria-busy="true">
          <p>Cargando...</p>
        </div>
      )}

      {/* Idle State - Sin rating del usuario */}
      {state === 'idle' && !isAuthLoading && (
        <RatingPrompt
          onRate={handleOpenModal}
          isLoading={false}
        />
      )}

      {/* Showing Rating State - Con rating del usuario */}
      {state === 'showing-rating' && data.userRating && (
        <div className={styles.userRatingSection}>
          <div className={styles.currentRating}>
            <p className={styles.label}>Tu calificación:</p>
            <StarRating
              rating={data.userRating.rating}
              size="medium"
              readonly={true}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={handleOpenModal}
              aria-label="Edita tu calificación"
              type="button"
            >
              Editar
            </button>
            <button
              className={`${styles.button} ${styles.danger}`}
              onClick={() => setState('delete-confirm')}
              aria-label="Elimina tu calificación"
              type="button"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {state === 'delete-confirm' && (
        <div
          className={styles.confirmDelete}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <p id="delete-title">
            ¿Estás seguro de que deseas eliminar tu calificación?
          </p>
          <div className={styles.confirmActions}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => setState('showing-rating')}
              type="button"
            >
              Cancelar
            </button>
            <button
              className={`${styles.button} ${styles.danger}`}
              onClick={handleDeleteRating}
              type="button"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={state === 'modal-open' || state === 'modal-loading'}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRating}
        initialRating={data.userRating?.rating}
        isLoading={state === 'modal-loading'}
        isEditing={!!data.userRating}
      />
    </div>
  );
};
