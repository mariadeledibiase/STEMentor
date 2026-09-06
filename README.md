# STEMentor

Prototipo sviluppato nell'ambito di una tesi di laurea (Università di Camerino), con l'obiettivo di aiutare studentesse di scuola media e superiore a orientarsi verso le discipline STEM attraverso avatar conversazionali basati su figure femminili reali della scienza (Ada Lovelace, Marie Curie, Margherita Hack, Samantha Cristoforetti).

## Funzionalità principali

- **Registrazione e accesso** con email e password (password cifrata, mai salvata in chiaro), inclusi recupero e reimpostazione password
- **Galleria avatar** con anteprima vocale
- **Chat con IA** con ciascun avatar: conversazione guidata verso un consiglio concreto (scuola superiore o corso di laurea), con voce sintetizzata e animazione della bocca sincronizzata
- **Quiz di orientamento**, con domande diverse per scuola media e scuola superiore, che assegna un profilo di interessi e consiglia un avatar/percorso
- **Mappe interattive** di scuole superiori, università e percorsi di carriera, filtrabili per tipo di istituto, indirizzo e regione
- **Profilo utente** modificabile in qualsiasi momento, inclusa la gestione della password
- **Consenso genitoriale** per gli utenti under-14, ai sensi del GDPR

## Stack tecnologico

| Livello | Tecnologia |
|---|---|
| Frontend | React 18, react-router-dom, Vite |
| Sintesi vocale | Web Speech API (nativa del browser, nessun costo) |
| Backend | Node.js, Express |
| Database | SQLite (modulo nativo `node:sqlite`, nessuna dipendenza esterna) |
| IA conversazionale | Google Gemini API (livello gratuito) |
| Sicurezza credenziali | hashing password con `scrypt` (modulo `crypto` di Node) |

## Struttura del progetto

```
stementor/
├── backend/                  # API Node.js + Express + SQLite
│   ├── db/
│   │   ├── schema.sql            # struttura completa delle tabelle
│   │   ├── database.js           # connessione al database
│   │   ├── setup.js               # crea schema + semina dati, tutto in un comando
│   │   ├── seed.js                # semina i 4 avatar (idempotente)
│   │   ├── seedMappe.js           # semina scuole/università/carriere (idempotente)
│   │   ├── migrateAuth.js         # storico: aggiunta email/password (non serve su db nuovi)
│   │   ├── migratePasswordReset.js# storico: tabella password_resets (non serve su db nuovi)
│   │   └── migrateMappe.js        # storico: colonne estese mappe (non serve su db nuovi)
│   ├── routes/                # una rotta per ciascuna area funzionale
│   │   ├── users.js               # registrazione, login, profilo, password
│   │   ├── avatars.js             # galleria avatar
│   │   ├── chat.js                # conversazione con l'IA
│   │   ├── quiz.js                # quiz di orientamento
│   │   └── maps.js                # mappe interattive
│   ├── .env.example
│   └── server.js
└── frontend/                 # React + Vite
    ├── public/immagini/          # immagini e frame degli avatar
    └── src/
        ├── pages/                 # una pagina per ogni sezione dell'app
        ├── components/            # componenti riutilizzabili (Navbar, TalkingAvatar, ...)
        └── data/                  # dati/utility condivisi (es. profilo utente in localStorage)
```

## Requisiti

- **Node.js 22.13 o superiore** (necessario per il modulo `node:sqlite` integrato). Verifica con `node -v`.
- Una **chiave API gratuita di Google Gemini** (vedi sotto).

## Come avviare il backend

```
cd backend
npm install
cp .env.example .env        # su Windows: copy .env.example .env
```

Apri il file `.env` appena creato e inserisci la tua chiave in `AI_API_KEY`. Per ottenerla (gratis, nessuna carta di credito):

1. Vai su https://aistudio.google.com/apikey
2. Accedi con un account Google
3. Clicca "Create API key" e copiala nel file `.env`

Poi avvia il server:

```
npm run dev
```

**Non serve nessun altro comando**: `npm run dev` esegue automaticamente `db/setup.js`, che crea lo schema del database (se non esiste) e lo popola con i 4 avatar e i contenuti delle mappe (solo se le tabelle sono vuote — è sicuro rilanciarlo quante volte vuoi, non duplica né cancella nulla). Il backend sarà attivo su `http://localhost:3001`.

## Come avviare il frontend

In un **secondo** terminale (lascia il backend acceso):

```
cd frontend
npm install
npm run dev
```

Il frontend sarà attivo su `http://localhost:5173` e si aprirà nel browser. Le chiamate a `/api/...` vengono automaticamente inoltrate al backend tramite il proxy configurato in `vite.config.js`.

## Come vedere i dati salvati

Il file del database (`backend/db/stementor.sqlite`) viene creato in automatico e non è incluso nel repository (si rigenera da solo, come `node_modules/`). Per ispezionarlo: [DB Browser for SQLite](https://dbbrowserforsqlite.org) (gratuito) → *Open Database* → seleziona il file → scheda *Browse Data*.

## Stato attuale e limiti noti (prototipo di tesi)

- Il recupero password non invia una vera email: il link viene mostrato direttamente a schermo, per restare a costo zero.
- La "sessione" utente è gestita in `localStorage` sul browser, non con un vero token di autenticazione lato server.
- I contenuti delle mappe (scuole/università) sono una prima bozza, non un elenco esaustivo di tutta l'offerta formativa italiana.
- La voce degli avatar dipende dalle voci italiane disponibili nel browser/sistema operativo dell'utente.

Una discussione più estesa di questi limiti e degli sviluppi futuri si trova nel Capitolo 5 della tesi.

## Licenza

Progetto accademico, sviluppato nell'ambito di una tesi di laurea. Non è un servizio commerciale.
