import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TalkingAvatar from '../components/TalkingAvatar.jsx';
import { getUtente } from '../data/utenteCorrente.js';
import { AVATAR_VISEMI } from '../data/avatarVisemes.js';
import '../avatar/figura-intera.css';

const COLORI_AVATAR = {
  'Ada Lovelace': '#8C82E8',
  'Marie Curie': '#F49A86',
  'Margherita Hack': '#71C9C2',
  'Samantha Cristoforetti': '#E7B85B'
};

// Versione più scura, solo per il testo (contrasto >= 4.5:1 su bianco)
const COLORI_TESTO_AVATAR = {
  'Ada Lovelace': '#5b4fc4',
  'Marie Curie': '#a84c33',
  'Margherita Hack': '#1f7a72',
  'Samantha Cristoforetti': '#8a6a1f'
};

// Gemini a volte scrive in Markdown (es. **parola**).
// Questa funzione rende il testo tra ** ** in grassetto.
function renderTestoConGrassetto(testo) {
  const parti = testo.split(/(\*\*[^*]+\*\*)/g);

  return parti.map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>;
    }

    return parte;
  });
}


// ======================================================
// MODALE DI CONFERMA ELIMINAZIONE
// ======================================================

function ModaleConferma({
  nomeBreve,
  colore,
  onConferma,
  onAnnulla
}) {
  return (
    <div
      className="sm-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onAnnulla}
    >
      <div
        className="sm-riquadro"
        style={{ '--sm-colore': colore }}
        onClick={(e) => e.stopPropagation()}
      >

        <h3>Eliminare questa conversazione?</h3>

        <p>
          Perderai per sempre tutti i messaggi scambiati con{' '}
          <strong>{nomeBreve}</strong>.
          <br />
          Questa azione non può essere annullata.
        </p>

        <div className="sm-azioni">

          <button
            type="button"
            className="sm-annulla"
            onClick={onAnnulla}
          >
            Annulla
          </button>

          <button
            type="button"
            className="sm-elimina"
            onClick={onConferma}
          >
            Elimina
          </button>

        </div>

      </div>


      <style>{`

        /* =========================
           SFONDO DELLA MODALE
        ========================= */

        .sm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;

          background: rgba(35, 28, 32, 0.52);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 24px;

          animation: sm-comparsa 0.15s ease-out;
        }


        /* =========================
           RIQUADRO BIANCO
        ========================= */

        .sm-riquadro {
          width: 100%;
          max-width: 380px;

          background: #FFFFFF;

          border-radius: 20px;

          padding: 30px 28px 28px;

          border: 1px solid #E8E1DB;
          border-top: 5px solid var(--sm-colore, #8C82E8);

          box-shadow:
            0 20px 55px rgba(35, 28, 32, 0.28),
            0 3px 10px rgba(35, 28, 32, 0.10);

          animation: sm-salita 0.18s ease-out;
        }


        /* =========================
           TITOLO
        ========================= */

        .sm-riquadro h3 {
          font-family: 'Fraunces', serif;

          font-size: 1.35rem;
          font-weight: 700;

          line-height: 1.25;

          margin: 0 0 13px;

          color: #241E1B;
        }


        /* =========================
           TESTO
        ========================= */

        .sm-riquadro p {
          font-family: 'DM Sans', sans-serif;

          font-size: 0.95rem;
          font-weight: 400;

          line-height: 1.55;

          color: #514640;

          margin: 0 0 25px;
        }

        .sm-riquadro p strong {
          color: #2B2320;
          font-weight: 700;
        }


        /* =========================
           PULSANTI
        ========================= */

        .sm-azioni {
          display: flex;
          gap: 11px;
          justify-content: flex-end;
        }


        .sm-annulla,
        .sm-elimina {
          font-family: 'DM Sans', sans-serif;

          font-size: 0.92rem;
          font-weight: 700;

          padding: 11px 21px;

          border-radius: 999px;

          cursor: pointer;

          opacity: 1;

          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            transform 0.15s ease;
        }


        /* ANNULLA */

        .sm-annulla {
          background: #F4F0EC;

          color: #403732;

          border: 1px solid #D9D0C9;
        }

        .sm-annulla:hover {
          background: #EAE3DD;

          border-color: #CFC4BC;

          transform: translateY(-1px);
        }


        /* ELIMINA */

        .sm-elimina {
          background: #D94F4F;

          color: #FFFFFF;

          border: 1px solid #D94F4F;

          box-shadow: 0 4px 13px rgba(217, 79, 79, 0.30);
        }

        .sm-elimina:hover {
          background: #C83F3F;

          border-color: #C83F3F;

          transform: translateY(-1px);

          box-shadow: 0 6px 17px rgba(217, 79, 79, 0.38);
        }

        .sm-elimina:active,
        .sm-annulla:active {
          transform: translateY(0);
        }


        /* =========================
           ANIMAZIONI
        ========================= */

        @keyframes sm-comparsa {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes sm-salita {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }


        @media (prefers-reduced-motion: reduce) {
          .sm-overlay,
          .sm-riquadro {
            animation: none;
          }
        }

      `}</style>

    </div>
  );
}


// ======================================================
// CHAT
// ======================================================

function Chat() {

  const { avatarId } = useParams();

  const navigate = useNavigate();

  const avatarRef = useRef(null);
  const fineMessaggiRef = useRef(null);

  const [utente] = useState(() => getUtente());

  const [avatar, setAvatar] = useState(null);

  const [messaggi, setMessaggi] = useState([]);

  const [testoInput, setTestoInput] = useState('');

  const [inviando, setInviando] = useState(false);

  const [conversationId, setConversationId] = useState(null);

  const [avatarStaParlando, setAvatarStaParlando] = useState(false);

  const [caricandoCronologia, setCaricandoCronologia] = useState(true);

  const [mostraConferma, setMostraConferma] = useState(false);


  // Recupero avatar
  useEffect(() => {

    fetch('/api/avatars')

      .then(r => r.json())

      .then(lista => {

        setAvatar(
          lista.find(
            a => String(a.id) === String(avatarId)
          ) || null
        );

      })

      .catch(console.error);

  }, [avatarId]);


  // Recupero conversazione esistente
  useEffect(() => {

    if (!utente) {

      setCaricandoCronologia(false);

      return;
    }


    fetch(
      `/api/chat/esistente/${utente.id}/${avatarId}`
    )

      .then(r => r.json())

      .then(d => {

        if (d.conversation_id) {

          setConversationId(d.conversation_id);

          setMessaggi(
            d.messaggi.map(m => ({
              mittente: m.mittente,
              contenuto: m.contenuto
            }))
          );

        }

      })

      .catch(console.error)

      .finally(() => {

        setCaricandoCronologia(false);

      });

  }, [utente, avatarId]);


  // Scroll automatico
  useEffect(() => {

    fineMessaggiRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messaggi]);


  // Ferma la voce quando si esce dalla pagina
  useEffect(() => {

    return () => avatarRef.current?.ferma?.();

  }, []);


  // ======================================================
  // INVIO MESSAGGIO
  // ======================================================

  const inviaMessaggio = async (e) => {

    e.preventDefault();

    const testo = testoInput.trim();

    if (!testo || inviando || !utente) return;


    avatarRef.current?.ferma?.();

    // Dentro il gesto dell'utente (invio del form): sblocca l'audio del
    // browser per la risposta che arrivera' piu' tardi, e mostra la posa
    // "sta pensando" finche' LLM e voce non sono pronti.
    avatarRef.current?.prepara?.();
    avatarRef.current?.pensa?.();


    setMessaggi(p => [
      ...p,
      {
        mittente: 'utente',
        contenuto: testo
      }
    ]);


    setTestoInput('');

    setInviando(true);


    try {

      const risposta = await fetch('/api/chat', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          user_id: utente.id,

          avatar_id: Number(avatarId),

          messaggio: testo,

          conversation_id: conversationId

        })

      });


      const dati = await risposta.json();


      if (!risposta.ok) {

        throw new Error(
          dati.errore || 'Errore sconosciuto'
        );

      }


      setConversationId(
        dati.conversation_id
      );


      setMessaggi(p => [
        ...p,
        {
          mittente: 'avatar',
          contenuto: dati.risposta
        }
      ]);


      avatarRef.current?.parla(
        dati.risposta
      );


    } catch (err) {

      console.error(err);

      // La risposta non e' arrivata: l'avatar torna a riposo
      avatarRef.current?.ferma?.();


      setMessaggi(p => [
        ...p,
        {
          mittente: 'avatar',
          contenuto:
            "Mi dispiace, c'è stato un problema. Riprova tra poco."
        }
      ]);


    } finally {

      setInviando(false);

    }

  };


  // ======================================================
  // ELIMINA CONVERSAZIONE
  // ======================================================

  const eliminaConversazione = async () => {

    if (!conversationId || !utente) return;


    avatarRef.current?.ferma?.();


    try {

      const risposta = await fetch(
        `/api/chat/${conversationId}?user_id=${utente.id}`,
        {
          method: 'DELETE'
        }
      );


      if (!risposta.ok) {

        const testoErrore =
          await risposta.text();

        console.error(
          'Risposta del server:',
          testoErrore
        );

        throw new Error(
          `Errore HTTP ${risposta.status}`
        );

      }


      setMessaggi([]);

      setConversationId(null);


    } catch (err) {

      console.error(
        "Errore nell'eliminazione della conversazione:",
        err
      );


    } finally {

      setMostraConferma(false);

    }

  };


  // ======================================================
  // UTENTE NON REGISTRATO
  // ======================================================

  if (!utente) {

    return (

      <div className="simple-state">

        <h1>Crea prima il tuo profilo</h1>

        <p>
          Così possiamo personalizzare le risposte per te.
        </p>

        <button
          className="button-primary"
          onClick={() =>
            navigate(
              '/registrati',
              {
                state: {
                  da: `/chat/${avatarId}`
                }
              }
            )
          }
        >
          Crea il tuo profilo
        </button>

      </div>

    );

  }


  if (!avatar || caricandoCronologia) {

    return (

      <div className="simple-state">
        <p>Caricamento...</p>
      </div>

    );

  }


  const colore =
    COLORI_AVATAR[avatar.nome] ||
    '#8C82E8';

  const coloreTesto =
        COLORI_TESTO_AVATAR[avatar.nome] ||
        '#5b4fc4';


  const nomeBreve =
    avatar.nome.split(' ')[0];


  // Figura intera: visibile solo finche' la conversazione e' vuota
  // (all'apertura della chat e dopo l'eliminazione), poi sfuma via.
  const figuraIntera =
    AVATAR_VISEMI[avatar.nome]?.figuraIntera;

  const mostraFiguraIntera =
    Boolean(figuraIntera) && messaggi.length === 0;


  // ======================================================
  // INTERFACCIA
  // ======================================================

  return (

    <div
      className="chat-page-large"
      style={{
        '--avatar-color': colore
      }}
    >

      <Link
        to="/avatar"
        className="chat-back-link"
      >
        ← Tutte le mentor
      </Link>


      <div className="chat-layout">


        {/* ======================
            AVATAR
        ====================== */}

        <aside className="chat-avatar-panel">


          <div className="chat-avatar-title">

            <span className="eyebrow">
              LA TUA MENTOR
            </span>

            <h1>
              {avatar.nome}
            </h1>

            <p style={{ color: coloreTesto }}>
              {avatar.disciplina}
            </p>

          </div>


          <div className="chat-avatar-stage chat-avatar-stage--figura">

            <TalkingAvatar
              nome={avatar.nome}
              variant="chat"
              width="100%"
              height={540}
              ref={avatarRef}
              onStateChange={setAvatarStaParlando}
            />

            {figuraIntera && (
              <img
                src={figuraIntera}
                alt={
                  mostraFiguraIntera
                    ? `${avatar.nome}, a figura intera`
                    : ''
                }
                aria-hidden={!mostraFiguraIntera}
                className={
                  `chat-figura-intera ${
                    mostraFiguraIntera
                      ? 'chat-figura-intera--visibile'
                      : ''
                  }`
                }
              />
            )}

          </div>


          <div className="chat-avatar-ready">

            <span className="chat-avatar-ready-dot" />

            <div>

              <strong>
                {avatarStaParlando
                  ? `${nomeBreve} sta parlando`
                  : `Parla con ${nomeBreve}`}
              </strong>

              <small>
                {avatarStaParlando
                  ? 'Ascolta la sua risposta'
                  : 'Falle una domanda quando vuoi'}
              </small>

            </div>

          </div>


          {avatarStaParlando && (

            <button
              type="button"
              className="chat-stop-button"
              onClick={() =>
                avatarRef.current?.ferma()
              }
            >
              Interrompi voce
            </button>

          )}

{conversationId && (
  <div
    style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '6px'
    }}
  >
    <button
      type="button"
      onClick={() => setMostraConferma(true)}
      style={{
        background: 'none',
        border: 'none',
        color: '#D94F4F',
        fontSize: '0.85rem',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: '600',
        textDecoration: 'underline',
        cursor: 'pointer',
        padding: '6px 10px',
        margin: '0'
      }}
    >
      Elimina questa conversazione
    </button>
  </div>
)}

        </aside>


        {/* ======================
            CONVERSAZIONE
        ====================== */}

        <section className="chat-conversation-panel">


          <header className="chat-conversation-header">

            <span className="eyebrow">
              CONVERSAZIONE
            </span>

            <h2>
              Chiedi quello che vuoi
            </h2>

            <p>
              Nessuna domanda è troppo semplice.
            </p>

          </header>


          <div className="chat-messages">


            {messaggi.length === 0 && (

              <div className="chat-empty">

                <h3>
                  Da dove vuoi iniziare?
                </h3>

                <p>
                  Puoi chiederle della sua storia,
                  degli studi o del suo lavoro.
                </p>

              </div>

            )}


            {messaggi.map((m, i) => (

              <div
                key={i}
                className={
                  `chat-bubble ${
                    m.mittente === 'utente'
                      ? 'chat-bubble-utente'
                      : 'chat-bubble-avatar'
                  }`
                }
              >
                {renderTestoConGrassetto(
                  m.contenuto
                )}
              </div>

            ))}


            {inviando && (

              <div className="chat-bubble chat-bubble-avatar">

                <em>
                  {nomeBreve} sta pensando...
                </em>

              </div>

            )}


            <div ref={fineMessaggiRef} />

          </div>


          <form
            className="chat-input-bar"
            onSubmit={inviaMessaggio}
          >

            <input
              type="text"
              value={testoInput}
              onChange={e =>
                setTestoInput(
                  e.target.value
                )
              }
              placeholder={
                `Scrivi a ${nomeBreve}...`
              }
              disabled={inviando}
            />


            <button
              type="submit"
              className="button-primary"
              disabled={
                inviando ||
                !testoInput.trim()
              }
            >
              Invia
            </button>

          </form>


        </section>

      </div>


      {/* ======================
          MODALE ELIMINAZIONE
      ====================== */}

      {mostraConferma && (

        <ModaleConferma

          nomeBreve={nomeBreve}

          colore={colore}

          onConferma={
            eliminaConversazione
          }

          onAnnulla={() =>
            setMostraConferma(false)
          }

        />

      )}

    </div>

  );

}

export default Chat;