import { useState } from 'react';

// STRUMENTO TEMPORANEO -- usalo una volta per trovare le coordinate della
// bocca di ogni avatar, poi puoi cancellare questo file.
// Aggiungilo a una route temporanea, es. in App.jsx:
//   <Route path="/calibra" element={<MouthCalibrator />} />
// poi vai su localhost:5173/calibra

const IMMAGINI = [
  { nome: 'Ada Lovelace', file: '/immagini/ada-lovelace.jpg' },
  { nome: 'Marie Curie', file: '/immagini/marie-curie.jpg' },
  { nome: 'Margherita Hack', file: '/immagini/margherita-hack.jpg' },
  { nome: 'Samantha Cristoforetti', file: '/immagini/samantha-cristoforetti.jpg' },
];

function MouthCalibrator() {
  const [indice, setIndice] = useState(0);
  const [coordinate, setCoordinate] = useState({});

  const avatar = IMMAGINI[indice];

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    setCoordinate((prev) => ({
      ...prev,
      [avatar.nome]: { top: yPercent.toFixed(1), left: xPercent.toFixed(1) },
    }));
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Calibrazione bocca: {avatar.nome}</h2>
      <p>Clicca esattamente al centro della bocca nell'immagine qui sotto.</p>

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={avatar.file}
          alt={avatar.nome}
          onClick={handleClick}
          style={{ maxWidth: '400px', cursor: 'crosshair', display: 'block' }}
        />
        {coordinate[avatar.nome] && (
          <div
            style={{
              position: 'absolute',
              top: `${coordinate[avatar.nome].top}%`,
              left: `${coordinate[avatar.nome].left}%`,
              width: '10px',
              height: '10px',
              background: 'red',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {coordinate[avatar.nome] && (
        <p>
          Coordinate: <strong>top: {coordinate[avatar.nome].top}%, left: {coordinate[avatar.nome].left}%</strong>
        </p>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <button
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
        >
          ← Precedente
        </button>
        <button
          onClick={() => setIndice((i) => Math.min(IMMAGINI.length - 1, i + 1))}
          disabled={indice === IMMAGINI.length - 1}
          style={{ marginLeft: '1rem' }}
        >
          Successivo →
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h3>Riepilogo di tutte le coordinate trovate finora:</h3>
      <pre style={{ textAlign: 'left', background: '#f0f0f0', padding: '1rem', display: 'inline-block' }}>
        {JSON.stringify(coordinate, null, 2)}
      </pre>
      <p>Quando hai cliccato su tutte e 4, copia questo blocco e mandamelo in chat.</p>
    </div>
  );
}

export default MouthCalibrator;