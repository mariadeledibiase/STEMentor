import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUtente, setUtente, rimuoviUtente } from '../data/utenteCorrente.js';
import CampoPassword from '../components/CampoPassword.jsx';

function Profilo() {
  const navigate = useNavigate();
  const [utente] = useState(() => getUtente());

  const [nome, setNome] = useState('');
  const [eta, setEta] = useState('');
  const [livelloScolastico, setLivelloScolastico] = useState('scuola_superiore');
  const [indirizzoScolastico, setIndirizzoScolastico] = useState('');
  const [caricato, setCaricato] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [messaggioSuccesso, setMessaggioSuccesso] = useState('');

  const [passwordAttuale, setPasswordAttuale] = useState('');
  const [passwordNuova, setPasswordNuova] = useState('');
  const [erroreDatoPassword, setErrorePassword] = useState('');
  const [successoPassword, setSuccessoPassword] = useState('');
  const [salvandoPassword, setSalvandoPassword] = useState(false);

  useEffect(() => {
    if (!utente) return;

    fetch(`/api/users/${utente.id}`)
      .then((res) => res.json())
      .then((dati) => {
        setNome(dati.nome || '');
        setEta(dati.eta || '');
        setLivelloScolastico(dati.livello_scolastico || 'scuola_superiore');
        setIndirizzoScolastico(dati.indirizzo_scolastico || '');
      })
      .catch((err) => console.error('Errore nel recupero del profilo:', err))
      .finally(() => setCaricato(true));
  }, [utente]);

  const salvaProfilo = async (e) => {
    e.preventDefault();
    setErrore('');
    setMessaggioSuccesso('');

    if (!nome.trim() || !eta) {
      setErrore('Nome ed età sono obbligatori.');
      return;
    }

    setSalvando(true);

    try {
      const risposta = await fetch(`/api/users/${utente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          eta: Number(eta),
          livello_scolastico: livelloScolastico,
          indirizzo_scolastico: indirizzoScolastico.trim() || null,
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok) {
        throw new Error(dati.errore || 'Errore durante il salvataggio.');
      }

      // Aggiorniamo anche la copia locale (localStorage), così Navbar,
      // Chat e Quiz vedono subito i dati aggiornati.
      setUtente({
        id: dati.id,
        nome: dati.nome,
        eta: dati.eta,
        livello_scolastico: dati.livello_scolastico,
      });

      setMessaggioSuccesso('Profilo aggiornato.');
    } catch (err) {
      setErrore(err.message || 'Qualcosa è andato storto.');
    } finally {
      setSalvando(false);
    }
  };

  const cambiaPassword = async (e) => {
    e.preventDefault();
    setErrorePassword('');
    setSuccessoPassword('');

    if (!passwordAttuale || !passwordNuova) {
      setErrorePassword('Inserisci sia la password attuale che quella nuova.');
      return;
    }

    setSalvandoPassword(true);

    try {
      const risposta = await fetch(`/api/users/${utente.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password_attuale: passwordAttuale,
          password_nuova: passwordNuova,
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok) {
        throw new Error(dati.errore || 'Errore durante il cambio password.');
      }

      setSuccessoPassword('Password aggiornata.');
      setPasswordAttuale('');
      setPasswordNuova('');
    } catch (err) {
      setErrorePassword(err.message || 'Qualcosa è andato storto.');
    } finally {
      setSalvandoPassword(false);
    }
  };

  const elimina = () => {
    // Nota: qui rimuoviamo solo il profilo dal browser (logout), non
    // cancelliamo l'account dal database -- una vera cancellazione
    // dell'account è uno sviluppo futuro utile per la conformità GDPR
    // (diritto alla cancellazione), da collegare a una vera route DELETE.
    rimuoviUtente();
    navigate('/');
  };

  if (!utente) {
    return (
      <div className="chat-page">
        <div className="chat-blocco-registrazione">
          <h1>Devi prima accedere</h1>
          <button className="cta-button" onClick={() => navigate('/accedi')}>
            Accedi
          </button>
        </div>
      </div>
    );
  }

  if (!caricato) {
    return (
      <div className="registrazione-page">
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="registrazione-page">
      <div className="registrazione-card">
        <h1>Il tuo profilo</h1>
        <p className="section-subtitle">Modifica i tuoi dati in qualsiasi momento.</p>

        <form onSubmit={salvaProfilo} className="registrazione-form">
          <label>
            Nome
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} disabled={salvando} />
          </label>

          <label>
            Età
            <input
              type="number"
              min="10"
              max="20"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              disabled={salvando}
            />
          </label>

          <label>
            Livello scolastico
            <select value={livelloScolastico} onChange={(e) => setLivelloScolastico(e.target.value)} disabled={salvando}>
              <option value="scuola_media">Scuola media</option>
              <option value="scuola_superiore">Scuola superiore</option>
            </select>
          </label>

          <label>
            Indirizzo scolastico <span className="campo-opzionale">(opzionale)</span>
            <input
              type="text"
              value={indirizzoScolastico}
              onChange={(e) => setIndirizzoScolastico(e.target.value)}
              disabled={salvando}
            />
          </label>

          {errore && <p className="registrazione-errore">{errore}</p>}
          {messaggioSuccesso && <p className="profilo-successo">{messaggioSuccesso}</p>}

          <button type="submit" className="cta-button" disabled={salvando}>
            {salvando ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </form>

        <hr className="profilo-separatore" />

        <h2 className="profilo-sottotitolo">Cambia password</h2>
        <form onSubmit={cambiaPassword} className="registrazione-form">
          <label>
            Password attuale
            <CampoPassword
              value={passwordAttuale}
              onChange={(e) => setPasswordAttuale(e.target.value)}
              disabled={salvandoPassword}
            />
          </label>

          <label>
            Nuova password
            <CampoPassword
              value={passwordNuova}
              onChange={(e) => setPasswordNuova(e.target.value)}
              placeholder="Almeno 8 caratteri"
              disabled={salvandoPassword}
            />
          </label>

          {erroreDatoPassword && <p className="registrazione-errore">{erroreDatoPassword}</p>}
          {successoPassword && <p className="profilo-successo">{successoPassword}</p>}

          <button type="submit" className="cta-button" disabled={salvandoPassword}>
            {salvandoPassword ? 'Aggiornamento...' : 'Cambia password'}
          </button>
        </form>

        <hr className="profilo-separatore" />

        <button className="profilo-esci-link" onClick={elimina}>
          Esci dall'account
        </button>
      </div>
    </div>
  );
}

export default Profilo;
