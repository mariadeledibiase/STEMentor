-- =====================================================
-- SCHEMA DATABASE STEMENTOR
-- =====================================================

-- Profili utente (§3.2 - Requisiti: Profilazione dell'utente)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    eta INTEGER NOT NULL,
    livello_scolastico TEXT NOT NULL CHECK(livello_scolastico IN ('scuola_media', 'scuola_superiore')),
    indirizzo_scolastico TEXT,
    consenso_genitoriale INTEGER DEFAULT 0,  -- 1 se acquisito (necessario per under-14, §3.3)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
    profilo_interessi TEXT NOT NULL,  -- es. JSON con punteggi per area (es. {"informatica": 8, "biologia": 5})
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Contenuti delle mappe interattive (§3.2 - Requisiti: Mappe interattive)
CREATE TABLE IF NOT EXISTS mappe_contenuti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK(tipo IN ('carriera', 'universita', 'scuola')),
    nome TEXT NOT NULL,
    descrizione TEXT,
    area_disciplinare TEXT,
    regione TEXT,
    link_esterno TEXT
);
