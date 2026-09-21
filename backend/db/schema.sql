-- =====================================================
-- SCHEMA DATABASE STEMENTOR (versione unificata)
-- =====================================================
-- Questa versione include già tutto ciò che prima arrivava da
-- migrateAuth.js, migratePasswordReset.js e migrateMappe.js.
-- Chi clona il repository da zero NON ha più bisogno di lanciare
-- le migrazioni: bastano schema.sql + i seed. Le migrazioni restano
-- utili solo per aggiornare un database .sqlite creato PRIMA di
-- questa unificazione (vedi setup.js).

-- Profili utente (§3.2 - Requisiti: Profilazione dell'utente)
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     nome TEXT NOT NULL,
                                     email TEXT,
                                     password_hash TEXT,
                                     eta INTEGER NOT NULL,
                                     livello_scolastico TEXT NOT NULL CHECK(
                                     livello_scolastico IN (
                                     'scuola_secondaria_primo_grado',
                                     'scuola_secondaria_secondo_grado'
)
    ),
    indirizzo_scolastico TEXT,
    consenso_genitoriale INTEGER DEFAULT 0,  -- 1 se acquisito (necessario per under-14, §3.3)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Email univoca (ignora i vecchi profili senza email, se presenti)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(email)
    WHERE email IS NOT NULL;

-- Avatar disponibili (§3.2 - Requisiti: Galleria avatar)
CREATE TABLE IF NOT EXISTS avatars (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       nome TEXT NOT NULL,
                                       disciplina TEXT NOT NULL,
                                       bio_breve TEXT NOT NULL,
                                       system_prompt TEXT NOT NULL,   -- il "cervello" dell'avatar: personalità, tono, stile (§4.2)
                                       immagine_url TEXT
);

-- Conversazioni tra utente e avatar (§3.2 - Requisiti: Conversazione)
CREATE TABLE IF NOT EXISTS conversations (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             user_id INTEGER NOT NULL,
                                             avatar_id INTEGER NOT NULL,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (avatar_id) REFERENCES avatars(id)
    );

-- Singoli messaggi dello storico conversazioni
CREATE TABLE IF NOT EXISTS messages (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        conversation_id INTEGER NOT NULL,
                                        mittente TEXT NOT NULL CHECK(mittente IN ('utente', 'avatar')),
    contenuto TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

-- Risultati del quiz di orientamento (§3.2 - Requisiti: Quiz di orientamento)
CREATE TABLE IF NOT EXISTS quiz_results (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            user_id INTEGER NOT NULL,
                                            profilo_interessi TEXT NOT NULL,  -- JSON con punteggi per area, es. {"informatica": 8, "ingegneria": 5}
                                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                            FOREIGN KEY (user_id) REFERENCES users(id)
    );

-- Contenuti delle mappe interattive (§3.2 - Requisiti: Mappe interattive)
-- Scuole organizzate per tipo_istituto + indirizzo, con regione/provincia.
-- Università organizzate per classe di laurea (campo indirizzo), con
-- sbocchi_professionali collegati.
CREATE TABLE IF NOT EXISTS mappe_contenuti (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               tipo TEXT NOT NULL CHECK(tipo IN ('carriera', 'universita', 'scuola')),
    tipo_istituto TEXT,   -- 'Liceo' | 'Istituto Tecnico' | 'Istituto Professionale' (solo per tipo='scuola')
    indirizzo TEXT,       -- indirizzo di studio (scuola) O classe di laurea, es. "L-31" (università)
    nome TEXT NOT NULL,
    descrizione TEXT,
    regione TEXT,
    provincia TEXT,
    link_esterno TEXT,
    sbocchi_professionali TEXT  -- principalmente per le università
    );

-- Token di recupero password (monouso, scadenza 30 minuti)
CREATE TABLE IF NOT EXISTS password_resets (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               user_id INTEGER NOT NULL,
                                               token TEXT NOT NULL UNIQUE,
                                               scade_il DATETIME NOT NULL,
                                               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                               FOREIGN KEY (user_id) REFERENCES users(id)
    );