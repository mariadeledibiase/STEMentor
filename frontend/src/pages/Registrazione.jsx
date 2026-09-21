import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setUtente } from '../data/utenteCorrente.js';
import CampoPassword from '../components/CampoPassword.jsx';

// Pagina di registrazione/profilazione (§3.2). Ora con email + password
// vere (password cifrata lato server, mai salvata in chiaro), così il
// profilo -- e le conversazioni collegate -- restano accessibili da
// qualsiasi dispositivo.

function Registrazione() {
  const navigate = useNavigate();
  const location = useLocation();
  const destinazioneDopoRegistrazione = location.state?.da || '/';

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eta, setEta] = useState('');
  const [livelloScolastico, setLivelloScolastico] = useState(
   'scuola_secondaria_secondo_grado'
 );
  const [indirizzoScolastico, setIndirizzoScolastico] = useState('');
  const [consensoGenitoriale, setConsensoGenitoriale] = useState(false);
  const [accettaTermini, setAccettaTermini] = useState(false);
  const [errore, setErrore] = useState('');
  const [inviando, setInviando] = useState(false);

  const etaNumero = Number(eta);
  const richiedeConsenso = eta !== '' && etaNumero < 14;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore('');

    if (!nome.trim() || !email.trim() || !password || !eta) {
      setErrore('Nome, email, password ed età sono obbligatori.');
      return;
    }

    if (password.length < 8) {
      setErrore('La password deve avere almeno 8 caratteri.');
      return;
    }

    if (richiedeConsenso && !consensoGenitoriale) {
      setErrore('Per utenti sotto i 14 anni è necessario il consenso di un genitore o tutore.');
      return;
    }

    if (!accettaTermini) {
      setErrore('Devi accettare i Termini e l\'Informativa Privacy per continuare.');
      return;
    }

    setInviando(true);

    try {
      const risposta = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          password,
          eta: etaNumero,
          livello_scolastico: livelloScolastico,
          indirizzo_scolastico: indirizzoScolastico.trim() || null,
          consenso_genitoriale: richiedeConsenso ? consensoGenitoriale : false,
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok) {
        throw new Error(dati.errore || 'Errore durante la registrazione.');
      }

      setUtente({
        id: dati.id,
        nome: dati.nome,
        eta: dati.eta,
        livello_scolastico: dati.livello_scolastico,
      });

      // Ricarichiamo la pagina per intero (invece di navigate()) così la
      // Navbar, che legge l'utente solo all'avvio, si aggiorna subito e
      // mostra i link Avatar/Quiz/Mappe senza bisogno di un refresh manuale.
      window.location.href = destinazioneDopoRegistrazione;
    } catch (err) {
      console.error('Errore nella registrazione:', err);
      setErrore(err.message || 'Qualcosa è andato storto. Riprova tra poco.');
    } finally {
      setInviando(false);
    }
  };

  return (
    <div className="registrazione-page">
      <div className="registrazione-card">
        <h1>Crea il tuo profilo</h1>
        <p className="section-subtitle">
          Ci servono solo poche informazioni per personalizzare le conversazioni con gli avatar.
        </p>

        <form onSubmit={handleSubmit} className="registrazione-form">
          <label>
            Nome e Cognome
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Il tuo nome"
              disabled={inviando}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="latua@email.it"
              disabled={inviando}
            />
          </label>

          <label>
            Password
            <CampoPassword
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Almeno 8 caratteri"
              disabled={inviando}
            />
          </label>

          <label>
            Età
            <input
              type="number"
              min="10"
              max="20"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              placeholder="Es. 16"
              disabled={inviando}
            />
          </label>

          <label>
            Livello scolastico
            <select
              value={livelloScolastico}
              onChange={(e) => setLivelloScolastico(e.target.value)}
              disabled={inviando}
            >
             <option value="scuola_secondaria_primo_grado">
               Scuola Secondaria di primo grado
             </option>

             <option value="scuola_secondaria_secondo_grado">
               Scuola Secondaria di secondo grado
             </option>
            </select>
          </label>

          <label>
            Indirizzo scolastico <span className="campo-opzionale">(opzionale)</span>
            <input
              type="text"
              value={indirizzoScolastico}
              onChange={(e) => setIndirizzoScolastico(e.target.value)}
              placeholder="Es. Liceo scientifico"
              disabled={inviando}
            />
          </label>

          {richiedeConsenso && (
            <div className="consenso-box">
              <label className="consenso-label">
                <input
                  type="checkbox"
                  checked={consensoGenitoriale}
                  onChange={(e) => setConsensoGenitoriale(e.target.checked)}
                  disabled={inviando}
                />
                <span>
                  Confermo di avere il consenso di un genitore o tutore per utilizzare
                  questa piattaforma (richiesto per gli utenti sotto i 14 anni, ai sensi
                  del GDPR).
                </span>
              </label>
            </div>
          )}

          <label className="consenso-label">
            <input
              type="checkbox"
              checked={accettaTermini}
              onChange={(e) => setAccettaTermini(e.target.checked)}
              disabled={inviando}
            />
            <span>
              Ho letto e accetto i <a href="/privacy" target="_blank" rel="noopener noreferrer">Termini e l'Informativa Privacy</a>.
            </span>
          </label>

          {errore && <p className="registrazione-errore">{errore}</p>}

          <button type="submit" className="cta-button" disabled={inviando}>
            {inviando ? 'Creazione profilo...' : 'Crea profilo'}
          </button>
        </form>

        <p className="accedi-nuovo-profilo">
          Hai già un profilo? <a href="/accedi">Accedi</a>
        </p>
      </div>
    </div>
  );
}

export default Registrazione;


