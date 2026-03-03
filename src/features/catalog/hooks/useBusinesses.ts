import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Business, Service, Review } from '../../../types';

interface BusinessWithMeta extends Business {
  avgRating: number;
  reviewCount: number;
  serviceCount: number;
}

interface BusinessDetail {
  business: Business;
  services: Service[];
  reviews: Review[];
  avgRating: number;
}

export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<BusinessWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const bizQuery = query(
        collection(db, 'businesses'),
        where('isActive', '==', true)
      );
      const bizSnap = await getDocs(bizQuery);
      const results: BusinessWithMeta[] = [];

      for (const bizDoc of bizSnap.docs) {
        const biz = bizDoc.data() as Business;

        const servicesSnap = await getDocs(
          query(collection(db, 'services'), where('businessId', '==', biz.businessId))
        );

        const reviewsSnap = await getDocs(
          query(collection(db, 'reviews'), where('businessId', '==', biz.businessId))
        );

        const ratings = reviewsSnap.docs.map((d) => (d.data() as Review).rating);
        const avgRating =
          ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
            : 0;

        results.push({
          ...biz,
          avgRating,
          reviewCount: ratings.length,
          serviceCount: servicesSnap.size,
        });
      }

      setBusinesses(results);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Error al cargar los negocios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return { businesses, isLoading, refetch: fetchBusinesses, error };
};

export const useBusinessDetail = (businessId: string) => {
  const [detail, setDetail] = useState<BusinessDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', businessId));
        if (!bizDoc.exists()) return;
        const business = bizDoc.data() as Business;

        const servicesSnap = await getDocs(
          query(
            collection(db, 'services'),
            where('businessId', '==', businessId),
            where('isActive', '==', true)
          )
        );
        const services = servicesSnap.docs.map((d) => d.data() as Service);

        const reviewsSnap = await getDocs(
          query(collection(db, 'reviews'), where('businessId', '==', businessId))
        );
        const reviews = reviewsSnap.docs
          .map((d) => d.data() as Review)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const ratings = reviews.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
            : 0;

        setDetail({ business, services, reviews, avgRating });
      } catch (err) {
        console.error('Error fetching business detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [businessId]);

  return { detail, isLoading };
};
