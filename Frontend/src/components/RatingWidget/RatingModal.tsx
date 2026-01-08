'use client';

import { FC, useState, useEffect } from 'react';
import styles from './RatingWidget.module.scss';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  initialRating?: number;
  isLoading?: boolean;
  isEditing?: boolean;
}

/**
 * Mensajes de preview según la calificación seleccionada
 */
const getPreviewMessage = (rating: number): string => {
  switch (rating) {
    case 1:
      return 'No fue para mí';
    case 2:
      return 'Podría mejorar';
    case 3:
      return 'Está bien';
    case 4:
      return '¡Muy bueno!';
    case 5:
      return '¡Excelente!';
    default:
      return '';
  }
};

export const RatingModal: FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRating = 0,
  isLoading = false,
  isEditing = false,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Actualizar selectedRating cuando initialRating cambia
  useEffect(() => {
    setSelectedRating(initialRating);
  }, [initialRating, isOpen]);

  if (!isOpen) return null;

  const displayRating = hoverRating || selectedRating;
  const previewMessage = getPreviewMessage(displayRating);

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmit(selectedRating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ESC para cerrar
    if (e.key === 'Escape') {
      onClose();
    }
    // ENTER para confirmar
    if (e.key === 'Enter' && selectedRating > 0 && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.modalBackdrop}
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />

      {/* Modal */}
      <div
        className={styles.modal}
        role="dialog"
        aria-labelledby="rating-modal-title"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.modalContent}>
          <h3 id="rating-modal-title" className={styles.modalTitle}>
            {isEditing ? 'Edita tu calificación' : '¿Qué te pareció?'}
          </h3>

          {/* Interactive Stars */}
          <div className={styles.interactiveStars}>
            <div
              className={styles.starsContainer}
              role="group"
              aria-label="Selecciona una calificación del 1 al 5"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starButton} ${
                    star <= displayRating ? styles.active : ''
                  }`}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Califica con ${star} estrellas`}
                  title={`${star} estrellas`}
                  disabled={isLoading}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Preview Message */}
          {displayRating > 0 && (
            <div className={styles.modalPreview}>
              <p className={styles.previewText}>{previewMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.secondary}`}
              onClick={onClose}
              disabled={isLoading}
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.primary}`}
              onClick={handleSubmit}
              disabled={selectedRating === 0 || isLoading}
              aria-busy={isLoading}
              aria-label={`Confirmar calificación de ${selectedRating} estrellas`}
            >
              {isLoading ? 'Enviando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
