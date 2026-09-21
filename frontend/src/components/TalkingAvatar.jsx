import { forwardRef } from 'react';

import { AVATAR_VISEMI } from '../data/avatarVisemes.js';
import LayeredAvatar from './LayeredAvatar.jsx';

// Punto d'ingresso unico usato da Chat e Galleria: props
// nome/variant/width/height/onStateChange, metodi parla()/ferma()/pensa()/
// prepara()/inAscolto() (vedi LayeredAvatar).
//
// Se una mentor non ha ancora la configurazione grafica in
// data/avatarVisemes.js (es. e' stata aggiunta al database ma non agli
// asset), mostra un riquadro vuoto invece di far crashare la pagina:
// il ref resta null e i chiamanti usano gia' l'optional chaining.
const TalkingAvatar = forwardRef((props, ref) => {
  const config = AVATAR_VISEMI[props.nome];

  if (!config?.motore) {
    console.warn(`Nessuna configurazione avatar per "${props.nome}" (data/avatarVisemes.js).`);

    const { variant = 'gallery', width = '100%', height = 300 } = props;
    return (
      <div
        className={`talking-avatar talking-avatar--${variant}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
        role="img"
        aria-label={props.nome}
      />
    );
  }

  return <LayeredAvatar {...props} config={config} ref={ref} />;
});

TalkingAvatar.displayName = 'TalkingAvatar';

export default TalkingAvatar;
