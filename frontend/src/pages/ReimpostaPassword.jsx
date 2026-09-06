import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CampoPassword from '../components/CampoPassword.jsx';

function ReimpostaPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [passwordNuova, setPasswordNuova] = useState('');
  const [conferma, setConferma] = useState('');
  const [errore, setErrore] = useState('');
  const [inviando, setInviando] = useState(false);
  const [fatto, setFatto] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore('');

    if (!token) {
      setErrore('Link non valido: manca il token.');
      return;
    }

    if (passwordNuova.length < 8) {
      setErrore('La password deve avere almeno 8 caratteri.');
      return;
    }

    if (passwordNuova !== conferma) {
      setErrore('Le due password non coincidono.');
      return;
    }

    setInviando(true);

    try {
      const risposta = await fetch('/api/users/reimposta-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuova_password: passwordNuova }),
      });

      const dati = await risposta.json();

      if (!risposta.ok) {
        throw new Error(dati.errore || 'Errore durante il reset.');
      }

      setFatto(true);
    } catch (err) {
      setErrore(err.message || 'Qualcosa è andato storto.');
    } finally {
      setInviando(false);
    }
  };

  if (fatto) {
    return (
      <div className="registrazione-page">
        <div className="registrazione-card">
          <h1>Fatto!</h1>
          <p className="section-subtitle">La tua password è stata aggiornata.</p>
          <button className="cta-button" onClick={() => navigate('/accedi')}>
            Vai all'accesso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="registrazione-page">
      <div className="registrazione-card">
        <h1>Imposta una nuova password</h1>

        <form onSubmit={handleSubmit} className="registrazione-form">
          <label>
            Nuova password
            <CampoPassword
              value={passwordNuova}
              onChange={(e) => setPasswordNuova(e.target.value)}
              placeholder="Almeno 8 caratteri"
              disabled={inviando}
            />
          </label>

          <label>
            Conferma password
            <CampoPassword
              value={conferma}
              onChange={(e) => setConferma(e.target.value)}
              disabled={inviando}
            />
          </label>

          {errore && <p className="registrazione-errore">{errore}</p>}

          <button type="submit" className="cta-button" disabled={inviando}>
            {inviando ? 'Salvataggio...' : 'Salva nuova password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReimpostaPassword;
