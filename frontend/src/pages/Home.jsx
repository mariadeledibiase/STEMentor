import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUtente } from '../data/utenteCorrente.js';

const COLORI_AVATAR = {
  'Ada Lovelace': '#8C82E8',
  'Marie Curie': '#F49A86',
  'Margherita Hack': '#71C9C2',
  'Samantha Cristoforetti': '#E7B85B',
};

const MENTOR_HOME = [
  {
    nome: 'Ada Lovelace',
    disciplina: 'Informatica e matematica',
    immagine: '/immagini/ada/ada-talk-1.png',
    colore: '#8C82E8',
  },
  {
    nome: 'Marie Curie',
    disciplina: 'Fisica e chimica',
    immagine: '/immagini/marie/marie-talk-1.png',
    colore: '#F49A86',
  },
  {
    nome: 'Margherita Hack',
    disciplina: 'Astrofisica e spazio',
    immagine: '/immagini/margherita/margherita-talk-1.png',
    colore: '#71C9C2',
  },
  {
    nome: 'Samantha Cristoforetti',
    disciplina: 'Ingegneria e progettazione',
    immagine: '/immagini/samantha/samantha-talk-1.png',
    colore: '#E7B85B',
  },
];

const FUNZIONALITA = [
  {
    numero: '01',
    titolo: 'Parla con le mentor',
    descrizione: 'Fai domande e ascolta storie vere.',
    classe: 'feature-lavender',
  },
  {
    numero: '02',
    titolo: 'Fai il quiz',
    descrizione: 'Scopri quali aree STEM ti incuriosiscono di più.',
    classe: 'feature-peach',
  },
  {
    numero: '03',
    titolo: 'Esplora i percorsi',
    descrizione: 'Trova scuole, università e possibili carriere.',
    classe: 'feature-mint',
  },
];

function Home() {
  const [utente] = useState(() => getUtente());
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
    if (utente) {
      fetch('/api/avatars')
        .then((res) => res.json())
        .then((data) => setAvatars(data))
        .catch((err) =>
          console.error('Errore nel caricamento avatar:', err)
        );
    }
  }, [utente]);

  return (
    <div className="home-page">

      {/* =========================
          HERO
          ========================= */}

      <section className="hero-dashboard">
        <div className="hero-dashboard-content">

          <div className="hero-dashboard-copy">
            <span className="hero-eyebrow">
              DONNE · SCIENZA · IL TUO FUTURO
            </span>

            <h1>
              {utente ? (
                <>
                  Bentornata,
                  <span>{utente.nome.split(' ')[0]}.</span>
                </>
              ) : (
                <>
                  Il tuo futuro può avere
                  <span>più voci.</span>
                </>
              )}
            </h1>

            <p>
              {utente
                ? 'Riprendi il tuo percorso: scegli una mentor, continua il quiz o esplora nuove possibilità.'
                : 'Incontra donne che hanno fatto la storia e scopri, passo dopo passo, il tuo percorso nelle STEM.'}
            </p>

            <div className="hero-dashboard-actions">
              {utente ? (
                <>
                  <Link
                    to="/avatar"
                    className="hero-primary-button"
                  >
                    Incontra le mentor
                  </Link>

                  <Link
                    to="/quiz"
                    className="hero-secondary-button"
                  >
                    Continua il quiz
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/registrati"
                    className="hero-primary-button"
                  >
                    Inizia ora
                  </Link>

                  <Link
                    to="/accedi"
                    className="hero-secondary-button"
                  >
                    Ho già un profilo
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* IMMAGINE INTEGRATA NELLA HERO */}

          <div className="hero-dashboard-visual">
            <img
              src="/immagini/stementor-percorsi-hero-tight.png"
              alt="Studentessa davanti a quattro possibili percorsi STEM"
            />
          </div>

        </div>
      </section>


      {/* =========================
          FUNZIONALITÀ
          ========================= */}

      <section className="home-quick-section">
        <div className="feature-grid feature-grid-v2">

          {FUNZIONALITA.map((funzione) => (
            <article
              key={funzione.numero}
              className={`feature-card ${funzione.classe}`}
            >
              <span className="feature-number">
                {funzione.numero}
              </span>

              <div>
                <h3>{funzione.titolo}</h3>
                <p>{funzione.descrizione}</p>
              </div>
            </article>
          ))}

        </div>
      </section>


      {/* =========================
          MENTOR
          ========================= */}

      {utente ? (
        <section className="home-section">

          <div className="section-heading">
            <div>
              <span className="eyebrow">
                LE TUE MENTOR
              </span>

              <h2>
                Con chi vuoi parlare oggi?
              </h2>
            </div>

            <Link
              to="/avatar"
              className="text-link"
            >
              Vedi tutte →
            </Link>
          </div>


          <div className="home-avatar-grid home-avatar-grid-v2">

            {avatars.map((avatar) => {
              const mentor = MENTOR_HOME.find(
                (m) => m.nome === avatar.nome
              );

              return (
                <Link
                  to={`/chat/${avatar.id}`}
                  key={avatar.id}
                  className="home-avatar-card home-avatar-card-v2"
                  style={{
                    '--avatar-color':
                      COLORI_AVATAR[avatar.nome] || '#8C82E8',
                  }}
                >

                  {mentor && (
                    <div className="home-avatar-image">
                      <img
                        src={mentor.immagine}
                        alt={avatar.nome}
                      />
                    </div>
                  )}

                  <div className="home-avatar-copy">
                    <h3>
                      {avatar.nome}
                    </h3>

                    <p>
                      {avatar.disciplina}
                    </p>
                  </div>

                  <span className="card-arrow">
                    →
                  </span>

                </Link>
              );
            })}

          </div>

        </section>
      ) : (

        /* =========================
           UTENTE NON REGISTRATO
           ========================= */

        <section className="home-section home-intro">

          <div className="section-heading centered">

            <span className="eyebrow">
              UN PASSO ALLA VOLTA
            </span>

            <h2>
              Non devi sapere già cosa vuoi diventare.
            </h2>

            <p>
              STEMentor ti aiuta a esplorare senza pressioni,
              partendo dalle tue curiosità.
            </p>

          </div>

        </section>

      )}

    </div>
  );
}

export default Home;