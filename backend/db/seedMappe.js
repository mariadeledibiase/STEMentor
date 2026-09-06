import db from './database.js';

// Ripopola mappe_contenuti con una struttura più corretta:
// - SCUOLE organizzate per tipo di istituto (Liceo / Istituto Tecnico /
//   Istituto Professionale) e indirizzo, con regione/provincia dove
//   abbiamo un istituto reale specifico verificato.
// - UNIVERSITÀ organizzate per classe di laurea (es. L-31), con
//   sbocchi professionali reali.
//
// NOTA IMPORTANTE (onestà sui limiti dei dati): questa è una PRIMA BOZZA,
// non un database esaustivo di tutte le scuole/università italiane.
// Per gli indirizzi di istituto tecnico/professionale di cui non abbiamo
// ancora verificato un istituto specifico, la voce resta "generica"
// (regione/provincia null = "presente in molte province, cerca il tuo
// istituto tecnico locale"). Andrà arricchito con dati reali più completi
// (es. da fonti aperte del MIUR) per una versione non prototipale.
// Esegui questo file UNA VOLTA con: node db/seedMappe.js

// Prima puliamo eventuali dati della vecchia struttura (bozza precedente)
db.exec("DELETE FROM mappe_contenuti");

const contenuti = [
  // ==================== SCUOLE SUPERIORI ====================

  // --- LICEO (istituti reali verificati) ---
  {
    tipo: 'scuola',
    tipo_istituto: 'Liceo',
    indirizzo: 'Liceo Scientifico',
    nome: 'Liceo Scientifico "T. Calzecchi Onesti"',
    descrizione: 'Liceo scientifico, tra le scuole autorizzate alla sperimentazione del Liceo Matematico.',
    regione: 'Marche',
    provincia: 'Fermo',
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Liceo',
    indirizzo: 'Liceo Scientifico',
    nome: 'Liceo Scientifico Statale "Marie Curie"',
    descrizione: 'Liceo scientifico a Giulianova, tra le scuole autorizzate alla sperimentazione del Liceo Matematico.',
    regione: 'Abruzzo',
    provincia: 'Teramo',
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Liceo',
    indirizzo: 'Liceo Scientifico - opzione Scienze Applicate',
    nome: 'Liceo Scientifico "G. Marconi"',
    descrizione: 'Liceo scientifico con opzione scienze applicate, più laboratorio e informatica rispetto al liceo scientifico tradizionale.',
    regione: 'Lombardia',
    provincia: 'Milano',
    link_esterno: 'https://www.marconionline.edu.it',
  },

  // --- ISTITUTO TECNICO (indirizzi STEM del settore tecnologico) ---
  // Voci generiche (nessun istituto specifico verificato ancora) --
  // questi indirizzi esistono in istituti tecnici sparsi in tutta Italia.
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Tecnico',
    indirizzo: 'Informatica e Telecomunicazioni',
    nome: 'Istituto Tecnico Tecnologico - Informatica e Telecomunicazioni',
    descrizione: 'Programmazione, reti, sistemi informatici, con molta pratica di laboratorio fin dal primo biennio. Presente in numerosi istituti tecnici in tutta Italia.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Tecnico',
    indirizzo: 'Chimica, Materiali e Biotecnologie',
    nome: 'Istituto Tecnico Tecnologico - Chimica, Materiali e Biotecnologie',
    descrizione: 'Laboratorio di chimica fin dal primo biennio, con approfondimenti su materiali e biotecnologie.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Tecnico',
    indirizzo: 'Elettronica ed Elettrotecnica',
    nome: 'Istituto Tecnico Tecnologico - Elettronica ed Elettrotecnica',
    descrizione: 'Circuiti, automazione, sistemi elettrici ed elettronici, con approccio molto pratico.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Tecnico',
    indirizzo: 'Meccanica, Meccatronica ed Energia',
    nome: 'Istituto Tecnico Tecnologico - Meccanica, Meccatronica ed Energia',
    descrizione: 'Progettazione meccanica, automazione industriale, energie -- molta pratica su macchine e impianti.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Tecnico',
    indirizzo: 'Costruzioni, Ambiente e Territorio',
    nome: 'Istituto Tecnico Tecnologico - Costruzioni, Ambiente e Territorio',
    descrizione: 'Progettazione edilizia, topografia, gestione del territorio.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Tecnico',
    indirizzo: 'Agraria, Agroalimentare e Agroindustria',
    nome: 'Istituto Tecnico Tecnologico - Agraria, Agroalimentare e Agroindustria',
    descrizione: 'Scienze agrarie, biotecnologie applicate all\'agricoltura, gestione del territorio rurale.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },

  // --- ISTITUTO PROFESSIONALE (indirizzi STEM) ---
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Professionale',
    indirizzo: 'Manutenzione e Assistenza Tecnica',
    nome: 'Istituto Professionale - Manutenzione e Assistenza Tecnica',
    descrizione: 'Formazione molto pratica su manutenzione di impianti, macchine e apparati elettrici/elettronici, orientata a un rapido ingresso nel mondo del lavoro.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },
  {
    tipo: 'scuola',
    tipo_istituto: 'Istituto Professionale',
    indirizzo: 'Servizi per l\'Agricoltura e lo Sviluppo Rurale',
    nome: 'Istituto Professionale - Servizi per l\'Agricoltura e lo Sviluppo Rurale',
    descrizione: 'Tecniche agricole, gestione di aziende agricole, sostenibilità ambientale.',
    regione: null,
    provincia: null,
    link_esterno: null,
  },

  // ==================== UNIVERSITÀ (per classe di laurea) ====================

  // --- L-31: Scienze e Tecnologie Informatiche ---
  {
    tipo: 'universita',
    indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
    nome: 'Informatica - Università degli Studi di Camerino',
    descrizione: 'Laurea triennale in Informatica, Scuola di Scienze e Tecnologie.',
    regione: 'Marche',
    provincia: 'Macerata',
    link_esterno: 'https://www.unicam.it',
    sbocchi_professionali: 'Sviluppatore software, analista di sistemi, sistemista di rete, consulente informatico, web designer, data analyst.',
  },
  {
    tipo: 'universita',
    indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
    nome: 'Informatica - Sapienza Università di Roma',
    descrizione: 'Laurea triennale in Informatica, Facoltà di Ingegneria dell\'informazione, informatica e statistica.',
    regione: 'Lazio',
    provincia: 'Roma',
    link_esterno: 'https://corsidilaurea.uniroma1.it',
    sbocchi_professionali: 'Sviluppatore software, analista di sistemi, sistemista di rete, consulente informatico, web designer, data analyst.',
  },
  {
    tipo: 'universita',
    indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
    nome: 'Informatica - Università di Bologna',
    descrizione: 'Laurea triennale in Informatica, Dipartimento di Informatica - Scienza e Ingegneria.',
    regione: 'Emilia-Romagna',
    provincia: 'Bologna',
    link_esterno: 'https://corsi.unibo.it/laurea/informatica',
    sbocchi_professionali: 'Sviluppatore software, analista di sistemi, sistemista di rete, consulente informatico, web designer, data analyst.',
  },
  {
    tipo: 'universita',
    indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
    nome: 'Informatica - Università degli Studi di Milano',
    descrizione: 'Laurea triennale in Informatica.',
    regione: 'Lombardia',
    provincia: 'Milano',
    link_esterno: null,
    sbocchi_professionali: 'Sviluppatore software, analista di sistemi, sistemista di rete, consulente informatico, web designer, data analyst.',
  },
  {
    tipo: 'universita',
    indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
    nome: 'Informatica - Università degli Studi di Napoli Federico II',
    descrizione: 'Laurea triennale in Informatica.',
    regione: 'Campania',
    provincia: 'Napoli',
    link_esterno: null,
    sbocchi_professionali: 'Sviluppatore software, analista di sistemi, sistemista di rete, consulente informatico, web designer, data analyst.',
  },
  {
    tipo: 'universita',
    indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
    nome: 'Informatica - Università Ca\' Foscari Venezia',
    descrizione: 'Laurea triennale in Informatica.',
    regione: 'Veneto',
    provincia: 'Venezia',
    link_esterno: null,
    sbocchi_professionali: 'Sviluppatore software, analista di sistemi, sistemista di rete, consulente informatico, web designer, data analyst.',
  },

  // --- L-30: Scienze e Tecnologie Fisiche ---
  {
    tipo: 'universita',
    indirizzo: 'L-30 - Scienze e Tecnologie Fisiche',
    nome: 'Fisica - Università degli Studi di Camerino',
    descrizione: 'Laurea triennale in Scienze e tecnologie fisiche, Scuola di Scienze e Tecnologie.',
    regione: 'Marche',
    provincia: 'Macerata',
    link_esterno: 'https://sst.unicam.it',
    sbocchi_professionali: 'Ricercatore, tecnico di laboratorio, data scientist, insegnante di fisica, consulente tecnico-scientifico.',
  },

  // --- L-9: Ingegneria Industriale (curriculum Aerospaziale) ---
  {
    tipo: 'universita',
    indirizzo: 'L-9 - Ingegneria Industriale (curriculum Aerospaziale)',
    nome: 'Ingegneria Aerospaziale - Politecnico di Milano',
    descrizione: 'Laurea triennale in Ingegneria Aerospaziale, Scuola di Ingegneria Industriale e dell\'Informazione, campus Bovisa.',
    regione: 'Lombardia',
    provincia: 'Milano',
    link_esterno: 'https://www.aero.polimi.it/it/corsi-di-studio',
    sbocchi_professionali: 'Ingegnere aerospaziale, progettista di sistemi di volo, tecnico di produzione aeronautica, ricercatore in ambito spaziale.',
  },
];

const stmt = db.prepare(`
  INSERT INTO mappe_contenuti (tipo, tipo_istituto, indirizzo, nome, descrizione, regione, provincia, link_esterno, sbocchi_professionali)
  VALUES (@tipo, @tipo_istituto, @indirizzo, @nome, @descrizione, @regione, @provincia, @link_esterno, @sbocchi_professionali)
`);

for (const c of contenuti) {
  stmt.run({
    tipo: c.tipo,
    tipo_istituto: c.tipo_istituto || null,
    indirizzo: c.indirizzo || null,
    nome: c.nome,
    descrizione: c.descrizione,
    regione: c.regione || null,
    provincia: c.provincia || null,
    link_esterno: c.link_esterno || null,
    sbocchi_professionali: c.sbocchi_professionali || null,
  });
}

console.log(`${contenuti.length} contenuti inseriti nella tabella mappe_contenuti.`);