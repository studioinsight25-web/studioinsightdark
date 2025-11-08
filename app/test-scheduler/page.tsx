import React from 'react'

export default function SchedulerTestPage() {
  return (
    <section
      style={{
        maxWidth: '900px',
        margin: '4rem auto',
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: '#0d1b2a', marginBottom: '0.5rem' }}>
          Plan je Strategiegesprek
        </h2>
        <p
          style={{
            fontSize: '1.1rem',
            color: '#415a77',
            maxWidth: '700px',
            margin: '0 auto'
          }}
        >
          Reserveer direct je plek voor een persoonlijk gesprek over jouw bedrijfsgroei. Kies eenvoudig
          een tijdstip dat voor jou werkt — geen e-mailverkeer meer nodig.
        </p>
      </div>

      <iframe
        src="https://scheduler.studio-insight.nl/embed?tenant=studioinsight"
        width="100%"
        height="750"
        loading="lazy"
        style={{
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 0 12px rgba(0,0,0,0.1)'
        }}
      />

      <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#778da9', fontSize: '0.9rem' }}>
        <p>Beveiligde verbinding – jouw gegevens blijven privé via scheduler.studio-insight.nl</p>
      </div>
    </section>
  )
}


