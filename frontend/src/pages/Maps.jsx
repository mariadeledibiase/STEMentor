import { useState, useEffect } from 'react';

// Mappe interattive (§3.2). Le SCUOLE sono organizzate per tipo di istituto
// (Liceo / Istituto Tecnico / Istituto Professionale) e indirizzo, con
// filtro per regione/provincia. Le UNIVERSITÀ sono organizzate per classe
// di laurea (es. L-31), con gli sbocchi professionali collegati.

const TIPI = [
  { valore: 'scuola', etichetta: 'Scuola Secondaria di secondo grado' },
  { valore: 'universita', etichetta: 'Università' },
  { valore: 'carriera', etichetta: 'Percorsi di carriera' },
];

function Maps() {
  const [tipoAttivo, setTipoAttivo] = useState('scuola');

  const [opzioniFiltro, setOpzioniFiltro] = useState({ tipiIstituto: [], indirizzi: [], regioni: [] });
  const [filtroTipoIstituto, setFiltroTipoIstituto] = useState('');
  const [filtroIndirizzo, setFiltroIndirizzo] = useState('');
  const [filtroRegione, setFiltroRegione] = useState('');

  const [contenuti, setContenuti] = useState([]);
  const [caricando, setCaricando] = useState(true);

  // Quando cambia il tipo (scuola/università/carriera), azzeriamo i filtri
  // e scopriamo quali opzioni di filtro esistono davvero per quel tipo.
  useEffect(() => {
    setFiltroTipoIstituto('');
    setFiltroIndirizzo('');
    setFiltroRegione('');

    fetch(`/api/maps/${tipoAttivo}/opzioni-filtro`)
      .then((res) => res.json())
      .then(setOpzioniFiltro)
      .catch((err) => console.error('Errore nel recupero delle opzioni filtro:', err));
  }, [tipoAttivo]);

  // Ricarica i contenuti ogni volta che cambia un filtro
  useEffect(() => {
    setCaricando(true);
    const parametri = new URLSearchParams();
    if (filtroTipoIstituto) parametri.set('tipo_istituto', filtroTipoIstituto);
    if (filtroIndirizzo) parametri.set('indirizzo', filtroIndirizzo);
    if (filtroRegione) parametri.set('regione', filtroRegione);

    fetch(`/api/maps/${tipoAttivo}?${parametri.toString()}`)
      .then((res) => res.json())
      .then(setContenuti)
      .catch((err) => console.error('Errore nel recupero delle mappe:', err))
      .finally(() => setCaricando(false));
  }, [tipoAttivo, filtroTipoIstituto, filtroIndirizzo, filtroRegione]);

  return (
    <div className="maps-page">
      <h1>Mappe di orientamento</h1>
      <p className="section-subtitle">
        Esplora scuole, università e percorsi di carriera in ambito STEM.
      </p>

      <div className="maps-tabs">
        {TIPI.map((t) => (
          <button
            key={t.valore}
            className={`maps-tab ${tipoAttivo === t.valore ? 'maps-tab-attivo' : ''}`}
            onClick={() => setTipoAttivo(t.valore)}
          >
            {t.etichetta}
          </button>
        ))}
      </div>

      {tipoAttivo === 'scuola' && (
        <div className="maps-filtri-riga">
          <select aria-label="Filtra per tipo di istituto" value={filtroTipoIstituto} onChange={(e) => setFiltroTipoIstituto(e.target.value)}>
            <option value="">Tutti i tipi di istituto</option>
            {opzioniFiltro.tipiIstituto.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select aria-label="Filtra per indirizzo di studio" value={filtroIndirizzo} onChange={(e) => setFiltroIndirizzo(e.target.value)}>
            <option value="">Tutti gli indirizzi</option>
            {opzioniFiltro.indirizzi.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <select aria-label="Filtra per regione" value={filtroRegione} onChange={(e) => setFiltroRegione(e.target.value)}>
            <option value="">Tutta Italia</option>
            {opzioniFiltro.regioni.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {tipoAttivo === 'universita' && (
        <div className="maps-filtri-riga">
          <select aria-label="Filtra per classe di laurea" value={filtroIndirizzo} onChange={(e) => setFiltroIndirizzo(e.target.value)}>
            <option value="">Tutte le classi di laurea</option>
            {opzioniFiltro.indirizzi.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <select aria-label="Filtra per regione" value={filtroRegione} onChange={(e) => setFiltroRegione(e.target.value)}>
            <option value="">Tutta Italia</option>
            {opzioniFiltro.regioni.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {caricando ? (
        <p className="maps-vuoto">Caricamento...</p>
      ) : contenuti.length === 0 ? (
        <p className="maps-vuoto">Nessun contenuto trovato per questo filtro.</p>
      ) : (
        <div className="maps-lista">
          {contenuti.map((c) => (
            <div key={c.id} className="maps-card">
              <div className="maps-card-header">
                <div>
                  <h3>{c.nome}</h3>
                  {c.indirizzo && <p className="maps-card-indirizzo">{c.indirizzo}</p>}
                </div>
                {(c.regione || c.provincia) && (
                  <span className="maps-card-regione">
                    {[c.provincia, c.regione].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>

              <p>{c.descrizione}</p>

              {c.sbocchi_professionali && (
                <p className="maps-card-sbocchi">
                  <strong>Sbocchi:</strong> {c.sbocchi_professionali}
                </p>
              )}

              {c.link_esterno && (
                <a href={c.link_esterno} target="_blank" rel="noopener noreferrer" className="maps-card-link">
                  Scopri di più →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Maps;
