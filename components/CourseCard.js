'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CourseCard({ course, user }) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: course.id,
          productType: 'course',
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Er is een fout opgetreden');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Er is een fout opgetreden bij het starten van de betaling');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (priceInCents) => {
    return `€${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden border border-dark-700 hover:border-primary-500/50 transition-all duration-300 group">
      {course.imageUrl && (
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={course.imageUrl}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors duration-200">
          {course.title}
        </h3>
        
        <p className="text-dark-300 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary-500">
            {formatPrice(course.price)}
          </span>
        </div>
        
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
        >
          {isLoading ? 'Bezig...' : 'Nu starten'}
        </button>
      </div>
    </div>
  );
}
