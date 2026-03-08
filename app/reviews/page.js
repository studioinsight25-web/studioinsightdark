'use client';

import { useState, useEffect } from 'react';
import ReviewCard from '@/components/ReviewCard';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/content/reviews');
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Reviews
          </h1>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Eerlijke en uitgebreide reviews van audio- en tech-producten. 
            Ontdek wat echt werkt voor jouw setup.
          </p>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Geen reviews beschikbaar</h3>
            <p className="text-dark-300">Er zijn momenteel geen reviews beschikbaar. Kom later terug!</p>
          </div>
        )}

        {/* Affiliate Disclaimer */}
        <div className="mt-16">
          <div className="bg-dark-800 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">
              Affiliate Disclaimer
            </h2>
            <p className="text-dark-300 text-sm leading-relaxed">
              Sommige links in onze reviews zijn affiliate links. Dit betekent dat we een kleine commissie kunnen ontvangen 
              als je een product koopt via onze link, zonder dat dit extra kosten voor jou met zich meebrengt. 
              We beoordelen producten altijd eerlijk en objectief, ongeacht of we een affiliate commissie ontvangen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
