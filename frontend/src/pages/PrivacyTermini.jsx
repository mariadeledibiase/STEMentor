function PrivacyTermini() {
  return (
    <div className="privacy-page">
      <h1>Privacy e Termini di utilizzo</h1>
      <p className="privacy-data-agg">Ultimo aggiornamento: prototipo di tesi -- Settembre 2026</p>

      <section>
        <h2>1. Chi siamo</h2>
        <p>
          STEMentor è un prototipo sviluppato nell'ambito di una tesi di laurea
          (Università di Camerino), con l'obiettivo di aiutare studentesse di
          Scuola Secondaria di primo grado e Scuola Secondaria di secondo grado a orientarsi verso le discipline STEM
          (Scienza, Tecnologia, Ingegneria, Matematica).
        </p>
      </section>

      <section>
        <h2>2. Quali dati raccogliamo</h2>
        <ul>
          <li>Nome, email e password (cifrata, mai salvata in chiaro)</li>
          <li>Età e livello scolastico</li>
          <li>Indirizzo scolastico (facoltativo)</li>
          <li>Le conversazioni con gli avatar e i risultati del quiz di orientamento</li>
        </ul>
      </section>

      <section>
        <h2>3. Perché li raccogliamo</h2>
        <p>
          Usiamo questi dati esclusivamente per personalizzare le conversazioni
          con gli avatar (adattando linguaggio ed esempi alla tua età e al tuo
          percorso) e per mostrarti i tuoi risultati precedenti quando torni
          sulla piattaforma.
        </p>
      </section>

      <section>
        <h2>4. Intelligenza artificiale</h2>
        <p>
          Gli avatar con cui parli non sono persone reali: sono generati da un
          modello di intelligenza artificiale (Google Gemini), a cui viene
          fornito un profilo di personalità basato su figure storiche o
          contemporanee della scienza. Le risposte possono contenere
          imprecisioni: non sostituiscono un vero consulente di orientamento
          scolastico.
        </p>
        <p>
          Per generare le risposte, i messaggi della conversazione, la tua età
          e il tuo livello scolastico vengono inviati a Google (Gemini). La
          voce delle mentor è prodotta da un servizio di sintesi vocale di
          Microsoft (Azure AI Speech), a cui viene inviato solo il testo della
          risposta da leggere. Il tuo nome e la tua email non vengono inviati
          a nessuno dei due servizi. Per questo motivo ti consigliamo di non
          scrivere nella chat dati personali (come cognome, indirizzo o
          numeri di telefono).
        </p>
      </section>

      <section>
        <h2>5. Utenti minori di 14 anni</h2>
        <p>
          In conformità al GDPR (art. 8) e al D.Lgs. 101/2018, per gli utenti
          sotto i 14 anni è richiesto il consenso di un genitore o tutore al
          momento della registrazione.
        </p>
      </section>

      <section>
        <h2>6. I tuoi diritti</h2>
        <p>
          Puoi in qualsiasi momento modificare i tuoi dati dalla pagina{' '}
          <a href="/profilo">Profilo</a>. Da lì puoi anche eliminare
          definitivamente il tuo account, inserendo la password: verranno
          cancellati il profilo, tutte le conversazioni e i risultati del
          quiz. Puoi inoltre eliminare la singola conversazione con una
          mentor direttamente dalla pagina della chat.
        </p>
      </section>

      <section>
        <h2>7. Limiti del prototipo (trasparenza)</h2>
        <p>
          Questo è un prototipo di tesi, non un servizio commerciale. Alcune
          funzionalità sono semplificate: ad esempio il recupero password non
          invia una vera email (il link viene mostrato direttamente a
          schermo), e i dati sono conservati su un database locale, non su
          un'infrastruttura di produzione.
        </p>
      </section>
    </div>
  );
}

export default PrivacyTermini;
