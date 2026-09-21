import {
  ADA_MOTORE,
  MARIE_MOTORE,
  MARGHERITA_MOTORE,
  SAMANTHA_MOTORE,
} from '../avatar/scientists.js';

// Configurazione grafica di ogni mentor, indicizzata per nome (lo stesso
// nome della tabella `avatars` del database).
//   colore        colore di accento dell'interfaccia
//   motore        avatar a layer (occhi, bocca e pose separati): vedi scientists.js
//   figuraIntera  mostrata a figura intera all'apertura della chat, finche'
//                 non inizia il dialogo (e di nuovo quando la conversazione
//                 viene eliminata)
export const AVATAR_VISEMI = {

  'Ada Lovelace': {
    colore: '#7B6EF6',
    motore: ADA_MOTORE,
    figuraIntera: '/immagini/ada/ada-figura-intera.jpg',
  },

  'Marie Curie': {
    colore: '#FF7A45',
    motore: MARIE_MOTORE,
    figuraIntera: '/immagini/marie/marie-figura-intera.jpg',
  },

  'Margherita Hack': {
    colore: '#4ECDC4',
    motore: MARGHERITA_MOTORE,
    figuraIntera: '/immagini/margherita/margherita-figura-intera.jpg',
  },

  'Samantha Cristoforetti': {
    colore: '#FFC24B',
    motore: SAMANTHA_MOTORE,
    figuraIntera: '/immagini/samantha/samantha-figura-intera.jpg',
  },
};
