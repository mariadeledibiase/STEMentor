import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUtente } from '../data/utenteCorrente.js';

// Quiz di orientamento (§3.2, area "Quiz di orientamento"). Ogni risposta
// assegna punti a una delle 4 aree STEM, corrispondenti ai 4 avatar --
// alla fine consigliamo con quale avatar approfondire in base al profilo
// di interessi che emerge. Le domande sono DIVERSE per scuola media e
// scuola superiore: linguaggio più semplice e concreto per le medie,
// più orientato a scelte di studio/carriera per le superiori.

const AREE = {
  informatica: { etichetta: 'Informatica e programmazione', avatarNome: 'Ada Lovelace', colore: '#7B6EF6' },
  fisica_chimica: { etichetta: 'Fisica e chimica', avatarNome: 'Marie Curie', colore: '#FF7A45' },
  astrofisica: { etichetta: 'Astrofisica e spazio', avatarNome: 'Margherita Hack', colore: '#4ECDC4' },
  ingegneria: { etichetta: 'Ingegneria e progettazione', avatarNome: 'Samantha Cristoforetti', colore: '#FFC24B' },
};

// Scuole superiori consigliate per area, da mostrare a chi è alle MEDIE --
// il quiz deve portare a un risultato concreto e attuabile, non restare
// sulle preferenze generiche.
const SCUOLE_SUPERIORI_PER_AREA = {
  informatica: [
    { nome: 'Liceo Scientifico - opzione Scienze Applicate', descrizione: 'Più laboratorio e informatica rispetto al liceo scientifico tradizionale, mantenendo una solida base scientifica.' },
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Informatica e Telecomunicazioni', descrizione: 'Molta pratica fin da subito: programmazione, reti, sistemi.' },
  ],
  fisica_chimica: [
    { nome: 'Liceo Scientifico (tradizionale)', descrizione: 'Buon equilibrio tra teoria e laboratorio, ottima base per proseguire in ambito scientifico all\'università.' },
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Chimica, Materiali e Biotecnologie', descrizione: 'Tanto laboratorio pratico di chimica fin dal primo biennio.' },
  ],
  astrofisica: [
    { nome: 'Liceo Scientifico (tradizionale)', descrizione: 'La base di fisica e matematica più solida per chi vuole poi studiare astrofisica all\'università.' },
    { nome: 'Liceo Scientifico - opzione Scienze Applicate', descrizione: 'Utile se ti piace anche la parte più pratica/informatica accanto alla fisica.' },
  ],
  ingegneria: [
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Meccanica, Meccatronica ed Energia', descrizione: 'Molta pratica su meccanica e progettazione, utile anche per entrare subito nel mondo del lavoro.' },
    { nome: 'Liceo Scientifico (tradizionale)', descrizione: 'Base più teorica, adatta se punti a un\'università di ingegneria selettiva.' },
  ],
};

// Corsi di laurea consigliati per area, da mostrare a chi è alle SUPERIORI.
const UNIVERSITA_PER_AREA = {
  informatica: [
    { nome: 'Laurea in Informatica', descrizione: 'Programmazione, algoritmi, intelligenza artificiale, sviluppo software.' },
    { nome: 'Laurea in Ingegneria Informatica', descrizione: 'Come Informatica, ma con più basi ingegneristiche (elettronica, sistemi).' },
  ],
  fisica_chimica: [
    { nome: 'Laurea in Fisica', descrizione: 'Studio dei fenomeni naturali, dalla scala subatomica all\'universo.' },
    { nome: 'Laurea in Chimica', descrizione: 'Struttura della materia, reazioni, nuovi materiali.' },
  ],
  astrofisica: [
    { nome: 'Laurea in Astronomia/Astrofisica', descrizione: 'Studio di stelle, galassie, cosmologia (spesso un curriculum dentro Fisica).' },
    { nome: 'Laurea in Fisica - curriculum Astrofisico', descrizione: 'Base di fisica generale con specializzazione verso lo spazio.' },
  ],
  ingegneria: [
    { nome: 'Laurea in Ingegneria Aerospaziale', descrizione: 'Progettazione di aerei, satelliti, veicoli spaziali.' },
    { nome: 'Laurea in Ingegneria Meccanica', descrizione: 'Progettazione di macchine, motori, sistemi meccanici in generale.' },
  ],
};

// --- Domande per la SCUOLA MEDIA (11-13 anni): linguaggio semplice,
//     esempi concreti e vicini alla vita quotidiana ---
const DOMANDE_MEDIA = [
  {
    testo: 'Nel tempo libero, cosa ti piace fare di più?',
    opzioni: [
      { testo: 'Giocare o creare qualcosa al computer', area: 'informatica' },
      { testo: 'Fare piccoli esperimenti, tipo miscugli o reazioni', area: 'fisica_chimica' },
      { testo: 'Guardare video sullo spazio o le stelle', area: 'astrofisica' },
      { testo: 'Costruire o smontare oggetti con le mani', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Qual è il tuo videogioco o cartone preferito?',
    opzioni: [
      { testo: 'Qualcosa con robot, hacker o mondi virtuali', area: 'informatica' },
      { testo: 'Qualcosa con pozioni, formule o superpoteri scientifici', area: 'fisica_chimica' },
      { testo: 'Qualcosa ambientato nello spazio', area: 'astrofisica' },
      { testo: 'Qualcosa con macchine, veicoli o costruzioni', area: 'ingegneria' },
    ],
  },
  {
    testo: 'A scuola, quale materia ti piace di più?',
    opzioni: [
      { testo: 'Matematica', area: 'informatica' },
      { testo: 'Scienze (chimica/biologia)', area: 'fisica_chimica' },
      { testo: 'Geografia astronomica o scienze della Terra', area: 'astrofisica' },
      { testo: 'Tecnologia', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Se potessi avere un superpotere "da scienziata", quale sceglieresti?',
    opzioni: [
      { testo: 'Capire all\'istante come funziona qualsiasi programma', area: 'informatica' },
      { testo: 'Vedere di cosa sono fatte le cose, a livello microscopico', area: 'fisica_chimica' },
      { testo: 'Viaggiare istantaneamente tra i pianeti', area: 'astrofisica' },
      { testo: 'Costruire qualsiasi macchina pensandola', area: 'ingegneria' },
    ],
  },
  {
    testo: 'In un lavoro di gruppo a scuola, cosa fai di solito?',
    opzioni: [
      { testo: 'Organizzo chi fa cosa, passo dopo passo', area: 'informatica' },
      { testo: 'Controllo che i conti/dati siano giusti', area: 'fisica_chimica' },
      { testo: 'Penso all\'idea generale del progetto', area: 'astrofisica' },
      { testo: 'Mi occupo di costruire/montare le cose', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale gita scolastica ti piacerebbe di più?',
    opzioni: [
      { testo: 'Visita a un\'azienda tech o un museo dell\'informatica', area: 'informatica' },
      { testo: 'Visita a un laboratorio scientifico', area: 'fisica_chimica' },
      { testo: 'Visita a un planetario o osservatorio', area: 'astrofisica' },
      { testo: 'Visita a una fabbrica o un museo dei trasporti', area: 'ingegneria' },
    ],
  },
];

// --- Domande per la SCUOLA SUPERIORE (14-19 anni): linguaggio più
//     maturo, più orientato a scelte concrete di studio/carriera ---
const DOMANDE_SUPERIORE = [
  {
    testo: 'Quale attività ti coinvolge di più nel tempo libero?',
    opzioni: [
      { testo: 'Programmare: un progetto personale, un sito, un\'app', area: 'informatica' },
      { testo: 'Fare esperimenti o approfondire chimica/fisica per conto tuo', area: 'fisica_chimica' },
      { testo: 'Leggere/guardare contenuti di divulgazione su spazio e cosmo', area: 'astrofisica' },
      { testo: 'Progettare, costruire o riparare oggetti e meccanismi', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Di fronte a un problema complesso, il tuo approccio naturale è...',
    opzioni: [
      { testo: 'Scomporlo in passaggi logici, come un algoritmo', area: 'informatica' },
      { testo: 'Analizzare i dati e verificare le ipotesi con esperimenti', area: 'fisica_chimica' },
      { testo: 'Inquadrarlo in un contesto più ampio, su grande scala', area: 'astrofisica' },
      { testo: 'Progettare una soluzione fisica e concreta', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale materia scolastica ti dà più soddisfazione?',
    opzioni: [
      { testo: 'Matematica e informatica', area: 'informatica' },
      { testo: 'Chimica', area: 'fisica_chimica' },
      { testo: 'Fisica, specialmente astronomia/cosmologia', area: 'astrofisica' },
      { testo: 'Disegno tecnico o le materie di indirizzo tecnico', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale ambito ti incuriosisce di più per il tuo futuro?',
    opzioni: [
      { testo: 'Intelligenza artificiale, sviluppo software, cybersecurity', area: 'informatica' },
      { testo: 'Ricerca scientifica, materiali, nuove tecnologie chimiche', area: 'fisica_chimica' },
      { testo: 'Esplorazione spaziale, astrofisica, cosmologia', area: 'astrofisica' },
      { testo: 'Progettazione di veicoli, strutture o sistemi meccanici', area: 'ingegneria' },
    ],
  },
  {
    testo: 'In un progetto di gruppo, quale ruolo ti viene naturale?',
    opzioni: [
      { testo: 'Definire la logica e l\'organizzazione del lavoro', area: 'informatica' },
      { testo: 'Analizzare dati e verificare che i risultati siano solidi', area: 'fisica_chimica' },
      { testo: 'Avere la visione d\'insieme e il perché del progetto', area: 'astrofisica' },
      { testo: 'Occuparti della parte pratica/realizzativa', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Se dovessi scegliere un\'esperienza (stage, open day, visita), preferiresti...',
    opzioni: [
      { testo: 'Un\'azienda tech o una software house', area: 'informatica' },
      { testo: 'Un laboratorio di ricerca universitario', area: 'fisica_chimica' },
      { testo: 'Un centro di ricerca aerospaziale o un osservatorio', area: 'astrofisica' },
      { testo: 'Un\'azienda di ingegneria/manifattura', area: 'ingegneria' },
    ],
  },
];

function Quiz() {
  const navigate = useNavigate();
  const [utente] = useState(() => getUtente());

  const DOMANDE = utente?.livello_scolastico === 'scuola_media' ? DOMANDE_MEDIA : DOMANDE_SUPERIORE;

  const [indiceDomanda, setIndiceDomanda] = useState(0);
  const [punteggi, setPunteggi] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [risultatoSalvato, setRisultatoSalvato] = useState(false);
  const [avatarPerArea, setAvatarPerArea] = useState({});

  const domandaCorrente = DOMANDE[indiceDomanda];
  const quizFinito = indiceDomanda >= DOMANDE.length;

  const scegliOpzione = (area) => {
    setPunteggi((prev) => ({ ...prev, [area]: (prev[area] || 0) + 1 }));
    setIndiceDomanda((prev) => prev + 1);
  };

  const salvaRisultato = async () => {
    if (!utente || salvando || risultatoSalvato) return;
    setSalvando(true);

    try {
      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: utente.id, profilo_interessi: punteggi }),
      });

      const listaAvatar = await fetch('/api/avatars').then((r) => r.json());
      const mappa = {};
      listaAvatar.forEach((a) => {
        mappa[a.nome] = a.id;
      });
      setAvatarPerArea(mappa);

      setRisultatoSalvato(true);
    } catch (err) {
      console.error('Errore nel salvataggio del quiz:', err);
      setRisultatoSalvato(true);
    } finally {
      setSalvando(false);
    }
  };

  if (quizFinito && !risultatoSalvato && !salvando) {
    salvaRisultato();
  }

  const riparti = () => {
    setIndiceDomanda(0);
    setPunteggi({});
    setRisultatoSalvato(false);
  };

  if (!utente) {
    return (
      <div className="chat-page">
        <div className="chat-blocco-registrazione">
          <h1>Crea prima il tuo profilo</h1>
          <p>Per salvare i risultati del quiz e collegarli al tuo profilo, registrati prima.</p>
          <button
            className="cta-button"
            onClick={() => navigate('/registrati', { state: { da: '/quiz' } })}
          >
            Crea il tuo profilo
          </button>
        </div>
      </div>
    );
  }

  if (quizFinito) {
    const areeOrdinate = Object.entries(punteggi).sort((a, b) => b[1] - a[1]);
    const areaMigliore = areeOrdinate[0]?.[0];
    const infoAreaMigliore = areaMigliore ? AREE[areaMigliore] : null;

    const eScuolaMedia = utente.livello_scolastico === 'scuola_media';
    const percorsiConsigliati = areaMigliore
      ? (eScuolaMedia ? SCUOLE_SUPERIORI_PER_AREA : UNIVERSITA_PER_AREA)[areaMigliore]
      : [];

    return (
      <div className="quiz-page quiz-page-results">
        <div className="quiz-results-hero">
          <span className="eyebrow">IL TUO PROFILO STEM</span>
          <h1>I tuoi risultati</h1>
          <p className="section-subtitle">
            Non è un'etichetta: è un punto di partenza per esplorare ciò che ti incuriosisce.
          </p>
        </div>

        <div className="quiz-risultati-lista">
          {areeOrdinate.map(([area, punti]) => (
            <div key={area} className="quiz-risultato-riga">
              <span className="quiz-risultato-etichetta">{AREE[area].etichetta}</span>
              <div className="quiz-risultato-barra-sfondo">
                <div
                  className="quiz-risultato-barra"
                  style={{
                    width: ((punti / DOMANDE.length) * 100) + '%',
                    backgroundColor: AREE[area].colore,
                  }}
                />
              </div>
              <span className="quiz-risultato-punti">{punti}/{DOMANDE.length}</span>
            </div>
          ))}
        </div>

        {percorsiConsigliati.length > 0 && (
          <div className="quiz-percorsi">
            <h2>{eScuolaMedia ? 'Scuole superiori che potrebbero fare per te' : 'Corsi di laurea che potrebbero fare per te'}</h2>
            <div className="quiz-percorsi-lista">
              {percorsiConsigliati.map((percorso, i) => (
                <div key={i} className="quiz-percorso-card" style={{ borderColor: infoAreaMigliore.colore }}>
                  <h3>{percorso.nome}</h3>
                  <p>{percorso.descrizione}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {infoAreaMigliore && (
          <div className="quiz-consiglio" style={{ borderColor: infoAreaMigliore.colore }}>
            <p>
              Il tuo profilo sembra più vicino a <strong>{infoAreaMigliore.etichetta}</strong>.
              Ti va di parlarne con {infoAreaMigliore.avatarNome.split(' ')[0]}?
            </p>
            {avatarPerArea[infoAreaMigliore.avatarNome] && (
              <button
                className="cta-button"
                onClick={() => navigate('/chat/' + avatarPerArea[infoAreaMigliore.avatarNome])}
              >
                Parla con {infoAreaMigliore.avatarNome.split(' ')[0]}
              </button>
            )}
          </div>
        )}

        <button className="quiz-riparti-link" onClick={riparti}>
          Rifai il quiz
        </button>
      </div>
    );
  }

  const avanzamento = ((indiceDomanda + 1) / DOMANDE.length) * 100;

  return (
    <div className="quiz-page quiz-page-question">
      <div className="quiz-shell">
        <div className="quiz-topline">
          <span>Quiz di orientamento</span>
          <strong>{indiceDomanda + 1}/{DOMANDE.length}</strong>
        </div>

        <div className="quiz-progress-track" aria-hidden="true">
          <div className="quiz-progress-value" style={{ width: avanzamento + '%' }} />
        </div>

        <div className="quiz-question-block">
          <span className="eyebrow">SEGUI LA TUA CURIOSITÀ</span>
          <h1 className="quiz-domanda">{domandaCorrente.testo}</h1>
          <p className="quiz-helper">
            Non ci sono risposte giuste o sbagliate. Scegli quella che ti somiglia di più.
          </p>
        </div>

        <div className="quiz-opzioni">
          {domandaCorrente.opzioni.map((opzione, i) => (
            <button
              key={i}
              className={'quiz-opzione quiz-opzione-' + (i + 1)}
              onClick={() => scegliOpzione(opzione.area)}
            >
              <span className="quiz-option-index">{String.fromCharCode(65 + i)}</span>
              <span>{opzione.testo}</span>
              <span className="quiz-option-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Quiz;

