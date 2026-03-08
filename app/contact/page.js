'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setMessage('Vul alle verplichte velden in');
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setMessage('Voer een geldig e-mailadres in');
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      setMessage('Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact
          </h1>
          <p className="text-xl text-dark-300 max-w-3xl mx-auto">
            Heb je vragen of opmerkingen? We horen graag van je!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-dark-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Stuur ons een bericht
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-2">
                  Naam *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Je volledige naam"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                  E-mailadres *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="je@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-dark-200 mb-2">
                  Onderwerp
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Waar gaat je bericht over?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-dark-200 mb-2">
                  Bericht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="input-field resize-none"
                  placeholder="Vertel ons hoe we je kunnen helpen..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {isSubmitting ? 'Verzenden...' : 'Verstuur bericht'}
              </button>

              {message && (
                <div className={`p-4 rounded-lg text-sm ${
                  message.includes('Bedankt') 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-dark-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Contact informatie
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">E-mail</h3>
                    <p className="text-dark-300">info@studioinsight.nl</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Reactietijd</h3>
                    <p className="text-dark-300">Binnen 24 uur op werkdagen</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Discord Community</h3>
                    <p className="text-dark-300">Voor leden met toegang</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Veelgestelde vragen
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Hoe krijg ik toegang tot de Discord community?
                  </h3>
                  <p className="text-dark-300 text-sm">
                    Na het kopen van een cursus of e-book krijg je automatisch toegang tot de exclusieve Discord community.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Kan ik mijn aankoop annuleren?
                  </h3>
                  <p className="text-dark-300 text-sm">
                    Ja, je hebt 14 dagen om je aankoop te annuleren. Neem contact met ons op voor meer informatie.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Zijn de betalingen veilig?
                  </h3>
                  <p className="text-dark-300 text-sm">
                    Ja, alle betalingen worden verwerkt via Stripe, een van de meest veilige betalingsproviders ter wereld.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
