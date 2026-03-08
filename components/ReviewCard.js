'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? 'text-yellow-400' : 'text-dark-600'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden border border-dark-700 hover:border-accent-500/50 transition-all duration-300 group">
      {review.imageUrl && (
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={review.imageUrl}
            alt={review.productName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-accent-400 transition-colors duration-200">
            {review.productName}
          </h3>
          <div className="flex items-center">
            {renderStars(review.rating)}
          </div>
        </div>
        
        <p className="text-dark-400 text-sm mb-2">{review.brand}</p>
        
        <p className="text-dark-300 text-sm mb-4 line-clamp-3">
          {review.content}
        </p>
        
        <div className="space-y-2 mb-4">
          <div>
            <span className="text-green-400 text-xs font-medium">✓ Voordelen:</span>
            <p className="text-dark-300 text-xs">{review.pros}</p>
          </div>
          <div>
            <span className="text-red-400 text-xs font-medium">✗ Nadelen:</span>
            <p className="text-dark-300 text-xs">{review.cons}</p>
          </div>
        </div>
        
        <Link
          href={`/reviews/${review.slug}`}
          className="block w-full bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-center"
        >
          Lees review
        </Link>
      </div>
    </div>
  );
}
