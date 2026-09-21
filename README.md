# STEMentor

**STEMentor** è un prototipo web sviluppato nell'ambito di una tesi di
laurea presso l'Università di Camerino.\
La piattaforma è pensata per supportare l'orientamento delle studentesse
nelle discipline STEM (*Science, Technology, Engineering and
Mathematics*) attraverso mentor conversazionali basate su quattro figure
femminili della scienza:

-   **Ada Lovelace** --- Informatica e matematica
-   **Marie Curie** --- Fisica e chimica
-   **Margherita Hack** --- Astrofisica
-   **Samantha Cristoforetti** --- Ingegneria aerospaziale

Il progetto integra orientamento, intelligenza artificiale generativa,
sintesi vocale, quiz, percorsi formativi e gestione del profilo in
un'unica applicazione web.

> **Nota:** STEMentor è un prototipo accademico e non un servizio di
> orientamento professionale o un prodotto destinato alla distribuzione
> in produzione.

------------------------------------------------------------------------

## Funzionalità principali

### Registrazione e autenticazione

La piattaforma permette di:

-   creare un profilo con nome, email, password, età e livello
    scolastico;
-   scegliere tra:
    -   **Scuola Secondaria di primo grado**;
    -   **Scuola Secondaria di secondo grado**;
-   indicare facoltativamente l'indirizzo scolastico;
-   accedere con email e password;
-   modificare i dati del profilo;
-   cambiare password;
-   recuperare e reimpostare la password;
-   uscire dall'account;
-   eliminare definitivamente l'account e i dati collegati.

Le password non vengono memorizzate in chiaro: il backend utilizza
`scrypt` con salt casuale tramite il modulo `crypto` di Node.js.

### Tutela degli utenti sotto i 14 anni

Se durante la registrazione viene dichiarata un'età inferiore a 14 anni,
il frontend mostra automaticamente una casella aggiuntiva per il
consenso di un genitore o tutore.

La verifica è presente anche lato backend: una registrazione under-14
senza consenso genitoriale viene rifiutata.

### Galleria delle mentor

La sezione **Mentor** presenta le quattro mentor con:

-   immagine;
-   area disciplinare;
-   breve biografia;
-   pulsante **Ascolta la voce**;
-   pulsante per aprire la Chat.

### Chat conversazionale con IA

Ogni mentor dispone di una Chat dedicata.

Il backend:

1.  identifica l'utente e la mentor;
2.  recupera o crea la conversazione;
3.  carica lo storico dei messaggi;
4.  costruisce il prompt appropriato;
5.  invia la conversazione a **Google Gemini**;
6.  salva la risposta nel database;
7.  restituisce la risposta al frontend.

Lo storico consente alla mentor di proseguire la conversazione senza
ripartire da zero a ogni messaggio.

Il sistema differenzia il registro della conversazione in base al
livello scolastico dell'utente e orienta progressivamente il dialogo
verso un suggerimento coerente con gli interessi emersi.

È inoltre possibile eliminare una conversazione salvata.

### Sintesi vocale e animazione degli Avatar

Le risposte delle mentor possono essere riprodotte vocalmente tramite
**Azure AI Speech**.

Sono configurati profili vocali differenti per le quattro mentor,
utilizzando voci neurali italiane e variazioni di velocità e
intonazione.

La sintesi viene generata lato backend tramite SSML. Il sistema:

-   protegge la chiave Azure, che non viene mai inviata al browser;
-   applica correzioni fonetiche ai nomi;
-   restituisce audio MP3;
-   riceve da Azure gli eventi dei **visemi**;
-   utilizza i visemi nel frontend per animare l'Avatar durante il
    parlato.

La rotta TTS applica inoltre limiti sulla lunghezza del testo e sul
numero di richieste per ridurre il consumo della quota del servizio.

### Quiz di orientamento

Il Quiz contiene **15 domande**.

Ogni risposta contribuisce a una delle quattro aree:

-   Informatica e programmazione;
-   Fisica e chimica;
-   Astrofisica e spazio;
-   Ingegneria e progettazione.

Al termine vengono mostrati:

-   i punteggi delle quattro aree;
-   l'area maggiormente affine;
-   percorsi di studio coerenti;
-   la mentor associata al profilo;
-   un collegamento diretto alla Chat;
-   la possibilità di rifare il Quiz.

Il risultato viene inoltre salvato nel database.

### Percorsi

La sezione **Percorsi** permette di esplorare:

-   scuole;
-   università;
-   percorsi di carriera STEM.

I contenuti sono memorizzati nella tabella `mappe_contenuti` e possono
includere:

-   tipo di istituto;
-   indirizzo;
-   nome;
-   descrizione;
-   regione;
-   provincia;
-   collegamento esterno;
-   sbocchi professionali.

I filtri disponibili vengono ricavati dai dati effettivamente presenti
nel database.

Il dataset incluso nel prototipo è dimostrativo e non rappresenta un
catalogo completo dell'offerta formativa italiana.

### Profilo utente

Dalla pagina Profilo è possibile:

-   modificare nome;
-   modificare età;
-   modificare livello scolastico;
-   modificare indirizzo scolastico;
-   cambiare password;
-   uscire dall'account;
-   eliminare definitivamente l'account.

L'eliminazione rimuove anche i dati collegati, tra cui conversazioni,
messaggi, risultati del Quiz e token di recupero password.

------------------------------------------------------------------------

## Stack tecnologico

  Componente           Tecnologia
  -------------------- ------------------------------
  Frontend             React 18
  Routing              React Router DOM
  Build/dev server     Vite
  Backend              Node.js + Express
  Database             SQLite tramite `node:sqlite`
  IA conversazionale   Google Gemini API
  Sintesi vocale       Azure AI Speech SDK
  Animazione vocale    Visemi Azure + frame Avatar
  Password             `crypto.scrypt`
  Test API             Node Test Runner + Supertest
  Test E2E             Playwright
  Accessibilità        axe-core + Playwright

------------------------------------------------------------------------

## Requisiti

Per eseguire il progetto sono necessari:

-   **Node.js \>= 22.13.0**;
-   npm;
-   una chiave API di **Google Gemini**;
-   per la sintesi vocale, una risorsa **Azure AI Speech** con chiave e
    regione;
-   Microsoft Edge per l'attuale configurazione dei test Playwright.

Per controllare Node.js:

``` bash
node -v
```

------------------------------------------------------------------------

## Struttura del progetto

``` text
stementor/
├── backend/
│   ├── db/
│   │   ├── database.js
│   │   ├── schema.sql
│   │   ├── setup.js
│   │   ├── seed.js
│   │   ├── seedMappe.js
│   │   ├── migrateAuth.js
│   │   ├── migratePasswordReset.js
│   │   ├── migrateMappe.js
│   │   └── stementor.sqlite
│   ├── middleware/
│   │   └── limitaRichieste.js
│   ├── routes/
│   │   ├── users.js
│   │   ├── avatars.js
│   │   ├── chat.js
│   │   ├── quiz.js
│   │   ├── maps.js
│   │   └── tts.js
│   ├── scripts/
│   │   ├── valutazioneAvatar.js
│   │   └── report-valutazione-avatar.md
│   ├── tests/
│   │   ├── api.test.js
│   │   └── setup.js
│   ├── pronuncia.js
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── immagini/
│   ├── src/
│   │   ├── avatar/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── e2e/
│   ├── tests/
│   │   ├── accessibilita-responsive.spec.js
│   │   └── registrazione.spec.js
│   ├── playwright.config.js
│   └── package.json
│
└── README.md
```

------------------------------------------------------------------------

## Configurazione delle variabili d'ambiente

Nel backend è presente:

``` text
backend/.env.example
```

Creare una copia chiamata `.env`.

### Windows PowerShell

``` powershell
cd backend
Copy-Item .env.example .env
```

### Windows CMD

``` cmd
cd backend
copy .env.example .env
```

### macOS/Linux

``` bash
cd backend
cp .env.example .env
```

Configurare quindi:

``` env
PORT=3001

AI_API_KEY=inserisci_qui_la_tua_chiave_gemini

DB_PATH=./db/stementor.sqlite

AZURE_SPEECH_KEY=inserisci_qui_la_tua_chiave_azure_speech
AZURE_SPEECH_REGION=inserisci_qui_la_regione
```

### Google Gemini

`AI_API_KEY` viene utilizzata dal backend per generare le risposte delle
mentor.

La versione corrente del codice utilizza il modello configurato in
`backend/routes/chat.js`.

La chiave deve rimanere esclusivamente nel backend e non deve essere
inserita nel codice React.

### Azure AI Speech

Per utilizzare voce e visemi servono:

``` env
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=...
```

Se queste variabili non sono configurate, le funzionalità che dipendono
dalla sintesi Azure non possono essere eseguite correttamente.

> **Sicurezza:** non pubblicare mai `.env`, chiavi API o credenziali. Il
> file `.gitignore` del progetto esclude già `.env`, `*.sqlite`,
> `node_modules/` e `.idea/`. Se il progetto viene condiviso tramite
> ZIP, verificare manualmente che `.env` sia stato rimosso
> dall'archivio.

------------------------------------------------------------------------

## Installazione

Il progetto è suddiviso in backend, frontend e suite E2E. Le dipendenze
vanno installate nelle rispettive cartelle.

### 1. Backend

``` bash
cd backend
npm install
```

### 2. Frontend

Da un altro terminale:

``` bash
cd frontend
npm install
```

### 3. Test E2E

``` bash
cd e2e
npm install
```

------------------------------------------------------------------------

## Avvio del progetto

Servono normalmente due terminali.

### Terminale 1 --- Backend

``` bash
cd backend
npm run dev
```

Il backend sarà disponibile sulla porta:

``` text
3001
```

Prima dell'avvio viene eseguito automaticamente `db/setup.js`.

In alternativa:

``` bash
npm start
```

### Terminale 2 --- Frontend

``` bash
cd frontend
npm run dev
```

Il frontend Vite viene avviato sulla porta:

``` text
5173
```

Aprire quindi nel browser:

``` text
http://localhost:5173
```

Il frontend effettua le richieste utilizzando `/api/...`; il proxy
configurato in `frontend/vite.config.js` le inoltra automaticamente a:

``` text
http://localhost:3001
```

------------------------------------------------------------------------

## Setup automatico del database

Il backend utilizza SQLite.

All'avvio, gli script `predev` e `prestart` eseguono:

``` bash
node db/setup.js
```

Lo script:

1.  apre o crea il database;
2.  applica `schema.sql`;
3.  verifica le migrazioni storiche;
4.  popola la tabella degli Avatar se vuota;
5.  popola i contenuti dei Percorsi se la tabella è vuota.

I seed sono progettati per essere idempotenti: rilanciare il setup non
deve duplicare i dati già presenti.

Il percorso predefinito è:

``` text
backend/db/stementor.sqlite
```

È possibile cambiarlo tramite `DB_PATH`.

------------------------------------------------------------------------

## Database

Le principali tabelle sono:

### `users`

Contiene i profili utente:

-   id;
-   nome;
-   email;
-   password hash;
-   età;
-   livello scolastico;
-   indirizzo scolastico;
-   consenso genitoriale;
-   data di creazione.

I livelli scolastici accettati internamente sono:

``` text
scuola_secondaria_primo_grado
scuola_secondaria_secondo_grado
```

### `avatars`

Contiene le quattro mentor, la disciplina, la biografia, il prompt di
sistema e il riferimento all'immagine.

### `conversations`

Associa un utente a una mentor.

### `messages`

Memorizza i messaggi dello storico delle conversazioni.

### `quiz_results`

Memorizza i risultati del Quiz.

### `mappe_contenuti`

Contiene scuole, università e carriere utilizzate nella sezione
Percorsi.

### `password_resets`

Contiene i token temporanei per la reimpostazione della password.

------------------------------------------------------------------------

## API principali

Il backend Express espone le seguenti aree:

``` text
/api/users
/api/avatars
/api/chat
/api/quiz
/api/maps
/api/tts
```

### Utenti

Comprende le operazioni per:

-   registrazione;
-   login;
-   lettura e modifica del profilo;
-   cambio password;
-   recupero password;
-   reimpostazione password;
-   eliminazione account.

### Avatar

Permette di recuperare l'elenco delle mentor e i relativi dati.

### Chat

Gestisce:

-   invio messaggi;
-   creazione/ripresa della conversazione;
-   storico;
-   salvataggio dei messaggi;
-   eliminazione di una conversazione;
-   comunicazione con Gemini.

### Quiz

Salva e recupera i risultati dell'orientamento.

### Maps/Percorsi

Restituisce scuole, università e carriere e le opzioni disponibili per i
filtri.

### TTS

Riceve nome della mentor e testo, genera la sintesi tramite Azure e
restituisce audio e visemi.

------------------------------------------------------------------------

## Test automatici del backend

Dalla cartella `backend`:

``` bash
npm test
```

La suite utilizza:

-   Node Test Runner;
-   Supertest;
-   un database SQLite di test separato.

Copre, tra le altre cose:

-   registrazione;
-   validazione email;
-   consenso genitoriale;
-   livelli scolastici;
-   login;
-   modifica profilo;
-   cambio password;
-   eliminazione account;
-   avatar;
-   Quiz;
-   Percorsi;
-   Chat;
-   storico ed eliminazione conversazioni;
-   gestione degli errori Gemini;
-   TTS;
-   SSML e pronuncia;
-   rate limiting;
-   coerenza tra Quiz e prompt della Chat.

Nell'ultima esecuzione di collaudo del progetto:

``` text
46 test
46 superati
0 falliti
```

Le chiamate reali a Gemini non vengono utilizzate nei normali test API:
il servizio viene simulato per rendere i test ripetibili e non consumare
quota.

------------------------------------------------------------------------

## Test end-to-end con Playwright

I test E2E si trovano nella cartella:

``` text
e2e/
```

Installare prima le dipendenze:

``` bash
cd e2e
npm install
```

Poi:

``` bash
npm test
```

La configurazione Playwright avvia automaticamente:

-   backend su porta 3001;
-   frontend su porta 5173.

Non è quindi necessario avviarli manualmente prima della suite E2E.

L'attuale configurazione utilizza **Microsoft Edge**
(`channel: 'msedge'`) e verifica tre viewport:

-   mobile --- 375 × 667;
-   tablet --- 768 × 1024;
-   desktop --- 1440 × 900.

I test includono controlli di:

-   registrazione;
-   corretta trasmissione del livello scolastico;
-   accessibilità;
-   responsive design;
-   overflow orizzontale;
-   comportamento delle principali schermate.

Nell'ultima esecuzione:

``` text
33 passed
```

Per aprire l'interfaccia Playwright:

``` bash
npm run test:ui
```

> Eseguire i comandi Playwright dalla cartella `e2e`, in modo da
> utilizzare la versione di `@playwright/test` installata per questa
> suite.

------------------------------------------------------------------------

## Valutazione delle risposte delle mentor

Nel backend è presente anche:

``` text
backend/scripts/valutazioneAvatar.js
```

Lo script è dedicato alla valutazione ripetibile delle conversazioni con
le mentor.

Con backend configurato e avviato, può essere eseguito dalla cartella
`backend` con:

``` bash
node scripts/valutazioneAvatar.js
```

Il relativo report è salvato in:

``` text
backend/scripts/report-valutazione-avatar.md
```

Questa verifica è separata dai normali test automatici API perché
coinvolge il comportamento del modello conversazionale e può utilizzare
la quota del servizio esterno.

------------------------------------------------------------------------

## Build del frontend

Per generare la build di produzione:

``` bash
cd frontend
npm run build
```

Vite genera i file nella cartella:

``` text
frontend/dist/
```

Per visualizzare localmente la build:

``` bash
npm run preview
```

------------------------------------------------------------------------

## Recupero password

Il recupero password è implementato a livello di prototipo.

Il backend genera un token temporaneo, ma **non viene inviata una vera
email**. Il link di reimpostazione viene reso disponibile direttamente
nell'interfaccia.

In una versione destinata alla produzione questa parte dovrebbe essere
sostituita con un servizio di invio email.

------------------------------------------------------------------------

## Accessibilità e responsive design

L'interfaccia è stata progettata per adattarsi a desktop, tablet e
mobile.

La suite Playwright utilizza anche `@axe-core/playwright` per effettuare
controlli automatici di accessibilità.

Tra gli aspetti verificati durante lo sviluppo:

-   contrasto dei testi;
-   etichette accessibili;
-   struttura delle pagine;
-   adattamento della Navbar;
-   assenza di overflow orizzontale;
-   comportamento delle schermate alle diverse viewport.

------------------------------------------------------------------------

## Sicurezza e privacy

Il prototipo include alcune misure di sicurezza:

-   password hashate con `scrypt`;
-   salt casuale per ogni password;
-   validazione email;
-   email univoche;
-   consenso genitoriale under-14 verificato anche lato server;
-   chiavi Gemini e Azure mantenute lato backend;
-   limiti sulle richieste TTS;
-   limiti sulla lunghezza del testo inviato alla sintesi;
-   eliminazione dei dati collegati quando viene eliminato un account.

Rimangono tuttavia limitazioni proprie di un prototipo accademico.

------------------------------------------------------------------------

## Limiti noti

### Autenticazione

La sessione dell'utente è gestita lato browser tramite `localStorage`;
non è presente un vero sistema di sessione server-side o token JWT.

### HTTPS e cifratura

In sviluppo l'applicazione utilizza HTTP locale e il database SQLite non
è cifrato a riposo.

### Recupero password

Il token di reset viene mostrato nell'applicazione anziché essere
inviato tramite email.

### Dataset dei Percorsi

Scuole, università e professioni costituiscono un dataset dimostrativo e
non un catalogo completo dell'offerta formativa italiana.

### Dipendenza da servizi esterni

Chat e sintesi vocale dipendono rispettivamente dai servizi Google
Gemini e Azure AI Speech, quindi disponibilità, quote e condizioni dei
provider possono influenzare il funzionamento.

### Avatar

L'animazione utilizza un insieme limitato di frame/visemi e costituisce
un'approssimazione del movimento labiale, non una ricostruzione video
fotorealistica.

### Valutazione con utenti reali

Il prototipo è stato sottoposto a collaudo tecnico, ma una fase futura
dovrebbe includere test di usabilità e valutazione con studentesse reali
per misurare l'efficacia dello strumento come supporto all'orientamento.

------------------------------------------------------------------------

## Sviluppi futuri

Tra le evoluzioni possibili:

-   autenticazione con sessioni sicure o JWT;
-   HTTPS;
-   database cifrato o gestito;
-   invio reale delle email di recupero password;
-   ampliamento e aggiornamento automatico dei dati di scuole e
    università;
-   maggiore integrazione tra Quiz e dati dei Percorsi;
-   moderazione applicativa aggiuntiva per utenti minorenni;
-   maggiore trasparenza sulla natura artificiale delle mentor
    direttamente nella Chat;
-   domande suggerite per iniziare la conversazione;
-   storico generale delle conversazioni;
-   Avatar più fluidi e realistici;
-   sperimentazione con utenti reali.

------------------------------------------------------------------------

## Risoluzione dei problemi

### Il frontend non comunica con il backend

Verificare che il backend sia attivo sulla porta 3001:

``` bash
cd backend
npm run dev
```

e che il frontend sia avviato dalla cartella `frontend`.

### Errore relativo a Gemini

Controllare:

``` env
AI_API_KEY
```

e verificare quota, validità della chiave e disponibilità del modello
configurato.

### Le mentor non parlano

Controllare:

``` env
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION
```

e verificare che la risorsa Azure Speech sia attiva.

### Errore SQLite

Verificare `DB_PATH` e rilanciare:

``` bash
cd backend
npm run setup
```

### I test Playwright non partono

Assicurarsi di essere nella cartella:

``` text
e2e
```

e installare le dipendenze:

``` bash
npm install
npm test
```

L'attuale configurazione richiede Microsoft Edge installato.

------------------------------------------------------------------------

## Comandi rapidi

### Backend

``` bash
cd backend
npm install
npm run dev
```

### Frontend

``` bash
cd frontend
npm install
npm run dev
```

### Test backend

``` bash
cd backend
npm test
```

### Test E2E

``` bash
cd e2e
npm install
npm test
```

### Build frontend

``` bash
cd frontend
npm run build
```

------------------------------------------------------------------------

## Dati sensibili e repository

Non includere nel repository o negli archivi pubblici:

``` text
backend/.env
backend/db/*.sqlite
backend/tests/*.sqlite
node_modules/
```

Il repository contiene `.env.example`, che deve essere utilizzato come
modello senza inserirvi chiavi reali.

Se una chiave API viene accidentalmente pubblicata o condivisa in un
archivio, è consigliabile revocarla e generarne una nuova dal relativo
provider.

------------------------------------------------------------------------

## Contesto accademico

STEMentor è stato sviluppato come prototipo nell'ambito di una tesi
dedicata all'utilizzo di Avatar conversazionali con intelligenza
artificiale per l'orientamento delle studentesse nelle discipline STEM.

Il progetto ha finalità dimostrative, di ricerca e sperimentazione
accademica.

------------------------------------------------------------------------

## Licenza e utilizzo

Progetto accademico.\
Non è un servizio commerciale e non sostituisce l'attività di
orientamento svolta da scuole, università, famiglie o professionisti.

