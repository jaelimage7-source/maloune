'use client';

import { useState } from 'react';

export default function PreLaunchBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap');

        .prelaunch-banner {
          position: relative;
          background: linear-gradient(135deg, #1A1A1A 0%, #2D2218 50%, #1A1A1A 100%);
          overflow: hidden;
          border-bottom: 2px solid #C49B3C;
        }
        .prelaunch-inner {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .prelaunch-sparkle {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 1;
          overflow: hidden;
        }
        .prelaunch-sparkle span {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #D4AF37;
          border-radius: 50%;
          animation: prelaunch-twinkle 3s ease-in-out infinite;
        }
        @keyframes prelaunch-twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.5); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        .prelaunch-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C49B3C, #D4AF37);
          flex-shrink: 0;
          animation: prelaunch-pulse 2.5s ease-in-out infinite;
        }
        @keyframes prelaunch-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196, 155, 60, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(196, 155, 60, 0); }
        }
        .prelaunch-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.9);
          line-height: 1.5;
          text-align: center;
        }
        .prelaunch-text strong {
          font-family: 'Playfair Display', serif;
          color: #D4AF37;
          font-size: 15px;
          letter-spacing: 0.5px;
        }
        .prelaunch-text .prelaunch-sub {
          display: block;
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          margin-top: 2px;
        }
        .prelaunch-close {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
          z-index: 3;
        }
        .prelaunch-close:hover {
          color: rgba(255,255,255,0.7);
        }
        @media (max-width: 600px) {
          .prelaunch-inner { padding: 12px 40px 12px 16px; }
          .prelaunch-text { font-size: 13px; }
          .prelaunch-icon { width: 30px; height: 30px; }
        }
      `}</style>

      <div className="prelaunch-banner">
        <div className="prelaunch-sparkle">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + ((i * 37) % 60)}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2 + (i % 3)}s`,
              }}
            />
          ))}
        </div>

        <div className="prelaunch-inner">
          <div className="prelaunch-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div className="prelaunch-text">
            <strong>Ouverture officielle très prochainement</strong>
            <span className="prelaunch-sub">
              Explorez notre catalogue en avant-première — les achats seront disponibles dès le lancement.
            </span>
          </div>
        </div>

        <button className="prelaunch-close" onClick={() => setDismissed(true)} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </>
  );
}
