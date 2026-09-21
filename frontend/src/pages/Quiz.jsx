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
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Elettronica ed Elettrotecnica', descrizione: 'Utile se ti interessano anche i circuiti e l\'hardware, non solo il software.' },
  ],
  fisica_chimica: [
    { nome: 'Liceo Scientifico (tradizionale)', descrizione: 'Buon equilibrio tra teoria e laboratorio, ottima base per proseguire in ambito scientifico all\'università.' },
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Chimica, Materiali e Biotecnologie', descrizione: 'Tanto laboratorio pratico di chimica fin dal primo biennio.' },
    { nome: 'Liceo Scientifico - opzione Scienze Applicate', descrizione: 'Più laboratorio pratico, utile se ti piace sperimentare oltre alla teoria.' },
  ],
  astrofisica: [
    { nome: 'Liceo Scientifico (tradizionale)', descrizione: 'La base di fisica e matematica più solida per chi vuole poi studiare astrofisica all\'università.' },
    { nome: 'Liceo Scientifico - opzione Scienze Applicate', descrizione: 'Utile se ti piace anche la parte più pratica/informatica accanto alla fisica.' },
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Elettronica ed Elettrotecnica', descrizione: 'Utile se ti interessa anche la parte più tecnica/strumentale (telescopi, sensori).' },
  ],
  ingegneria: [
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Meccanica, Meccatronica ed Energia', descrizione: 'Molta pratica su meccanica e progettazione, utile anche per entrare subito nel mondo del lavoro.' },
    { nome: 'Liceo Scientifico (tradizionale)', descrizione: 'Base più teorica, adatta se punti a un\'università di ingegneria selettiva.' },
    { nome: 'Istituto Tecnico Tecnologico - indirizzo Costruzioni, Ambiente e Territorio', descrizione: 'Utile se ti interessa progettare edifici e infrastrutture più che macchine.' },
  ],
};

// Corsi di laurea consigliati per area, da mostrare a chi è alle SUPERIORI.
const UNIVERSITA_PER_AREA = {
  informatica: [
    { nome: 'Laurea in Informatica', descrizione: 'Programmazione, algoritmi, intelligenza artificiale, sviluppo software.' },
    { nome: 'Laurea in Ingegneria Informatica', descrizione: 'Come Informatica, ma con più basi ingegneristiche (elettronica, sistemi).' },
    { nome: 'Laurea in Ingegneria e Scienze Informatiche', descrizione: 'Un mix tra informatica e ingegneria, con basi più forti su sistemi, reti e sicurezza informatica.' },
  ],
  fisica_chimica: [
    { nome: 'Laurea in Fisica', descrizione: 'Studio dei fenomeni naturali, dalla scala subatomica all\'universo.' },
    { nome: 'Laurea in Chimica', descrizione: 'Struttura della materia, reazioni, nuovi materiali.' },
    { nome: 'Laurea in Scienza dei Materiali', descrizione: 'Studio e progettazione di nuovi materiali, al confine tra fisica, chimica e ingegneria.' },
  ],
  astrofisica: [
    { nome: 'Laurea in Astronomia/Astrofisica', descrizione: 'Studio di stelle, galassie, cosmologia (spesso un curriculum dentro Fisica).' },
    { nome: 'Laurea in Fisica - curriculum Astrofisico', descrizione: 'Base di fisica generale con specializzazione verso lo spazio.' },
    { nome: 'Laurea in Fisica - curriculum Astroparticellare e Cosmologia', descrizione: 'Per chi si interessa non solo alle stelle ma anche alle particelle e all\'origine dell\'universo.' },
  ],
  ingegneria: [
    { nome: 'Laurea in Ingegneria Aerospaziale', descrizione: 'Progettazione di aerei, satelliti, veicoli spaziali.' },
    { nome: 'Laurea in Ingegneria Meccanica', descrizione: 'Progettazione di macchine, motori, sistemi meccanici in generale.' },
    { nome: 'Laurea in Ingegneria Energetica', descrizione: 'Progettazione di impianti e sistemi per la produzione e gestione dell\'energia.' },
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
  {
    testo: 'Se potessi creare qualcosa di nuovo, cosa ti piacerebbe inventare?',
    opzioni: [
      { testo: 'Un\'app o un gioco per il telefono', area: 'informatica' },
      { testo: 'Un materiale con proprietà speciali', area: 'fisica_chimica' },
      { testo: 'Un modo per viaggiare più veloce nello spazio', area: 'astrofisica' },
      { testo: 'Un robot o una macchina che aiuta le persone', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale scienziata ti piacerebbe intervistare?',
    opzioni: [
      { testo: 'Un\'esperta di intelligenza artificiale', area: 'informatica' },
      { testo: 'Una scienziata che studia sostanze e reazioni', area: 'fisica_chimica' },
      { testo: 'Un\'astronauta o un\'astrofisica', area: 'astrofisica' },
      { testo: 'Un\'ingegnera che progetta macchine o edifici', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Cosa ti piacerebbe imparare a fare meglio quest\'anno?',
    opzioni: [
      { testo: 'Programmare o creare un sito', area: 'informatica' },
      { testo: 'Fare esperimenti con più precisione', area: 'fisica_chimica' },
      { testo: 'Riconoscere stelle e costellazioni', area: 'astrofisica' },
      { testo: 'Disegnare progetti tecnici o costruire modellini', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale museo ti piacerebbe visitare?',
    opzioni: [
      { testo: 'Un museo della scienza e della tecnologia digitale', area: 'informatica' },
      { testo: 'Un museo della chimica o della fisica', area: 'fisica_chimica' },
      { testo: 'Un planetario o un museo dell\'astronomia', area: 'astrofisica' },
      { testo: 'Un museo dei trasporti o delle macchine', area: 'ingegneria' },
    ],
  },
  {
    testo: 'In una gara di robotica scolastica, quale ruolo sceglieresti?',
    opzioni: [
      { testo: 'Programmare il robot', area: 'informatica' },
      { testo: 'Testare i materiali e i sensori', area: 'fisica_chimica' },
      { testo: 'Calcolare le traiettorie e i movimenti', area: 'astrofisica' },
      { testo: 'Costruire la struttura del robot', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale parola ti incuriosisce di più?',
    opzioni: [
      { testo: 'Algoritmo', area: 'informatica' },
      { testo: 'Molecola', area: 'fisica_chimica' },
      { testo: 'Galassia', area: 'astrofisica' },
      { testo: 'Meccanismo', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale attività extra-scolastica ti piacerebbe provare?',
    opzioni: [
      { testo: 'Un corso di coding o robotica', area: 'informatica' },
      { testo: 'Un laboratorio di scienze o chimica', area: 'fisica_chimica' },
      { testo: 'Una visita guidata al planetario', area: 'astrofisica' },
      { testo: 'Un corso di modellismo o falegnameria', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Se dovessi creare un fumetto, chi sarebbe la protagonista?',
    opzioni: [
      { testo: 'Una hacker che risolve misteri col computer', area: 'informatica' },
      { testo: 'Una scienziata che scopre pozioni ed elementi segreti', area: 'fisica_chimica' },
      { testo: 'Un\'esploratrice dello spazio', area: 'astrofisica' },
      { testo: 'Un\'inventrice che costruisce macchine straordinarie', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale domanda ti sei fatta più spesso ultimamente?',
    opzioni: [
      { testo: '"Come fa un\'app a capire cosa mi piace?"', area: 'informatica' },
      { testo: '"Di cosa sono fatte davvero le cose intorno a me?"', area: 'fisica_chimica' },
      { testo: '"Cosa c\'è oltre le stelle che vediamo?"', area: 'astrofisica' },
      { testo: '"Come si costruisce un ponte o una macchina?"', area: 'ingegneria' },
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
  {
    testo: 'Quale canale o rivista di divulgazione scientifica segui più volentieri?',
    opzioni: [
      { testo: 'Contenuti su programmazione, IA, tecnologia', area: 'informatica' },
      { testo: 'Contenuti su chimica, nuovi materiali, fisica sperimentale', area: 'fisica_chimica' },
      { testo: 'Contenuti su astronomia, missioni spaziali, cosmologia', area: 'astrofisica' },
      { testo: 'Contenuti su ingegneria, progettazione, invenzioni', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Se potessi fare un tirocinio estivo, dove ti piacerebbe andare?',
    opzioni: [
      { testo: 'In un\'azienda di sviluppo software', area: 'informatica' },
      { testo: 'In un laboratorio chimico o fisico di ricerca', area: 'fisica_chimica' },
      { testo: 'In un centro di ricerca spaziale o un osservatorio', area: 'astrofisica' },
      { testo: 'In uno studio di progettazione ingegneristica', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale competenza ti piacerebbe sviluppare per prima nella tua carriera?',
    opzioni: [
      { testo: 'Scrivere codice in modo efficiente', area: 'informatica' },
      { testo: 'Condurre esperimenti rigorosi', area: 'fisica_chimica' },
      { testo: 'Modellare fenomeni su grande scala', area: 'astrofisica' },
      { testo: 'Progettare e prototipare soluzioni concrete', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale scoperta scientifica recente ti ha colpito di più?',
    opzioni: [
      { testo: 'I progressi dell\'intelligenza artificiale', area: 'informatica' },
      { testo: 'Nuovi materiali o farmaci', area: 'fisica_chimica' },
      { testo: 'Nuove immagini dell\'universo (es. dai telescopi spaziali)', area: 'astrofisica' },
      { testo: 'Nuove tecnologie di trasporto o energia', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Se dovessi scegliere un libro di divulgazione scientifica, quale argomento preferiresti?',
    opzioni: [
      { testo: 'Come funzionano gli algoritmi e i computer', area: 'informatica' },
      { testo: 'La struttura della materia e le reazioni chimiche', area: 'fisica_chimica' },
      { testo: 'La storia dell\'universo e delle stelle', area: 'astrofisica' },
      { testo: 'Come si progettano macchine e strutture', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Pensando al tuo futuro lavoro, cosa ti motiva di più?',
    opzioni: [
      { testo: 'Creare strumenti digitali che le persone usano ogni giorno', area: 'informatica' },
      { testo: 'Fare ricerca per capire come funziona la materia', area: 'fisica_chimica' },
      { testo: 'Contribuire a capire meglio l\'universo', area: 'astrofisica' },
      { testo: 'Costruire soluzioni fisiche concrete a problemi reali', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Se potessi partecipare a una competizione scientifica, quale sceglieresti?',
    opzioni: [
      { testo: 'Un hackathon di programmazione', area: 'informatica' },
      { testo: 'Le Olimpiadi di Chimica', area: 'fisica_chimica' },
      { testo: 'Le Olimpiadi di Astronomia e Astrofisica', area: 'astrofisica' },
      { testo: 'Una competizione di robotica o ingegneria', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Quale strumento useresti più volentieri in un laboratorio?',
    opzioni: [
      { testo: 'Un computer per scrivere ed eseguire codice', area: 'informatica' },
      { testo: 'Provette e reagenti chimici', area: 'fisica_chimica' },
      { testo: 'Un telescopio', area: 'astrofisica' },
      { testo: 'Utensili per costruire un prototipo', area: 'ingegneria' },
    ],
  },
  {
    testo: 'Guardando avanti di 10 anni, in quale ambiente ti vedi lavorare?',
    opzioni: [
      { testo: 'In ufficio o da remoto, a sviluppare software', area: 'informatica' },
      { testo: 'In un laboratorio di ricerca chimico o fisico', area: 'fisica_chimica' },
      { testo: 'In un centro di ricerca spaziale o un osservatorio', area: 'astrofisica' },
      { testo: 'In un\'officina o uno stabilimento produttivo', area: 'ingegneria' },
    ],
  },
];

function Quiz() {
  const navigate = useNavigate();
  const [utente] = useState(() => getUtente());

  const DOMANDE = utente?.livello_scolastico === 'scuola_secondaria_primo_grado' ? DOMANDE_MEDIA : DOMANDE_SUPERIORE;

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

    const eScuolaMedia = utente.livello_scolastico === 'scuola_secondaria_primo_grado'
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
