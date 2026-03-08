'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CourseCard from '@/components/CourseCard';
import EbookCard from '@/components/EbookCard';
import ReviewCard from '@/components/ReviewCard';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [ebooks, setEbooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, ebooksRes, reviewsRes, userRes] = await Promise.all([
        fetch('/api/content/courses'),
        fetch('/api/content/ebooks'),
        fetch('/api/content/reviews'),
        fetch('/api/auth/me'),
      ]);

      const [coursesData, ebooksData, reviewsData, userData] = await Promise.all([
        coursesRes.json(),
        ebooksRes.json(),
        reviewsRes.json(),
        userRes.json(),
      ]);

      if (coursesData.success) setCourses(coursesData.courses.slice(0, 3));
      if (ebooksData.success) setEbooks(ebooksData.ebooks.slice(0, 3));
      if (reviewsData.success) setReviews(reviewsData.reviews.slice(0, 3));
      if (userData.success) setUser(userData.user);
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
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Studio Insight
          </h1>
          <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-3xl mx-auto">
            Het platform voor ondernemers, podcasters en contentmakers. 
            Kwalitatieve cursussen, e-books en reviews om je business naar het volgende niveau te tillen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cursus" className="btn-primary text-lg px-8 py-4">
              Ontdek Cursussen
            </Link>
            <Link href="/e-books" className="btn-secondary text-lg px-8 py-4">
              Bekijk E-books
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Tiles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/cursus" className="group">
              <div className="bg-gradient-primary rounded-lg p-8 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Cursussen</h3>
                <p className="text-white/80">Leer van experts en ontwikkel je vaardigheden</p>
              </div>
            </Link>

            <Link href="/e-books" className="group">
              <div className="bg-gradient-accent rounded-lg p-8 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">E-books</h3>
                <p className="text-white/80">Diepgaande kennis in handige digitale boeken</p>
              </div>
            </Link>

            <Link href="/reviews" className="group">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Reviews</h3>
                <p className="text-white/80">Eerlijke reviews van audio- en tech-producten</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Courses */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Populaire Cursussen
            </h2>
            <p className="text-dark-300 text-lg">
              Ontwikkel je vaardigheden met onze best beoordeelde cursussen
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} user={user} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/cursus" className="btn-primary">
              Alle Cursussen Bekijken
            </Link>
          </div>
        </div>
      </section>

      {/* Top E-books */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Aanbevolen E-books
            </h2>
            <p className="text-dark-300 text-lg">
              Diepgaande kennis in handige digitale boeken
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ebooks.map((ebook) => (
              <EbookCard key={ebook.id} ebook={ebook} user={user} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/e-books" className="btn-primary">
              Alle E-books Bekijken
            </Link>
          </div>
        </div>
      </section>

      {/* Top Reviews */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Laatste Reviews
            </h2>
            <p className="text-dark-300 text-lg">
              Eerlijke reviews van audio- en tech-producten
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/reviews" className="btn-primary">
              Alle Reviews Bekijken
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Waarom Studio Insight?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Kwaliteit</h3>
              <p className="text-dark-300">Alleen de beste content van ervaren professionals</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Veilig</h3>
              <p className="text-dark-300">Veilige betalingen en bescherming van je gegevens</p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
              <p className="text-dark-300">Exclusieve Discord community voor leden</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
