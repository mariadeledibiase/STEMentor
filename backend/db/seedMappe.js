import db from './database.js';

// Popola mappe_contenuti con SCUOLE organizzate per tipo di istituto
// (Liceo / Istituto Tecnico / Istituto Professionale) e indirizzo, con
// regione/provincia dove abbiamo un istituto reale specifico verificato,
// UNIVERSITÀ organizzate per classe di laurea (es. L-31), con sbocchi
// professionali reali, e CARRIERE (professioni STEM) organizzate per
// area di interesse.
//
// NOTA IMPORTANTE (onestà sui limiti dei dati): questa resta una BOZZA
// ampliata rispetto alla versione iniziale, non un database esaustivo di
// tutte le scuole/università/professioni italiane. Per gli indirizzi di
// istituto tecnico/professionale di cui non abbiamo ancora verificato un
// istituto specifico, la voce resta "generica" (regione/provincia null =
// "presente in molte province, cerca il tuo istituto locale"). Andrà
// arricchito con dati reali più completi (es. da fonti aperte del MIUR)
// per una versione non prototipale.
//
// IDEMPOTENTE: se la tabella contiene già righe, non fa nulla -- così può
// essere lanciato in automatico ad ogni avvio (vedi setup.js) senza
// cancellare eventuali contenuti aggiunti manualmente in seguito. Per
// forzare un repopolamento da zero (es. dopo aver ampliato questo file),
// svuota prima la tabella a mano (es. da DB Browser for SQLite) o
// cancella il file .sqlite e rilancia "node db/setup.js".

const { conteggio } = db.prepare('SELECT COUNT(*) AS conteggio FROM mappe_contenuti').get();

if (conteggio > 0) {
  console.log(`Tabella "mappe_contenuti" già popolata (${conteggio} righe) -- nessuna azione.`);
} else {
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

    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico',
      nome: 'Liceo Scientifico e Linguistico "Edouard Bérard"',
      descrizione: 'Liceo scientifico e linguistico di Aosta, principale riferimento per l\'indirizzo scientifico in Valle d\'Aosta.',
      regione: 'Valle d\'Aosta',
      provincia: 'Aosta',
      link_esterno: 'https://www.lberard.edu.it',
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico',
      nome: 'Liceo Scientifico "G.D. Cassini"',
      descrizione: 'Liceo scientifico storico di Genova, con anche un percorso Scientifico-Esabac a doppia certificazione italo-francese.',
      regione: 'Liguria',
      provincia: 'Genova',
      link_esterno: 'https://www.liceocassini.it',
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico',
      nome: 'Liceo Scientifico "Galileo Galilei"',
      descrizione: 'Liceo scientifico di Trieste, con anche l\'opzione Scienze Applicate.',
      regione: 'Friuli-Venezia Giulia',
      provincia: 'Trieste',
      link_esterno: 'https://www.galileitrieste.it',
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico',
      nome: 'Liceo Scientifico Statale "Camillo Cavour"',
      descrizione: 'Fondato nel 1871, è il primo liceo scientifico istituito a Roma e tra i primi in Italia.',
      regione: 'Lazio',
      provincia: 'Roma',
      link_esterno: 'https://www.liceocavour.edu.it',
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico',
      nome: 'Liceo Scientifico Statale "Angelo Messedaglia"',
      descrizione: 'Uno dei licei scientifici storici di Verona, con percorso tradizionale e percorso a indirizzo informatico (ex PNI).',
      regione: 'Veneto',
      provincia: 'Verona',
      link_esterno: 'https://www.messedagliavr.it',
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico',
      nome: 'Liceo Scientifico Statale "S. Cannizzaro"',
      descrizione: 'Liceo scientifico di Palermo, con curvatura biomedica e forte impegno in olimpiadi STEM e di statistica.',
      regione: 'Sicilia',
      provincia: 'Palermo',
      link_esterno: 'https://liceocannizzaropalermo.edu.it',
    },

    // NOTA: regioni con almeno una scuola reale verificata finora: Marche,
    // Abruzzo, Lombardia, Valle d'Aosta, Liguria, Friuli-Venezia Giulia,
    // Lazio, Veneto, Sicilia. Restano da verificare (ancora non presenti
    // con un istituto specifico): Piemonte, Toscana, Trentino-Alto Adige,
    // Emilia-Romagna, Campania, Umbria, Molise, Puglia, Basilicata,
    // Calabria, Sardegna -- per queste, il filtro "scuola" mostrerà solo
    // le voci generiche sotto (regione/provincia null) finché non verranno
    // aggiunte istituzioni reali specifiche.

    // --- LICEO (voci generiche, presenti in tutte le regioni) ---
    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico',
      nome: 'Liceo Scientifico (indirizzo tradizionale)',
      descrizione: 'Presente in ogni provincia italiana: buona base di matematica, fisica e scienze naturali per proseguire all\'università.',
      regione: null,
      provincia: null,
      link_esterno: null,
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Liceo',
      indirizzo: 'Liceo Scientifico - opzione Scienze Applicate',
      nome: 'Liceo Scientifico - opzione Scienze Applicate',
      descrizione: 'Più laboratorio e informatica rispetto al liceo scientifico tradizionale, senza lo studio del latino. Presente in molte province.',
      regione: null,
      provincia: null,
      link_esterno: null,
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
      indirizzo: 'Chimica, Materiali e Biotecnologie - curvatura Biotecnologie Sanitarie',
      nome: 'Istituto Tecnico Tecnologico - Biotecnologie Sanitarie',
      descrizione: 'Curvatura del percorso chimico-biotecnologico orientata alla sanità: analisi cliniche, biologia applicata, farmacologia di base.',
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

    // --- ISTITUTO PROFESSIONALE (indirizzi STEM, con curvatura specificata) ---
    // NOTA: gli Istituti Professionali italiani non hanno indirizzi separati
    // chiamati "Chimica" o "Informatica" come i Tecnici -- sono raggruppati
    // sotto due indirizzi ombrello (Manutenzione e Assistenza Tecnica,
    // Industria e Artigianato per il Made in Italy), con curvature interne
    // diverse da istituto a istituto. Le curvature sotto sono quindi
    // indicative, non un nome ufficiale a sé.
    {
      tipo: 'scuola',
      tipo_istituto: 'Istituto Professionale',
      indirizzo: 'Manutenzione e Assistenza Tecnica - curvatura Elettronica e Informatica',
      nome: 'Istituto Professionale - Manutenzione e Assistenza Tecnica (curvatura Elettronica e Informatica)',
      descrizione: 'Manutenzione di apparati elettronici e sistemi informatici, con molta pratica di laboratorio, orientato a un rapido ingresso nel mondo del lavoro.',
      regione: null,
      provincia: null,
      link_esterno: null,
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Istituto Professionale',
      indirizzo: 'Manutenzione e Assistenza Tecnica - curvatura Meccanica e Mezzi di Trasporto',
      nome: 'Istituto Professionale - Manutenzione e Assistenza Tecnica (curvatura Meccanica e Mezzi di Trasporto)',
      descrizione: 'Manutenzione e riparazione di macchine, motori e mezzi di trasporto, con approccio molto pratico.',
      regione: null,
      provincia: null,
      link_esterno: null,
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Istituto Professionale',
      indirizzo: 'Industria e Artigianato per il Made in Italy - curvatura Chimica e Produzioni Artigianali',
      nome: 'Istituto Professionale - Industria e Artigianato per il Made in Italy (curvatura Chimica e Produzioni Artigianali)',
      descrizione: 'Produzioni chimiche e artigianali del territorio (es. ceramica, conceria, materiali), con laboratorio pratico fin dai primi anni.',
      regione: null,
      provincia: null,
      link_esterno: null,
    },
    {
      tipo: 'scuola',
      tipo_istituto: 'Istituto Professionale',
      indirizzo: 'Gestione delle Acque e Risanamento Ambientale',
      nome: 'Istituto Professionale - Gestione delle Acque e Risanamento Ambientale',
      descrizione: 'Gestione tecnica delle risorse idriche e bonifica ambientale, un indirizzo professionale a forte contenuto tecnico-scientifico.',
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
      sbocchi_professionali: 'Sviluppatrice software, Data Scientist, Esperta di Cybersecurity, UX/UI Designer.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Sapienza Università di Roma',
      descrizione: 'Laurea triennale in Informatica, Facoltà di Ingegneria dell\'informazione, informatica e statistica.',
      regione: 'Lazio',
      provincia: 'Roma',
      link_esterno: 'https://corsidilaurea.uniroma1.it',
      sbocchi_professionali: 'Sviluppatrice software, Data Scientist, Esperta di Cybersecurity, UX/UI Designer.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Università di Bologna',
      descrizione: 'Laurea triennale in Informatica, Dipartimento di Informatica - Scienza e Ingegneria.',
      regione: 'Emilia-Romagna',
      provincia: 'Bologna',
      link_esterno: 'https://corsi.unibo.it/laurea/informatica',
      sbocchi_professionali: 'Sviluppatrice software, Data Scientist, Esperta di Cybersecurity, UX/UI Designer.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Università degli Studi di Milano',
      descrizione: 'Laurea triennale in Informatica.',
      regione: 'Lombardia',
      provincia: 'Milano',
      link_esterno: null,
      sbocchi_professionali: 'Sviluppatrice software, Data Scientist, Esperta di Cybersecurity, UX/UI Designer.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Università degli Studi di Napoli Federico II',
      descrizione: 'Laurea triennale in Informatica.',
      regione: 'Campania',
      provincia: 'Napoli',
      link_esterno: null,
      sbocchi_professionali: 'Sviluppatrice software, Data Scientist, Esperta di Cybersecurity, UX/UI Designer.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Università Ca\' Foscari Venezia',
      descrizione: 'Laurea triennale in Informatica.',
      regione: 'Veneto',
      provincia: 'Venezia',
      link_esterno: null,
      sbocchi_professionali: 'Sviluppatrice software, Data Scientist, Esperta di Cybersecurity, UX/UI Designer.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Politecnico di Torino',
      descrizione: 'Laurea triennale in Informatica, Collegio di Ingegneria Informatica, del Cinema e Meccatronica.',
      regione: 'Piemonte',
      provincia: 'Torino',
      link_esterno: 'https://www.polito.it',
      sbocchi_professionali: 'Sviluppatrice software, Esperta di Cybersecurity, Data Scientist, UX/UI Designer.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Università di Pisa',
      descrizione: 'Laurea triennale in Informatica, Dipartimento di Informatica, tra i più antichi d\'Italia nel settore.',
      regione: 'Toscana',
      provincia: 'Pisa',
      link_esterno: 'https://www.unipi.it',
      sbocchi_professionali: 'Sviluppatrice software, Data Scientist, ricercatrice in informatica.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-31 - Scienze e Tecnologie Informatiche',
      nome: 'Informatica - Università degli Studi di Trento',
      descrizione: 'Laurea triennale in Informatica, con forte legame con il polo di ricerca Fondazione Bruno Kessler.',
      regione: 'Trentino-Alto Adige',
      provincia: 'Trento',
      link_esterno: 'https://www.unitn.it',
      sbocchi_professionali: 'Data Scientist, Sviluppatrice software, ricercatrice in informatica.',
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
      sbocchi_professionali: 'Ricercatrice in Fisica, Tecnica di laboratorio, insegnante di fisica, data scientist.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-30 - Scienze e Tecnologie Fisiche',
      nome: 'Fisica - Università di Pisa',
      descrizione: 'Laurea triennale in Fisica, storicamente legata alla Scuola Normale Superiore e all\'INFN.',
      regione: 'Toscana',
      provincia: 'Pisa',
      link_esterno: 'https://www.unipi.it',
      sbocchi_professionali: 'Ricercatrice in Fisica, Tecnica di laboratorio, fisica medica, data scientist.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-30 - Scienze e Tecnologie Fisiche',
      nome: 'Fisica - Università degli Studi di Padova',
      descrizione: 'Laurea triennale in Fisica, Dipartimento di Fisica e Astronomia "Galileo Galilei".',
      regione: 'Veneto',
      provincia: 'Padova',
      link_esterno: 'https://www.unipd.it',
      sbocchi_professionali: 'Ricercatrice in Fisica, Tecnica di laboratorio, fisica medica, data scientist.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-30 - Scienze e Tecnologie Fisiche',
      nome: 'Fisica - Università degli Studi di Trento',
      descrizione: 'Laurea triennale in Fisica, con possibilità di percorsi orientati alla fisica della materia e alle nanotecnologie.',
      regione: 'Trentino-Alto Adige',
      provincia: 'Trento',
      link_esterno: 'https://www.unitn.it',
      sbocchi_professionali: 'Ricercatrice in Fisica, Ricercatrice in Scienza dei Materiali, Tecnica di laboratorio.',
    },

    // --- L-27: Scienze e Tecnologie Chimiche ---
    {
      tipo: 'universita',
      indirizzo: 'L-27 - Scienze e Tecnologie Chimiche',
      nome: 'Chimica - Università di Bologna',
      descrizione: 'Laurea triennale in Chimica, con anche il distinto corso in Chimica Industriale.',
      regione: 'Emilia-Romagna',
      provincia: 'Bologna',
      link_esterno: 'https://www.unibo.it',
      sbocchi_professionali: 'Chimica industriale, Tecnica di laboratorio, ricercatrice in chimica.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-27 - Scienze e Tecnologie Chimiche',
      nome: 'Chimica - Sapienza Università di Roma',
      descrizione: 'Laurea triennale in Chimica, Facoltà di Scienze Matematiche, Fisiche e Naturali.',
      regione: 'Lazio',
      provincia: 'Roma',
      link_esterno: 'https://corsidilaurea.uniroma1.it',
      sbocchi_professionali: 'Chimica industriale, Tecnica di laboratorio, ricercatrice in chimica.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-27 - Scienze e Tecnologie Chimiche',
      nome: 'Chimica - Università degli Studi di Milano',
      descrizione: 'Laurea triennale in Chimica.',
      regione: 'Lombardia',
      provincia: 'Milano',
      link_esterno: null,
      sbocchi_professionali: 'Chimica industriale, Tecnica di laboratorio, ricercatrice in chimica.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-27 - Scienze e Tecnologie dei Materiali',
      nome: 'Scienza dei Materiali - Università degli Studi di Milano-Bicocca',
      descrizione: 'Laurea triennale in Scienza dei Materiali, tra i corsi italiani più affermati in questo campo.',
      regione: 'Lombardia',
      provincia: 'Milano',
      link_esterno: 'https://www.unimib.it',
      sbocchi_professionali: 'Ricercatrice in Scienza dei Materiali, Tecnica di laboratorio, ingegnera dei materiali.',
    },

    // --- L-30: Astronomia (corso specifico, non solo un curriculum interno a Fisica) ---
    {
      tipo: 'universita',
      indirizzo: 'L-30 - Astronomia',
      nome: 'Astronomia - Università di Bologna',
      descrizione: 'Laurea triennale in Astronomia, tra i pochissimi corsi italiani dedicati specificamente a questa disciplina fin dal primo anno.',
      regione: 'Emilia-Romagna',
      provincia: 'Bologna',
      link_esterno: 'https://www.unibo.it',
      sbocchi_professionali: 'Astrofisica, Data analyst per missioni spaziali, Divulgatrice scientifica in ambito astronomico.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-30 - Astronomia',
      nome: 'Astronomia - Università degli Studi di Padova',
      descrizione: 'Laurea triennale in Astronomia, presso uno dei dipartimenti di astronomia più antichi d\'Europa.',
      regione: 'Veneto',
      provincia: 'Padova',
      link_esterno: 'https://www.unipd.it',
      sbocchi_professionali: 'Astrofisica, Data analyst per missioni spaziali, Divulgatrice scientifica in ambito astronomico.',
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
      sbocchi_professionali: 'Ingegnera aerospaziale, Ingegnera dei sistemi spaziali, Project manager tecnico.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Aerospaziale)',
      nome: 'Ingegneria Aerospaziale - Politecnico di Torino',
      descrizione: 'Laurea triennale in Ingegneria Aerospaziale, con forti legami con il distretto aerospaziale piemontese.',
      regione: 'Piemonte',
      provincia: 'Torino',
      link_esterno: 'https://www.polito.it',
      sbocchi_professionali: 'Ingegnera aerospaziale, Ingegnera dei sistemi spaziali, Project manager tecnico.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Aerospaziale)',
      nome: 'Ingegneria Aerospaziale - Sapienza Università di Roma',
      descrizione: 'Laurea triennale in Ingegneria Aerospaziale, uno dei corsi storicamente più affermati in Italia nel settore.',
      regione: 'Lazio',
      provincia: 'Roma',
      link_esterno: 'https://corsidilaurea.uniroma1.it',
      sbocchi_professionali: 'Ingegnera aerospaziale, Ingegnera dei sistemi spaziali, ricercatrice in ambito spaziale.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Aerospaziale)',
      nome: 'Ingegneria Aerospaziale - Università degli Studi di Napoli Federico II',
      descrizione: 'Laurea triennale in Ingegneria Aerospaziale, nel cuore del Distretto Aerospaziale della Campania.',
      regione: 'Campania',
      provincia: 'Napoli',
      link_esterno: null,
      sbocchi_professionali: 'Ingegnera aerospaziale, Ingegnera dei sistemi spaziali, Project manager tecnico.',
    },

    // --- L-9: Ingegneria Industriale (curriculum Meccanico) ---
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Meccanico)',
      nome: 'Ingegneria Meccanica - Politecnico di Milano',
      descrizione: 'Laurea triennale in Ingegneria Meccanica, uno dei corsi più richiesti del Politecnico.',
      regione: 'Lombardia',
      provincia: 'Milano',
      link_esterno: 'https://www.polimi.it',
      sbocchi_professionali: 'Ingegnera meccanica, Project manager tecnico.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Meccanico)',
      nome: 'Ingegneria Meccanica - Politecnico di Torino',
      descrizione: 'Laurea triennale in Ingegneria Meccanica, con forte legame con il settore automotive piemontese.',
      regione: 'Piemonte',
      provincia: 'Torino',
      link_esterno: 'https://www.polito.it',
      sbocchi_professionali: 'Ingegnera meccanica, Project manager tecnico.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Meccanico)',
      nome: 'Ingegneria Meccanica - Università di Bologna',
      descrizione: 'Laurea triennale in Ingegneria Meccanica, presso la Scuola di Ingegneria e Architettura.',
      regione: 'Emilia-Romagna',
      provincia: 'Bologna',
      link_esterno: 'https://www.unibo.it',
      sbocchi_professionali: 'Ingegnera meccanica, Project manager tecnico.',
    },

    // --- L-9: Ingegneria Industriale (curriculum Energetico) ---
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Energetico)',
      nome: 'Ingegneria Energetica - Politecnico di Milano',
      descrizione: 'Laurea triennale in Ingegneria Energetica, Scuola di Ingegneria Industriale e dell\'Informazione.',
      regione: 'Lombardia',
      provincia: 'Milano',
      link_esterno: 'https://www.polimi.it',
      sbocchi_professionali: 'Ingegnera energetica, Project manager tecnico.',
    },
    {
      tipo: 'universita',
      indirizzo: 'L-9 - Ingegneria Industriale (curriculum Energetico)',
      nome: 'Ingegneria Energetica - Politecnico di Torino',
      descrizione: 'Laurea triennale in Ingegneria Energetica.',
      regione: 'Piemonte',
      provincia: 'Torino',
      link_esterno: 'https://www.polito.it',
      sbocchi_professionali: 'Ingegnera energetica, Project manager tecnico.',
    },
  ];

  // ==================== CARRIERE (professioni STEM per area) ====================
  // Finora questa categoria non era mai stata popolata (vedi limiti discussi
  // nel capitolo sul prototipo): qui una prima rassegna di professioni reali
  // per ciascuna delle quattro aree del Quiz, con le forme al femminile in
  // primo piano (coerentemente con l'obiettivo del progetto).
  const carriere = [
    // --- Informatica e programmazione ---
    {
      tipo: 'carriera',
      indirizzo: 'Informatica e programmazione',
      nome: 'Sviluppatrice software',
      descrizione: 'Progetta, scrive e testa il codice di applicazioni, siti web e sistemi software, spesso lavorando in team con altre sviluppatrici e sviluppatori. Si arriva tipicamente da una Laurea in Informatica o Ingegneria Informatica (classe L-31).',
      sbocchi_professionali: 'Software house, aziende tech, startup, reparti IT di aziende di ogni settore, libera professione.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Informatica e programmazione',
      nome: 'Data Scientist',
      descrizione: 'Analizza grandi quantità di dati per individuare pattern e informazioni utili a prendere decisioni, spesso utilizzando strumenti di intelligenza artificiale. Si arriva tipicamente da una Laurea in Informatica (classe L-31) o Fisica (classe L-30), spesso seguita da una specializzazione in data science.',
      sbocchi_professionali: 'Aziende tech, banche, aziende farmaceutiche, centri di ricerca, pubblica amministrazione.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Informatica e programmazione',
      nome: 'Esperta di Cybersecurity',
      descrizione: 'Protegge sistemi informatici e reti da attacchi e vulnerabilità, effettuando anche test di sicurezza (penetration testing). Si arriva tipicamente da una Laurea in Informatica o Ingegneria Informatica (classe L-31).',
      sbocchi_professionali: 'Aziende tech, banche, pubblica amministrazione, società di consulenza specializzata.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Informatica e programmazione',
      nome: 'UX/UI Designer',
      descrizione: 'Progetta interfacce digitali semplici e intuitive, studiando come le persone usano davvero siti e applicazioni. Si arriva spesso da una Laurea in Informatica (classe L-31), a volte affiancata da percorsi in design.',
      sbocchi_professionali: 'Software house, agenzie digitali, aziende tech, libera professione.',
    },

    // --- Fisica e chimica ---
    {
      tipo: 'carriera',
      indirizzo: 'Fisica e chimica',
      nome: 'Ricercatrice in Fisica',
      descrizione: 'Studia fenomeni naturali attraverso esperimenti e modelli teorici, spesso in centri di ricerca internazionali come il CERN o l\'INFN. Si arriva tipicamente da una Laurea in Fisica (classe L-30), proseguita con laurea magistrale e dottorato.',
      sbocchi_professionali: 'Università, enti di ricerca (INFN, CNR), centri di ricerca internazionali, industria high-tech.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Fisica e chimica',
      nome: 'Chimica industriale',
      descrizione: 'Sviluppa e controlla processi produttivi in ambito chimico, farmaceutico o dei materiali, garantendo qualità e sicurezza. Si arriva tipicamente da una Laurea in Chimica (classe L-27).',
      sbocchi_professionali: 'Industria chimica e farmaceutica, aziende cosmetiche, aziende alimentari.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Fisica e chimica',
      nome: 'Tecnica di laboratorio',
      descrizione: 'Esegue analisi ed esperimenti in laboratori scientifici, ospedalieri o industriali, garantendo la precisione dei risultati. Si arriva da una Laurea in Fisica o Chimica (classi L-30 o L-27).',
      sbocchi_professionali: 'Ospedali e laboratori di analisi, università, industria chimica e farmaceutica.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Fisica e chimica',
      nome: 'Ricercatrice in Scienza dei Materiali',
      descrizione: 'Studia e sviluppa nuovi materiali per l\'industria, l\'energia o la medicina, al confine tra fisica, chimica e ingegneria. Si arriva tipicamente da una Laurea in Scienza dei Materiali (classe L-27).',
      sbocchi_professionali: 'Centri di ricerca, industria dei materiali avanzati, settore energetico e automotive.',
    },

    // --- Astrofisica e spazio ---
    {
      tipo: 'carriera',
      indirizzo: 'Astrofisica e spazio',
      nome: 'Astrofisica',
      descrizione: 'Studia stelle, galassie e l\'universo attraverso osservazioni telescopiche e modelli teorici, spesso in centri di ricerca dedicati. Si arriva tipicamente da una Laurea in Astronomia o Fisica (classe L-30), proseguita con laurea magistrale e dottorato.',
      sbocchi_professionali: 'INAF (Istituto Nazionale di Astrofisica), università, osservatori astronomici, centri di ricerca internazionali.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Astrofisica e spazio',
      nome: 'Ingegnera dei sistemi spaziali',
      descrizione: 'Progetta satelliti, strumentazione scientifica e sistemi per missioni spaziali, lavorando spesso in team internazionali. Si arriva tipicamente da una Laurea in Ingegneria Aerospaziale (classe L-9).',
      sbocchi_professionali: 'Agenzia Spaziale Italiana (ASI), Agenzia Spaziale Europea (ESA), aziende aerospaziali.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Astrofisica e spazio',
      nome: 'Data analyst per missioni spaziali',
      descrizione: 'Analizza i dati raccolti da telescopi, satelliti e sonde per estrarre nuove conoscenze scientifiche. Si arriva da una Laurea in Astronomia o Fisica (classe L-30).',
      sbocchi_professionali: 'Centri di ricerca spaziale, INAF, agenzie spaziali, università.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Astrofisica e spazio',
      nome: 'Divulgatrice scientifica in ambito astronomico',
      descrizione: 'Comunica la scienza al grande pubblico attraverso planetari, musei, eventi e contenuti digitali, rendendo l\'astronomia accessibile a tutti. Si arriva spesso da una Laurea in Astronomia o Fisica (classe L-30).',
      sbocchi_professionali: 'Planetari, musei della scienza, testate giornalistiche scientifiche, enti di divulgazione.',
    },

    // --- Ingegneria e progettazione ---
    {
      tipo: 'carriera',
      indirizzo: 'Ingegneria e progettazione',
      nome: 'Ingegnera aerospaziale',
      descrizione: 'Progetta aerei, satelliti e veicoli spaziali, occupandosi di aerodinamica, strutture e sistemi di propulsione. Si arriva tipicamente da una Laurea in Ingegneria Aerospaziale (classe L-9).',
      sbocchi_professionali: 'Aziende aerospaziali, agenzie spaziali, centri di ricerca, industria della difesa.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Ingegneria e progettazione',
      nome: 'Ingegnera meccanica',
      descrizione: 'Progetta macchine, motori e sistemi meccanici, dalla fase di ideazione a quella di produzione e collaudo. Si arriva tipicamente da una Laurea in Ingegneria Meccanica (classe L-9).',
      sbocchi_professionali: 'Industria manifatturiera, automotive, settore energetico, studi di progettazione.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Ingegneria e progettazione',
      nome: 'Ingegnera energetica',
      descrizione: 'Progetta impianti e sistemi per la produzione, la distribuzione e la gestione efficiente dell\'energia, comprese le fonti rinnovabili. Si arriva tipicamente da una Laurea in Ingegneria Energetica (classe L-9).',
      sbocchi_professionali: 'Aziende energetiche, impianti di produzione di energia rinnovabile, società di consulenza tecnica.',
    },
    {
      tipo: 'carriera',
      indirizzo: 'Ingegneria e progettazione',
      nome: 'Project manager tecnico',
      descrizione: 'Coordina team e progetti in ambito ingegneristico e industriale, tenendo insieme aspetti tecnici, tempi e risorse. Si arriva da una qualsiasi Laurea in Ingegneria Industriale (classe L-9: meccanica, aerospaziale o energetica), spesso dopo qualche anno di esperienza tecnica.',
      sbocchi_professionali: 'Aziende industriali, studi di ingegneria, società di consulenza, pubblica amministrazione.',
    },
  ];

  const tutteLeVoci = [...contenuti, ...carriere];

  const stmt = db.prepare(`
    INSERT INTO mappe_contenuti (tipo, tipo_istituto, indirizzo, nome, descrizione, regione, provincia, link_esterno, sbocchi_professionali)
    VALUES (@tipo, @tipo_istituto, @indirizzo, @nome, @descrizione, @regione, @provincia, @link_esterno, @sbocchi_professionali)
  `);

  for (const c of tutteLeVoci) {
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

  console.log(`${tutteLeVoci.length} contenuti inseriti nella tabella mappe_contenuti (di cui ${carriere.length} carriere).`);
}