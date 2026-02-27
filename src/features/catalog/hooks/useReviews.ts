import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Review } from '../../../types';

interface ReviewWithUserName extends Review {
  clientName?: string;
}

export const useReviews = (businessId: string) => {
  const [reviews, setReviews] = useState<ReviewWithUserName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reviews'),
      where('businessId', '==', businessId)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const reviewList: ReviewWithUserName[] = [];
          let totalRating = 0;

          for (const doc of snapshot.docs) {
            const data = doc.data();
            
            // Obtener el nombre del cliente
            try {
              const userQuery = query(
                collection(db, 'users'),
                where('uid', '==', data.clientUid)
              );
              const userSnapshot = await getDocs(userQuery);
              const clientName = userSnapshot.empty
                ? 'Usuario'
                : userSnapshot.docs[0].data().fullName;

              reviewList.push({
                reviewId: data.reviewId,
                appointmentId: data.appointmentId,
                clientUid: data.clientUid,
                businessId: data.businessId,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                clientName,
              });
            } catch {
              reviewList.push({
                reviewId: data.reviewId,
                appointmentId: data.appointmentId,
                clientUid: data.clientUid,
                businessId: data.businessId,
                rating: data.rating,
                comment: data.comment,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                clientName: 'Usuario',
              });
            }

            totalRating += data.rating || 0;
          }

          // Ordenar por fecha descendente
          reviewList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          setReviews(reviewList);
          setTotalReviews(reviewList.length);
          setAverageRating(
            reviewList.length > 0 ? Number((totalRating / reviewList.length).toFixed(1)) : 0
          );
          setIsLoading(false);
        } catch (err) {
          setError('Error al cargar las reseñas');
          setIsLoading(false);
        }
      },
      (err) => {
        setError('Error al cargar las reseñas');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [businessId]);

  return { reviews, isLoading, error, averageRating, totalReviews };
};
