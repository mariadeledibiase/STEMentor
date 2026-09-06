import { useState } from 'react';

function RecuperaPassword() {
  const [email, setEmail] = useState('');
  const [inviando, setInviando] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [linkReset, setLinkReset] = useState(null);
  const [errore, setErrore] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore('');
    setMessaggio('');
    setLinkReset(null);

    if (!email.trim()) {
      setErrore('Inserisci la tua email.');
      return;
    }

    setInviando(true);

    try {
      const risposta = await fetch('/api/users/recupera-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const dati = await risposta.json();
      setMessaggio(dati.messaggio);
      if (dati.link_reset) {
        setLinkReset(dati.link_reset);
      }
    } catch (err) {
      setErrore('Qualcosa è andato storto. Riprova.');
    } finally {
      setInviando(false);
    }
  };

  return (
    <div className="registrazione-page">
      <div className="registrazione-card">
        <h1>Password dimenticata</h1>
        <p className="section-subtitle">
          Inserisci la tua email: ti mostreremo un link per reimpostare la password.
        </p>

        <form onSubmit={handleSubmit} className="registrazione-form">
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

          {errore && <p className="registrazione-errore">{errore}</p>}

          <button type="submit" className="cta-button" disabled={inviando}>
            {inviando ? 'Invio...' : 'Invia link di reset'}
          </button>
        </form>

        {messaggio && (
          <div className="reset-esito">
            <p>{messaggio}</p>
            {linkReset && (
              <>
                <p className="reset-nota">
                  ⚠️ Nota per il prototipo: in un'app reale questo link ti
                  arriverebbe via email. Qui, per restare senza costi, te lo
                  mostriamo direttamente.
                </p>
                <a href={linkReset} className="cta-button reset-link-button">
                  Reimposta la password
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecuperaPassword;
