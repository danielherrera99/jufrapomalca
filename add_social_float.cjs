const fs = require('fs');
const path = require('path');

// 1. Update FloatingChat.css
const cssPath = path.join(__dirname, 'src/components/FloatingChat.css');
let cssContent = fs.readFileSync(cssPath, 'utf-8');

const socialCss = `
.social-bubble {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 15px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-bubble:hover {
  transform: scale(1.1) rotate(5deg);
  color: white;
}

.social-bubble.facebook {
  background: #1877F2;
  box-shadow: 0 8px 32px rgba(24, 119, 242, 0.3);
}

.social-bubble.facebook:hover {
  box-shadow: 0 12px 40px rgba(24, 119, 242, 0.4);
}

.social-bubble.instagram {
  background: #E1306C;
  box-shadow: 0 8px 32px rgba(225, 48, 108, 0.3);
}

.social-bubble.instagram:hover {
  box-shadow: 0 12px 40px rgba(225, 48, 108, 0.4);
}

.social-bubble.tiktok {
  background: #000000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.social-bubble.tiktok:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
`;

if (!cssContent.includes('.social-bubble')) {
    cssContent += socialCss;
    fs.writeFileSync(cssPath, cssContent);
}

// 2. Update FloatingChat.jsx
const jsxPath = path.join(__dirname, 'src/components/FloatingChat.jsx');
let jsxContent = fs.readFileSync(jsxPath, 'utf-8');

const facebookBtn = `
      {/* Botón Flotante de Facebook */}
      <a 
        href="https://facebook.com/jufrapomalca" 
        target="_blank" 
        rel="noopener noreferrer"
        className="social-bubble facebook"
        title="Facebook"
      >
        <span className="icon">
          <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </span>
      </a>`;

const instagramBtn = `
      {/* Botón Flotante de Instagram */}
      <a 
        href="https://instagram.com/jufra.pomalca" 
        target="_blank" 
        rel="noopener noreferrer"
        className="social-bubble instagram"
        title="Instagram"
      >
        <span className="icon">
          <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        </span>
      </a>`;

const tiktokBtn = `
      {/* Botón Flotante de TikTok */}
      <a 
        href="https://tiktok.com/@jufra.pomalca" 
        target="_blank" 
        rel="noopener noreferrer"
        className="social-bubble tiktok"
        title="TikTok"
      >
        <span className="icon">
          <svg viewBox="0 0 24 24" fill="currentColor" height="20" width="20"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.53-4.09-1.37-.76-.53-1.43-1.22-1.93-2.02v6.18c.1 2.62-1.12 5.25-3.32 6.66-2.22 1.43-5.23 1.58-7.6 1.05-2.37-.53-4.52-2.23-5.46-4.53-1-2.45-.63-5.48 1.01-7.58 1.62-2.07 4.34-3.13 6.94-2.82 1.08.13 2.15.53 3.03 1.18V.02zm-3.24 10.74c-1.42-.23-2.92.36-3.72 1.57-.8 1.21-.83 2.89-.09 4.14.74 1.25 2.19 1.95 3.62 1.81 1.42-.14 2.7-1.15 3.12-2.52.42-1.37-.01-2.96-1.08-3.87-.73-.61-1.67-.98-2.63-1.13z"/></svg>
        </span>
      </a>`;

if (!jsxContent.includes('social-bubble facebook')) {
    const whatsappComment = '{/* Botón Flotante de WhatsApp */}';
    const parts = jsxContent.split(whatsappComment);
    if (parts.length === 2) {
        jsxContent = parts[0] + facebookBtn + instagramBtn + tiktokBtn + '\n      ' + whatsappComment + parts[1];
        fs.writeFileSync(jsxPath, jsxContent);
    }
}

console.log("Success");
