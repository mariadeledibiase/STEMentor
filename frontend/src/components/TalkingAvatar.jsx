import {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';

import { AVATAR_VISEMI } from '../data/avatarVisemes.js';

const PROFILI_VOCALI = {
  'Ada Lovelace': { preferenzaVoce: 'elsa', pitch: 1.1, rate: 1.0 },
  'Marie Curie': { preferenzaVoce: 'google italiano', pitch: 0.95, rate: 0.95 },
  'Margherita Hack': { preferenzaVoce: 'elsa', pitch: 0.85, rate: 1.08 },
  'Samantha Cristoforetti': { preferenzaVoce: 'google italiano', pitch: 1.2, rate: 1.1 },
};

const NOMI_VOCE_MASCHILE_IT = [
  'cosimo', 'diego', 'luca', 'marco', 'paolo', 'giorgio', 'roberto',
];

const CORREZIONI_PRONUNCIA = [
  [/Lovelace/gi, 'Lovleis'],
];

function trovaVoce(nome) {
  const voci = window.speechSynthesis.getVoices();
  const italiane = voci.filter(
    (v) => v.lang && v.lang.toLowerCase().startsWith('it')
  );

  if (italiane.length === 0) return null;

  const profilo = PROFILI_VOCALI[nome];

  if (profilo?.preferenzaVoce) {
    const preferita = italiane.find((v) =>
      v.name.toLowerCase().includes(profilo.preferenzaVoce)
    );
    if (preferita) return preferita;
  }

  const nonMaschili = italiane.filter(
    (v) => !NOMI_VOCE_MASCHILE_IT.some(
      (n) => v.name.toLowerCase().includes(n)
    )
  );

  return (nonMaschili.length ? nonMaschili : italiane)[0];
}

function correggiPronuncia(testo) {
  return CORREZIONI_PRONUNCIA.reduce(
    (acc, [pattern, sostituzione]) => acc.replace(pattern, sostituzione),
    testo
  );
}

function stimaDurataMs(testo, rate) {
  const parole = testo.trim().split(/\s+/).filter(Boolean).length;
  return (parole / (2.5 * rate)) * 1000 + 3000;
}

const TalkingAvatar = forwardRef(
  (
    {
      nome,
      variant = 'gallery',
      width = '100%',
      height = 300,
      onStateChange,
    },
    ref
  ) => {
    const [parlando, setParlando] = useState(false);
    const [frameBocca, setFrameBocca] = useState(0);

    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    const config = AVATAR_VISEMI[nome];

    const setStatoParlato = (valore) => {
      setParlando(valore);
      onStateChange?.(valore);
    };

    const pulisciTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const fermaTutto = () => {
      pulisciTimer();
      setFrameBocca(0);
      setStatoParlato(false);
    };

    useImperativeHandle(ref, () => ({
      parla(testo) {
        if (!window.speechSynthesis || !config || !testo?.trim()) return;

        window.speechSynthesis.cancel();
        fermaTutto();

        const avviaDiscorso = () => {
          const testoCorretto = correggiPronuncia(testo);
          const utterance = new SpeechSynthesisUtterance(testoCorretto);
          const profilo = PROFILI_VOCALI[nome] || { pitch: 1, rate: 1 };

          utterance.lang = 'it-IT';
          utterance.pitch = profilo.pitch;
          utterance.rate = profilo.rate;

          const voce = trovaVoce(nome);
          if (voce) utterance.voice = voce;

          utterance.onstart = () => {
            setStatoParlato(true);
            setFrameBocca(0);

            intervalRef.current = setInterval(() => {
              setFrameBocca(
                (prev) => (prev + 1) % config.framesParlato.length
              );
            }, 190);

            timeoutRef.current = setTimeout(() => {
              window.speechSynthesis.cancel();
              fermaTutto();
            }, stimaDurataMs(testoCorretto, profilo.rate));
          };

          utterance.onend = fermaTutto;
          utterance.onerror = fermaTutto;

          window.speechSynthesis.speak(utterance);
        };

        const avvia = () => setTimeout(avviaDiscorso, 60);

        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null;
            avvia();
          };
        } else {
          avvia();
        }
      },

      ferma() {
        window.speechSynthesis?.cancel();
        fermaTutto();
      },

      inAscolto() {
        return parlando;
      },
    }));

    if (!config) {
      return <div>Avatar "{nome}" non trovato.</div>;
    }

    const baseImage =
      variant === 'chat'
        ? config.immagineIdle
        : config.immagineGallery;

    const speakingImage =
      config.framesParlato[frameBocca] || config.framesParlato[0];

    const dimensione = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      '--avatar-color': config.colore,
    };

    return (
      <div
        className={`talking-avatar talking-avatar--${variant} ${
          parlando ? 'talking-avatar--speaking' : ''
        }`}
        style={dimensione}
      >
        <div className="talking-avatar-layer talking-avatar-layer--base">
          <img src={baseImage} alt={nome} className="talking-avatar-img" />
        </div>

        <div className="talking-avatar-layer talking-avatar-layer--speaking">
          <img
            src={speakingImage}
            alt={`${nome} mentre parla`}
            className="talking-avatar-img"
          />
        </div>

        {variant === 'chat' && parlando && (
          <div className="talking-avatar-speaking-ui">
            <div className="talking-wave" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <span>{nome.split(' ')[0]} sta parlando...</span>
          </div>
        )}
      </div>
    );
  }
);

TalkingAvatar.displayName = 'TalkingAvatar';

export default TalkingAvatar;
