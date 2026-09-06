import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setUtente } from '../data/utenteCorrente.js';
import CampoPassword from '../components/CampoPassword.jsx';

function Accedi() {
  const navigate = useNavigate();
  const location = useLocation();
  const destinazioneDopoAccesso = location.state?.da || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [caricando, setCaricando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore('');

    if (!email.trim() || !password) {
      setErrore('Inserisci email e password.');
      return;
    }

    setCaricando(true);

    try {
      const risposta = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const dati = await risposta.json();

      if (!risposta.ok) {
        throw new Error(dati.errore || 'Accesso non riuscito.');
      }

      setUtente({
        id: dati.id,
        nome: dati.nome,
        eta: dati.eta,
        livello_scolastico: dati.livello_scolastico,
      });

      // Ricarichiamo la pagina per intero (invece di navigate()) così la
      // Navbar si aggiorna subito e mostra tutti i link.
      window.location.href = destinazioneDopoAccesso;
    } catch (err) {
      setErrore(err.message || 'Qualcosa è andato storto. Riprova.');
    } finally {
      setCaricando(false);
    }
  };

  return (
    <div className="registrazione-page">
      <div className="registrazione-card">
        <h1>Bentornata</h1>
        <p className="section-subtitle">
          Accedi per ritrovare le tue conversazioni.
        </p>

        <form onSubmit={handleSubmit} className="registrazione-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="latua@email.it"
              disabled={caricando}
            />
          </label>

          <label>
            Password
            <CampoPassword
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="La tua password"
              disabled={caricando}
            />
          </label>

          {errore && <p className="registrazione-errore">{errore}</p>}

          <button type="submit" className="cta-button" disabled={caricando}>
            {caricando ? 'Accesso...' : 'Accedi'}
          </button>
        </form>

        <p className="accedi-nuovo-profilo">
          <a href="/recupera-password">Password dimenticata?</a>
        </p>

        <p className="accedi-nuovo-profilo">
          Non hai ancora un profilo? <a href="/registrati">Creane uno</a>
        </p>
      </div>
    </div>
  );
}

export default Accedi;


