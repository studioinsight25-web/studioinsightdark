'use client';

import { useState, useEffect } from 'react';
import CourseCard from '@/components/CourseCard';

export default function CursusPage() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, userRes] = await Promise.all([
        fetch('/api/content/courses'),
        fetch('/api/auth/me'),
      ]);

      const [coursesData, userData] = await Promise.all([
        coursesRes.json(),
        userRes.json(),
      ]);

      if (coursesData.success) setCourses(coursesData.courses);
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
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cursussen
          </h1>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Ontwikkel je vaardigheden met onze professionele cursussen. 
            Van podcasting tot audio-editing, we hebben alles wat je nodig hebt.
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Geen cursussen beschikbaar</h3>
            <p className="text-dark-300">Er zijn momenteel geen cursussen beschikbaar. Kom later terug!</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-dark-800 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Klaar om te beginnen?
            </h2>
            <p className="text-dark-300 mb-6">
              Meld je aan voor een account om toegang te krijgen tot alle cursussen en de exclusieve Discord community.
            </p>
            {user ? (
              <div className="text-primary-400">
                Welkom terug, {user.email}! Je hebt toegang tot alle cursussen.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/register" className="btn-primary">
                  Account Aanmaken
                </a>
                <a href="/login" className="btn-secondary">
                  Inloggen
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
