'use client';

import { FC } from 'react';
import styles from './RatingWidget.module.scss';

interface RatingPromptProps {
  onRate: () => void;
  isLoading?: boolean;
}

/**
 * RatingPrompt
 * Botón interactivo que invita al usuario a calificar
 * - Muestra cuando el usuario aún no ha calificado
 * - Se deshabilita durante operaciones
 */
export const RatingPrompt: FC<RatingPromptProps> = ({
  onRate,
  isLoading = false,
}) => {
  return (
    <div className={styles.prompt}>
      <p className={styles.promptText}>¿Te gustó este curso?</p>
      <button
        className={styles.promptButton}
        onClick={onRate}
        disabled={isLoading}
        aria-label="Califica este curso"
        type="button"
      >
        {isLoading ? 'Cargando...' : 'Califica ahora'}
      </button>
    </div>
  );
};
