'use client';

import { FC, useState, useCallback } from "react";
import Link from "next/link";
import { CourseDetail } from "@/types";
import { StarRating } from "@/components/StarRating/StarRating";
import { RatingWidget } from "@/components/RatingWidget/RatingWidget";
import { ratingsApi } from "@/services/ratingsApi";
import styles from "./CourseDetail.module.scss";

import type { RatingStats } from "@/types/rating";

interface CourseDetailComponentProps {
  course: CourseDetail;
  initialStats?: RatingStats;
}

export const CourseDetailComponent: FC<CourseDetailComponentProps> = ({
  course,
  initialStats,
}) => {
  const [stats, setStats] = useState<RatingStats>({
    average_rating: initialStats?.average_rating ?? course.average_rating ?? 0,
    total_ratings: initialStats?.total_ratings ?? course.total_ratings ?? 0,
  });

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalDuration = course.classes.reduce((acc, cls) => acc + cls.duration, 0);

  /**
   * Callback cuando cambia el rating
   * Refetch stats después de cambio
   */
  const handleRatingChange = useCallback(
    async () => {
      try {
        // Refetch stats después de cambio de rating
        const updatedStats = await ratingsApi.getRatingStats(course.id);
        setStats(updatedStats);
      } catch (error) {
        console.error('Error updating stats:', error);
        // Si falla, mantener stats actuales (sin mostrar error al usuario)
      }
    },
    [course.id]
  );

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <Link href="/" className={styles.backButton}>
          ← Volver a cursos
        </Link>
      </div>
      <div className={styles.header}>
        <div className={styles.thumbnailContainer}>
          <img src={course.thumbnail} alt={course.title} className={styles.thumbnail} />
        </div>
        <div className={styles.courseInfo}>
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.teacher}>Por {course.teacher}</p>
          <p className={styles.description}>{course.description}</p>

          {/* Rating Section - ReadOnly */}
          <div className={styles.stats}>
            <div className={styles.ratingContainer}>
              <StarRating
                rating={stats.average_rating}
                totalRatings={stats.total_ratings}
                showCount={true}
                size="medium"
                readonly={true}
              />
            </div>
            <span className={styles.duration}>Duración total: {formatDuration(totalDuration)}</span>
            <span className={styles.classCount}>{course.classes.length} clases</span>
          </div>
        </div>
      </div>

      {/* NEW: RatingWidget Interactive Section */}
      <section className={styles.ratingSection} aria-labelledby="rating-title">
        <h2 id="rating-title" className={styles.sectionTitle}>
          Tu opinión
        </h2>
        <RatingWidget
          courseId={course.id}
          onRatingChange={handleRatingChange}
        />
      </section>

      <div className={styles.classesSection}>
        <h2 className={styles.sectionTitle}>Contenido del curso</h2>
        <div className={styles.classesList}>
          {course.classes.map((cls, index) => (
            <Link href={`/classes/${cls.id}`} key={cls.id} className={styles.classItem}>
              <div className={styles.classNumber}>{(index + 1).toString().padStart(2, "0")}</div>
              <div className={styles.classInfo}>
                <h3 className={styles.classTitle}>{cls.title}</h3>
                <p className={styles.classDescription}>{cls.description}</p>
                <span className={styles.classDuration}>{formatDuration(cls.duration)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
