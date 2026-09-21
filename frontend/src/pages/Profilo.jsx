import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUtente,
  setUtente,
  rimuoviUtente
} from '../data/utenteCorrente.js';
import CampoPassword from '../components/CampoPassword.jsx';


// ======================================================
// MODALE ELIMINAZIONE ACCOUNT
// ======================================================

function ModaleEliminaAccount({
  password,
  setPassword,
  errore,
  eliminando,
  onConferma,
  onAnnulla
}) {
  return (
    <div
      className="ea-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ea-titolo"
      onClick={onAnnulla}
    >
      <div
        className="ea-riquadro"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="ea-titolo">
          Eliminare definitivamente l'account?
        </h3>

        <p className="ea-descrizione">
          Tutti i tuoi dati e le tue conversazioni verranno eliminati
          definitivamente.
          <strong> Questa operazione non può essere annullata.</strong>
        </p>

        <label className="ea-label">
          Password attuale

          <CampoPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci la tua password"
            disabled={eliminando}
          />
        </label>

        {errore && (
          <p className="ea-errore">
            {errore}
          </p>
        )}

        <div className="ea-azioni">
          <button
            type="button"
            className="ea-annulla"
            onClick={onAnnulla}
            disabled={eliminando}
          >
            Annulla
          </button>

          <button
            type="button"
            className="ea-elimina"
            onClick={onConferma}
            disabled={eliminando || !password}
          >
            {eliminando ? 'Eliminazione...' : 'Elimina account'}
          </button>
        </div>
      </div>

      <style>{`
        .ea-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;

          background: rgba(35, 28, 32, 0.52);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 24px;

          animation: ea-comparsa 0.15s ease-out;
        }

        .ea-riquadro {
          width: 100%;
          max-width: 410px;

          background: #FFFFFF;

          border-radius: 20px;

          padding: 30px 28px;

          border: 1px solid #E8E1DB;
          border-top: 5px solid #D94F4F;

          box-shadow:
            0 20px 55px rgba(35, 28, 32, 0.28),
            0 3px 10px rgba(35, 28, 32, 0.10);

          animation: ea-salita 0.18s ease-out;
        }

        .ea-riquadro h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.35rem;
          font-weight: 700;
          line-height: 1.3;

          color: #241E1B;

          margin: 0 0 13px;
        }

        .ea-descrizione {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          line-height: 1.55;

          color: #514640;

          margin: 0 0 22px;
        }

        .ea-descrizione strong {
          color: #D94F4F;
          font-weight: 700;
        }

        .ea-label {
          display: block;

          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;

          color: #403732;

          margin-bottom: 18px;
        }

        .ea-label > div,
        .ea-label input {
          margin-top: 7px;
        }

        .ea-errore {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;

          color: #C83F3F;
          background: #FFF1F1;

          border: 1px solid #F2CACA;
          border-radius: 10px;

          padding: 10px 12px;

          margin: 0 0 18px;
        }

        .ea-azioni {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 11px;

          margin-top: 6px;
        }

        .ea-annulla,
        .ea-elimina {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 700;

          padding: 11px 20px;

          border-radius: 999px;

          cursor: pointer;

          transition:
            background 0.15s ease,
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .ea-annulla {
          background: #F4F0EC;
          color: #403732;

          border: 1px solid #D9D0C9;
        }

        .ea-annulla:hover:not(:disabled) {
          background: #EAE3DD;
          transform: translateY(-1px);
        }

        .ea-elimina {
          background: #D94F4F;
          color: #FFFFFF;

          border: 1px solid #D94F4F;

          box-shadow: 0 4px 13px rgba(217, 79, 79, 0.30);
        }

        .ea-elimina:hover:not(:disabled) {
          background: #C83F3F;

          transform: translateY(-1px);

          box-shadow: 0 6px 17px rgba(217, 79, 79, 0.38);
        }

        .ea-elimina:disabled,
        .ea-annulla:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        @keyframes ea-comparsa {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes ea-salita {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 480px) {
          .ea-azioni {
            flex-direction: column-reverse;
          }

          .ea-annulla,
          .ea-elimina {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ea-overlay,
          .ea-riquadro {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}


// ======================================================
// PAGINA PROFILO
// ======================================================

function Profilo() {
  const navigate = useNavigate();

  const [utente] = useState(() => getUtente());

  // Dati profilo
  const [nome, setNome] = useState('');
  const [eta, setEta] = useState('');
  const [livelloScolastico, setLivelloScolastico] =
    useState('scuola_secondaria_secondo_grado')
  const [indirizzoScolastico, setIndirizzoScolastico] =
    useState('');

  const [caricato, setCaricato] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [messaggioSuccesso, setMessaggioSuccesso] =
    useState('');

  // Cambio password
  const [passwordAttuale, setPasswordAttuale] =
    useState('');

  const [passwordNuova, setPasswordNuova] =
    useState('');

  const [erroreDatoPassword, setErrorePassword] =
    useState('');

  const [successoPassword, setSuccessoPassword] =
    useState('');

  const [salvandoPassword, setSalvandoPassword] =
    useState(false);

  // Eliminazione account
  const [mostraEliminaAccount, setMostraEliminaAccount] =
    useState(false);

  const [passwordEliminazione, setPasswordEliminazione] =
    useState('');

  const [erroreEliminazione, setErroreEliminazione] =
    useState('');

  const [eliminandoAccount, setEliminandoAccount] =
    useState(false);


  // ======================================================
  // CARICA PROFILO
  // ======================================================

  useEffect(() => {
    if (!utente) {
      setCaricato(true);
      return;
    }

    fetch(`/api/users/${utente.id}`)
      .then(async (res) => {
        const dati = await res.json();

        if (!res.ok) {
          throw new Error(
            dati.errore || 'Errore nel recupero del profilo.'
          );
        }

        return dati;
      })
      .then((dati) => {
        setNome(dati.nome || '');
        setEta(dati.eta || '');

        /*
          Compatibilità anche con eventuali utenti già salvati
          con i vecchi valori testuali.
        */
        if (
          dati.livello_scolastico ===
          'Scuola Secondaria di primo grado'
        ) {
          setLivelloScolastico('scuola_secondaria_primo_grado');
        } else if (
          dati.livello_scolastico ===
          'Scuola Secondaria di secondo grado'
        ) {
          setLivelloScolastico('scuola_secondaria_secondo_grado');
        } else {
          setLivelloScolastico(
            dati.livello_scolastico || 'scuola_secondaria_secondo_grado'
          );
        }

        setIndirizzoScolastico(
          dati.indirizzo_scolastico || ''
        );
      })
      .catch((err) => {
        console.error(
          'Errore nel recupero del profilo:',
          err
        );
      })
      .finally(() => {
        setCaricato(true);
      });

  }, [utente]);


  // ======================================================
  // SALVA PROFILO
  // ======================================================

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
      const risposta = await fetch(
        `/api/users/${utente.id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            nome: nome.trim(),
            eta: Number(eta),
            livello_scolastico: livelloScolastico,
            indirizzo_scolastico:
              indirizzoScolastico.trim() || null
          })
        }
      );

      const dati = await risposta.json();

      if (!risposta.ok) {
        throw new Error(
          dati.errore ||
          'Errore durante il salvataggio.'
        );
      }

      // Aggiorna anche l'utente salvato nel browser
      setUtente({
        id: dati.id,
        nome: dati.nome,
        eta: dati.eta,
        livello_scolastico:
          dati.livello_scolastico
      });

      setMessaggioSuccesso(
        'Profilo aggiornato.'
      );

    } catch (err) {
      setErrore(
        err.message ||
        'Qualcosa è andato storto.'
      );

    } finally {
      setSalvando(false);
    }
  };


  // ======================================================
  // CAMBIA PASSWORD
  // ======================================================

  const cambiaPassword = async (e) => {
    e.preventDefault();

    setErrorePassword('');
    setSuccessoPassword('');

    if (!passwordAttuale || !passwordNuova) {
      setErrorePassword(
        'Inserisci sia la password attuale che quella nuova.'
      );
      return;
    }

    if (passwordNuova.length < 8) {
      setErrorePassword(
        'La nuova password deve avere almeno 8 caratteri.'
      );
      return;
    }

    setSalvandoPassword(true);

    try {
      const risposta = await fetch(
        `/api/users/${utente.id}/password`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            password_attuale: passwordAttuale,
            password_nuova: passwordNuova
          })
        }
      );

      const dati = await risposta.json();

      if (!risposta.ok) {
        throw new Error(
          dati.errore ||
          'Errore durante il cambio password.'
        );
      }

      setSuccessoPassword(
        'Password aggiornata.'
      );

      setPasswordAttuale('');
      setPasswordNuova('');

    } catch (err) {
      setErrorePassword(
        err.message ||
        'Qualcosa è andato storto.'
      );

    } finally {
      setSalvandoPassword(false);
    }
  };


  // ======================================================
  // ESCI DALL'ACCOUNT
  // ======================================================

  const esciAccount = () => {
    rimuoviUtente();
    navigate('/');
  };


  // ======================================================
  // APRE MODALE ELIMINAZIONE
  // ======================================================

  const apriEliminaAccount = () => {
    setPasswordEliminazione('');
    setErroreEliminazione('');
    setMostraEliminaAccount(true);
  };


  // ======================================================
  // CHIUDE MODALE ELIMINAZIONE
  // ======================================================

  const chiudiEliminaAccount = () => {
    if (eliminandoAccount) return;

    setMostraEliminaAccount(false);
    setPasswordEliminazione('');
    setErroreEliminazione('');
  };


  // ======================================================
  // ELIMINA DEFINITIVAMENTE ACCOUNT
  // ======================================================

  const eliminaAccount = async () => {
    if (!passwordEliminazione) {
      setErroreEliminazione(
        'Inserisci la password per continuare.'
      );
      return;
    }

    setErroreEliminazione('');
    setEliminandoAccount(true);

    try {
      const risposta = await fetch(
        `/api/users/${utente.id}`,
        {
          method: 'DELETE',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            password: passwordEliminazione
          })
        }
      );

      let dati = {};

      try {
        dati = await risposta.json();
      } catch {
        dati = {};
      }

      if (!risposta.ok) {
        throw new Error(
          dati.errore ||
          'Non è stato possibile eliminare l’account.'
        );
      }

      // Account eliminato dal database:
      // eliminiamo anche la copia salvata nel browser.
      rimuoviUtente();

      setMostraEliminaAccount(false);

      navigate('/');

    } catch (err) {
      setErroreEliminazione(
        err.message ||
        'Qualcosa è andato storto.'
      );

    } finally {
      setEliminandoAccount(false);
    }
  };


  // ======================================================
  // UTENTE NON LOGGATO
  // ======================================================

  if (!utente) {
    return (
      <div className="chat-page">
        <div className="chat-blocco-registrazione">

          <h1>Devi prima accedere</h1>

          <button
            type="button"
            className="cta-button"
            onClick={() => navigate('/accedi')}
          >
            Accedi
          </button>

        </div>
      </div>
    );
  }


  // ======================================================
  // CARICAMENTO
  // ======================================================

  if (!caricato) {
    return (
      <div className="registrazione-page">
        <p>Caricamento...</p>
      </div>
    );
  }


  // ======================================================
  // INTERFACCIA
  // ======================================================

  return (
    <div className="registrazione-page">

      <div className="registrazione-card">

        <h1>Il tuo profilo</h1>

        <p className="section-subtitle">
          Modifica i tuoi dati in qualsiasi momento.
        </p>


        {/* =============================================
            DATI PROFILO
        ============================================= */}

        <form
          onSubmit={salvaProfilo}
          className="registrazione-form"
        >

          <label>
            Nome

            <input
              type="text"
              value={nome}
              onChange={(e) =>
                setNome(e.target.value)
              }
              disabled={salvando}
            />
          </label>


          <label>
            Età

            <input
              type="number"
              min="10"
              max="20"
              value={eta}
              onChange={(e) =>
                setEta(e.target.value)
              }
              disabled={salvando}
            />
          </label>


          <label>
            Livello scolastico

            <select
              value={livelloScolastico}
              onChange={(e) =>
                setLivelloScolastico(
                  e.target.value
                )
              }
              disabled={salvando}
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
            Indirizzo scolastico{' '}

            <span className="campo-opzionale">
              (opzionale)
            </span>

            <input
              type="text"
              value={indirizzoScolastico}
              onChange={(e) =>
                setIndirizzoScolastico(
                  e.target.value
                )
              }
              disabled={salvando}
            />
          </label>


          {errore && (
            <p className="registrazione-errore">
              {errore}
            </p>
          )}


          {messaggioSuccesso && (
            <p className="profilo-successo">
              {messaggioSuccesso}
            </p>
          )}


          <button
            type="submit"
            className="cta-button"
            disabled={salvando}
          >
            {salvando
              ? 'Salvataggio...'
              : 'Salva modifiche'}
          </button>

        </form>


        <hr className="profilo-separatore" />


        {/* =============================================
            CAMBIO PASSWORD
        ============================================= */}

        <h2 className="profilo-sottotitolo">
          Cambia password
        </h2>


        <form
          onSubmit={cambiaPassword}
          className="registrazione-form"
        >

          <label>
            Password attuale

            <CampoPassword
              value={passwordAttuale}
              onChange={(e) =>
                setPasswordAttuale(
                  e.target.value
                )
              }
              disabled={salvandoPassword}
            />
          </label>


          <label>
            Nuova password

            <CampoPassword
              value={passwordNuova}
              onChange={(e) =>
                setPasswordNuova(
                  e.target.value
                )
              }
              placeholder="Almeno 8 caratteri"
              disabled={salvandoPassword}
            />
          </label>


          {erroreDatoPassword && (
            <p className="registrazione-errore">
              {erroreDatoPassword}
            </p>
          )}


          {successoPassword && (
            <p className="profilo-successo">
              {successoPassword}
            </p>
          )}


          <button
            type="submit"
            className="cta-button"
            disabled={salvandoPassword}
          >
            {salvandoPassword
              ? 'Aggiornamento...'
              : 'Cambia password'}
          </button>

        </form>


        <hr className="profilo-separatore" />


        {/* =============================================
            ESCI DALL'ACCOUNT
        ============================================= */}

        <button
          type="button"
          className="profilo-esci-link"
          onClick={esciAccount}
        >
          Esci dall'account
        </button>


        {/* =============================================
            ELIMINA ACCOUNT
        ============================================= */}

        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '18px'
          }}
        >
          <button
            type="button"
            onClick={apriEliminaAccount}
            style={{
              background: '#D94F4F',
              color: '#FFFFFF',

              border: 'none',
              borderRadius: '12px',

              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.92rem',
              fontWeight: '700',

              padding: '12px 26px',

              cursor: 'pointer',

              textDecoration: 'none',

              boxShadow:
                '0 4px 12px rgba(217, 79, 79, 0.25)',

              transition:
                'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease'
            }}

            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                '#C83F3F';

              e.currentTarget.style.transform =
                'translateY(-1px)';

              e.currentTarget.style.boxShadow =
                '0 6px 16px rgba(217, 79, 79, 0.32)';
            }}

            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                '#D94F4F';

              e.currentTarget.style.transform =
                'translateY(0)';

              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(217, 79, 79, 0.25)';
            }}
          >
            Elimina account
          </button>
        </div>

      </div>


      {/* =============================================
          MODALE ELIMINAZIONE ACCOUNT
      ============================================= */}

      {mostraEliminaAccount && (
        <ModaleEliminaAccount
          password={passwordEliminazione}
          setPassword={setPasswordEliminazione}
          errore={erroreEliminazione}
          eliminando={eliminandoAccount}
          onConferma={eliminaAccount}
          onAnnulla={chiudiEliminaAccount}
        />
      )}

    </div>
  );
}

export default Profilo;