'use client';

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 40%, #0D0D0D 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Playfair Display', Georgia, serif",
      color: '#fff',
      textAlign: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle gold particle effect */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:wght@300;400;500;600&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(196, 155, 60, 0.2); }
          50% { box-shadow: 0 0 40px rgba(196, 155, 60, 0.4); }
        }
        .gold-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #C49B3C;
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        .maintenance-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          letter-spacing: 8px;
          background: linear-gradient(90deg, #C49B3C, #D4AF37, #F5D76E, #D4AF37, #C49B3C);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease-in-out infinite, fadeInUp 1s ease-out;
          margin-bottom: 8px;
        }
        .maintenance-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1rem, 3vw, 1.4rem);
          font-weight: 300;
          color: rgba(255,255,255,0.5);
          letter-spacing: 6px;
          text-transform: uppercase;
          animation: fadeInUp 1s ease-out 0.2s both;
        }
        .maintenance-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.1rem, 2.5vw, 1.35rem);
          font-weight: 400;
          color: rgba(255,255,255,0.7);
          max-width: 500px;
          line-height: 1.8;
          margin: 40px auto;
          animation: fadeInUp 1s ease-out 0.4s both;
        }
        .maintenance-divider {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #C49B3C, transparent);
          margin: 24px auto;
          animation: fadeInUp 1s ease-out 0.3s both;
        }
        .maintenance-email {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border: 1px solid rgba(196, 155, 60, 0.4);
          border-radius: 50px;
          color: #D4AF37;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          letter-spacing: 2px;
          text-decoration: none;
          transition: all 0.4s ease;
          animation: fadeInUp 1s ease-out 0.6s both, pulse-glow 3s ease-in-out infinite;
        }
        .maintenance-email:hover {
          background: rgba(196, 155, 60, 0.1);
          border-color: #D4AF37;
          transform: translateY(-2px);
        }
        .maintenance-footer {
          position: absolute;
          bottom: 30px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.25);
          letter-spacing: 3px;
          animation: fadeInUp 1s ease-out 0.8s both;
        }
        .maintenance-diamond {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #C49B3C;
          transform: rotate(45deg);
          margin: 0 12px;
          opacity: 0.6;
        }
      `}</style>

      {/* Floating gold particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="gold-dot"
          style={{
            left: `${8 + (i * 8)}%`,
            top: `${10 + ((i * 17) % 80)}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + (i % 3) * 2}s`,
            opacity: 0.15 + (i % 4) * 0.1,
          }}
        />
      ))}

      {/* Logo area */}
      <div style={{ marginBottom: '16px', animation: 'fadeInUp 1s ease-out' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C49B3C, #D4AF37)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px',
          fontWeight: 900,
          fontFamily: "'Playfair Display', serif",
          color: '#0D0D0D',
        }}>
          M
        </div>
      </div>

      <h1 className="maintenance-title">MALOUNE</h1>
      <p className="maintenance-subtitle">Boutique en ligne</p>

      <div className="maintenance-divider" />

      <p className="maintenance-desc">
        Notre boutique prépare quelque chose d&apos;exceptionnel pour vous.
        <br />
        Revenez bientôt découvrir notre collection exclusive.
      </p>

      <a href="mailto:contact@maloune.fr" className="maintenance-email">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M22 4L12 13L2 4"/>
        </svg>
        contact@maloune.fr
      </a>

      <div className="maintenance-footer">
        <span className="maintenance-diamond" />
        BIENTÔT DISPONIBLE
        <span className="maintenance-diamond" />
      </div>
    </div>
  );
}
