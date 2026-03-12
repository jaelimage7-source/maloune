export const PRE_LAUNCH = true;

export function showPreLaunchAlert() {
  if (typeof window !== 'undefined' && PRE_LAUNCH) {
    const overlay = document.createElement('div');
    overlay.id = 'prelaunch-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(0,0,0,0.7);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s ease;
      ">
        <div style="
          background: linear-gradient(135deg, #1A1A1A, #2D2218);
          border: 1px solid #C49B3C;
          border-radius: 20px;
          padding: 40px 32px;
          max-width: 420px;
          text-align: center;
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        ">
          <div style="
            width: 60px; height: 60px; border-radius: 50%;
            background: linear-gradient(135deg, #C49B3C, #D4AF37);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px;
          ">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h3 style="
            font-family: 'Playfair Display', Georgia, serif;
            color: #D4AF37;
            font-size: 22px;
            margin: 0 0 12px;
            letter-spacing: 1px;
          ">Bientôt disponible</h3>
          <p style="
            font-family: 'DM Sans', sans-serif;
            color: rgba(255,255,255,0.75);
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 24px;
          ">
            Notre boutique est en cours de préparation.<br>
            Les achats seront disponibles très prochainement.
          </p>
          <p style="
            font-family: 'DM Sans', sans-serif;
            color: rgba(255,255,255,0.45);
            font-size: 13px;
            margin: 0 0 24px;
          ">
            Explorez nos produits en attendant !
          </p>
          <button onclick="document.getElementById('prelaunch-overlay').remove()" style="
            background: linear-gradient(135deg, #C49B3C, #D4AF37);
            color: #1A1A1A;
            border: none;
            padding: 12px 36px;
            border-radius: 50px;
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            letter-spacing: 1px;
            transition: transform 0.2s;
          ">
            J'ai compris
          </button>
        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      </style>
    `;
    document.body.appendChild(overlay);
    return true;
  }
  return false;
}
