import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Richiesta della prof: "controllo automatico preliminare dell'accessibilità"
// e "test responsive su almeno tre dimensioni di schermo". Questo file
// copre entrambi insieme: ogni test qui sotto viene eseguito automaticamente
// una volta per ciascuno dei 3 "projects" definiti in playwright.config.js
// (mobile/tablet/desktop) -- non serve ripetere il codice per ogni schermo.
//
// Un utente finto (via localStorage, non tramite una vera registrazione)
// per poter controllare anche le pagine che richiedono un profilo, come
// Quiz e Chat. L'id non deve esistere davvero: queste pagine leggono il
// profilo dal browser, non verificano lato server che l'id sia reale.
const UTENTE_FINTO = {
  id: 999999,
  nome: 'Utente Di Prova E2E',
  eta: 17,
livello_scolastico: 'scuola_secondaria_secondo_grado'
};

async function comeUtenteRegistrata(page) {
  await page.addInitScript((utente) => {
    localStorage.setItem('stementor_utente', JSON.stringify(utente));
  }, UTENTE_FINTO);
}

// Verifica di accessibilità automatica con axe-core. Le violazioni di
// impatto "critical"/"serious" fanno fallire il test; quelle "moderate"/
// "minor" vengono solo segnalate in console, perché spesso richiedono un
// giudizio umano (es. un contrasto colore borderline) più che una vera
// correzione urgente -- consistente con quanto detto alla prof: il
// controllo automatico è un PRIMO passaggio, non sostituisce una verifica
// WCAG completa.
async function controllaAccessibilita(page, nomePagina) {
  const risultati = await new AxeBuilder({ page }).analyze();

  const gravi = risultati.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  const lievi = risultati.violations.filter((v) => v.impact === 'moderate' || v.impact === 'minor');

  if (lievi.length > 0) {
    console.log(`[${nomePagina}] violazioni lievi/moderate da rivedere a mano:`,
      lievi.map((v) => `${v.id} (${v.impact}): ${v.help}`));
  }

  expect(
    gravi,
    `${nomePagina} ha violazioni di accessibilità gravi:\n` +
      gravi.map((v) => `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elementi coinvolti)`).join('\n')
  ).toEqual([]);
}

// Verifica responsive minima ma oggettiva: la pagina non deve mai
// costringere a scorrere ORIZZONTALMENTE, a nessuna delle 3 dimensioni di
// schermo -- è il sintomo più comune di un layout che non si adatta bene.
async function nessunOverflowOrizzontale(page, nomePagina) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    scrollWidth,
    `${nomePagina}: la pagina scorre in orizzontale (contenuto largo ${scrollWidth}px, schermo largo ${clientWidth}px)`
  ).toBeLessThanOrEqual(clientWidth + 2); // +2px di tolleranza per arrotondamenti
}

test.describe('Home', () => {
  test('accessibilità e responsive (utente non registrata)', async ({ page }) => {
    await page.goto('/');
    await controllaAccessibilita(page, 'Home (anonima)');
    await nessunOverflowOrizzontale(page, 'Home (anonima)');
  });

  test('accessibilità e responsive (utente registrata)', async ({ page }) => {
    await comeUtenteRegistrata(page);
    await page.goto('/');
    await controllaAccessibilita(page, 'Home (registrata)');
    await nessunOverflowOrizzontale(page, 'Home (registrata)');
  });
});

test.describe('Galleria Avatar', () => {
  test('accessibilità e responsive', async ({ page }) => {
    await page.goto('/avatar');
    // Attende che la galleria abbia finito di caricare gli avatar dal server
    await page.waitForSelector('.gallery-card', { timeout: 10000 }).catch(() => {});
    await controllaAccessibilita(page, 'Galleria Avatar');
    await nessunOverflowOrizzontale(page, 'Galleria Avatar');
  });
});

test.describe('Mappe di orientamento', () => {
  test('accessibilità e responsive (scheda Scuole)', async ({ page }) => {
    await page.goto('/mappe');
    await controllaAccessibilita(page, 'Mappe - Scuole');
    await nessunOverflowOrizzontale(page, 'Mappe - Scuole');
  });

  test('accessibilità e responsive (scheda Università)', async ({ page }) => {
    await page.goto('/mappe');
    await page.getByRole('button', { name: 'Università' }).click();
    await controllaAccessibilita(page, 'Mappe - Università');
    await nessunOverflowOrizzontale(page, 'Mappe - Università');
  });

  test('accessibilità e responsive (scheda Percorsi di carriera)', async ({ page }) => {
    await page.goto('/mappe');
    await page.getByRole('button', { name: 'Percorsi di carriera' }).click();
    await controllaAccessibilita(page, 'Mappe - Carriere');
    await nessunOverflowOrizzontale(page, 'Mappe - Carriere');
  });
});

test.describe('Quiz di orientamento', () => {
  test('accessibilità e responsive (prima domanda)', async ({ page }) => {
    await comeUtenteRegistrata(page);
    await page.goto('/quiz');
    await controllaAccessibilita(page, 'Quiz - prima domanda');
    await nessunOverflowOrizzontale(page, 'Quiz - prima domanda');
  });
});

test.describe('Chat con una mentor', () => {
  let avatarId;

  test.beforeAll(async ({ request }) => {
    // Recupera un id di avatar reale dal server, invece di indovinarlo --
    // gli id dipendono dall'ordine in cui sono stati inseriti nel database.
    const risposta = await request.get('/api/avatars');
    const avatars = await risposta.json();
    if (avatars.length === 0) {
      throw new Error('Nessun avatar nel database -- hai lanciato "node db/setup.js" nel backend?');
    }
    avatarId = avatars[0].id;
  });

  test('accessibilità e responsive', async ({ page }) => {
    await comeUtenteRegistrata(page);
    await page.goto(`/chat/${avatarId}`);
    // Attende che la pagina abbia caricato l'avatar (non lo stato "Caricamento...")
    await page.waitForSelector('.chat-layout', { timeout: 10000 }).catch(() => {});
    await controllaAccessibilita(page, 'Chat');
    await nessunOverflowOrizzontale(page, 'Chat');
  });
});