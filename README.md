# STEMentor - Progetto

Struttura iniziale del prototipo descritto nel Capitolo 4 e 5 della tesi.

## Struttura del progetto

```
stementor/
├── backend/          # API Node.js + Express + SQLite
│   ├── db/
│   │   ├── schema.sql     # struttura delle tabelle
│   │   ├── database.js    # connessione al database
│   │   └── seed.js        # popola gli avatar iniziali
│   ├── routes/             # una rotta per ciascuna area funzionale
│   │   ├── users.js        # profilazione utente
│   │   ├── avatars.js      # galleria avatar
│   │   ├── chat.js         # conversazione con l'IA
│   │   ├── quiz.js         # quiz di orientamento
│   │   └── maps.js         # mappe interattive
│   └── server.js
└── frontend/          # React + Vite
    └── src/
        ├── pages/          # una pagina per area (per ora solo scheletro)
        └── components/
```

## Come aprire il progetto in IntelliJ

1. Apri IntelliJ IDEA
2. `File → Open` e seleziona la cartella `stementor` (quella che contiene sia `backend` che `frontend`)
3. IntelliJ dovrebbe riconoscere automaticamente i due progetti Node.js separati

## Requisiti

- **Node.js versione 22.13 o superiore** (necessaria per il modulo SQLite integrato). Verifica con `node -v` nel terminale.

## Come avviare il backend

Apri un terminale in IntelliJ (in basso, tab "Terminal"), poi:

```bash
cd backend
npm install
cp .env.example .env
```

(su Windows, al posto di `cp`, usa `copy .env.example .env`)

Apri il file `.env` appena creato e inserisci la tua vera chiave API (Claude o OpenAI) al posto di `inserisci_qui_la_tua_chiave`.

Poi, per creare il database e popolarlo con i 4 avatar:

```bash
node db/seed.js
```

Infine avvia il server:

```bash
npm run dev
```

Il backend sarà attivo su `http://localhost:3001`.

## Come avviare il frontend

In un **secondo** terminale (lascia il backend acceso):

```bash
cd frontend
npm install
npm run dev
```

Il frontend sarà attivo su `http://localhost:5173` e si aprirà nel browser.

## Stato attuale

- Backend: struttura completa delle 5 aree funzionali (utenti, avatar, chat, quiz, mappe)
- Frontend: scheletro di navigazione e pagine vuote, **senza design** — lo costruiamo nei prossimi passaggi
- Database: schema completo, 4 avatar precaricabili con `seed.js`
- Mappe: la tabella `mappe_contenuti` è vuota — andrà popolata con dati reali (carriere, università, scuole)

## Prossimi passaggi

1. Design dell'interfaccia (homepage, registrazione, galleria avatar)
2. Popolare i contenuti delle mappe
3. Collegare l'autenticazione reale (per ora `user_id` è fissato a `1` nel codice di test)
