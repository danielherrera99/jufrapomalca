const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'views', 'LandingView.css');
let cssContent = '';
if (fs.existsSync(cssPath)) {
  cssContent = fs.readFileSync(cssPath, 'utf-8');
} else {
  // Let's create it if it doesn't exist, though we normally append to App.css or index.css.
  // Actually Jufra Web uses index.css. Let's find index.css
  const indexCssPath = path.join(__dirname, 'src', 'index.css');
  cssContent = fs.readFileSync(indexCssPath, 'utf-8');
}

const quienesSomosCss = `
/* QUIENES SOMOS SECTION */
.organigrama-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4rem;
}

.org-level {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  position: relative;
  flex-wrap: wrap;
}

.org-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  text-align: center;
  width: 200px;
  border-top: 4px solid var(--primary);
  transition: transform 0.3s ease;
}

.org-card:hover {
  transform: translateY(-5px);
}

.org-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f0f0;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--secondary);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.org-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.org-name {
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.org-role {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hermanos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.hermano-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.hermano-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: var(--primary);
}

.hermano-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin: 0 auto 0.8rem;
  background: #eee;
  overflow: hidden;
}

.hermano-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hermano-name {
  font-size: 0.95rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.3rem;
}

.hermano-legend {
  font-size: 0.8rem;
  color: var(--secondary);
  font-style: italic;
}
`;

if (cssContent && !cssContent.includes('QUIENES SOMOS SECTION')) {
  fs.appendFileSync(path.join(__dirname, 'src', 'index.css'), '\n' + quienesSomosCss);
}

const landingViewPath = path.join(__dirname, 'src', 'components', 'views', 'LandingView.jsx');
let jsxContent = fs.readFileSync(landingViewPath, 'utf-8');

const quienesSomosJsx = `
        {/* Sección Quiénes Somos */}
        <section id="quienes-somos" className="section-padding" style={{ background: '#fdfbf7', position: 'relative' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Nuestra Fraternidad</span>
              <h2 className="section-title">Quiénes Somos</h2>
            </div>

            {/* Organigrama del Consejo */}
            <h3 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '2rem', fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Consejo Local</h3>
            <div className="organigrama-container">
              
              <div className="org-level">
                <div className="org-card">
                  <div className="org-avatar"><SafeImage src="/images/placeholder-user.png" alt="Ministro" /></div>
                  <div className="org-name">Fray Ejemplo</div>
                  <div className="org-role">Ministro</div>
                </div>
              </div>

              <div className="org-level">
                <div className="org-card">
                  <div className="org-avatar"><SafeImage src="/images/placeholder-user.png" alt="Viceministro" /></div>
                  <div className="org-name">Hermano 2</div>
                  <div className="org-role">Viceministro</div>
                </div>
                <div className="org-card">
                  <div className="org-avatar"><SafeImage src="/images/placeholder-user.png" alt="Responsable de Formación" /></div>
                  <div className="org-name">Hermana 3</div>
                  <div className="org-role">Resp. Formación</div>
                </div>
              </div>

              <div className="org-level">
                <div className="org-card">
                  <div className="org-avatar"><SafeImage src="/images/placeholder-user.png" alt="Secretario" /></div>
                  <div className="org-name">Hermano 4</div>
                  <div className="org-role">Secretario</div>
                </div>
                <div className="org-card">
                  <div className="org-avatar"><SafeImage src="/images/placeholder-user.png" alt="Tesorero" /></div>
                  <div className="org-name">Hermana 5</div>
                  <div className="org-role">Tesorero</div>
                </div>
                <div className="org-card">
                  <div className="org-avatar"><SafeImage src="/images/placeholder-user.png" alt="Animador Fraterno" /></div>
                  <div className="org-name">Hermano 6</div>
                  <div className="org-role">Animador Fraterno</div>
                </div>
              </div>

            </div>

            {/* Cuadrícula de Nuestros Hermanos */}
            <div style={{ marginTop: '5rem' }}>
              <h3 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Nuestros Hermanos</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                Conoce a los jóvenes que actualmente forman parte de la JUFRA Pomalca, viviendo su compromiso en diferentes etapas de formación.
              </p>
              
              <div className="hermanos-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="hermano-card">
                    <div className="hermano-avatar">
                      <SafeImage src="/images/placeholder-user.png" alt={\`Hermano \${item}\`} />
                    </div>
                    <div className="hermano-name">Hermano {item}</div>
                    <div className="hermano-legend">{item % 3 === 0 ? "Promesado" : item % 2 === 0 ? "Etapa de Iniciación" : "Etapa de Aceptación"}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
`;

if (!jsxContent.includes('quienes-somos')) {
  const parts = jsxContent.split('{/* Sección Nuestras Celebraciones */}');
  if (parts.length === 2) {
    jsxContent = parts[0] + quienesSomosJsx + '\n        {/* Sección Nuestras Celebraciones */}' + parts[1];
    fs.writeFileSync(landingViewPath, jsxContent);
    console.log("Success");
  } else {
    console.log("Error: Target comment not found.");
  }
} else {
    console.log("Success (Already injected)");
}
