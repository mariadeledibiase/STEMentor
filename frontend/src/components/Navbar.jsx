import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getUtente, rimuoviUtente } from '../data/utenteCorrente.js';

function Navbar() {
  const utente = getUtente();
  const [menuAperto, setMenuAperto] = useState(false);

  const esci = () => {
    rimuoviUtente();
    window.location.href = '/';
  };

  const navClass = ({ isActive }) =>
    isActive ? 'navbar-link navbar-link--active' : 'navbar-link';

  const chiudiMenu = () => setMenuAperto(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* LOGO */}
        <Link to="/" className="navbar-brand" onClick={chiudiMenu}>
          <img
            src="/immagini/stementor-logo-navbar.png"
            alt="STEMentor"
            className="navbar-logo"
          />
        </Link>

        {/* NAVIGAZIONE DESKTOP */}
        <div className="navbar-links">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          {utente && (
            <>
              <NavLink to="/avatar" className={navClass}>
                Mentor
              </NavLink>

              <NavLink to="/quiz" className={navClass}>
                Quiz
              </NavLink>

              <NavLink to="/mappe" className={navClass}>
                Percorsi
              </NavLink>

              <NavLink to="/profilo" className={navClass}>
                Profilo
              </NavLink>
            </>
          )}
        </div>

        {/* AZIONI DESTRA */}
        <div className="navbar-actions">
          {utente ? (
            <>
              <span className="navbar-hello">
                Ciao, {utente.nome.split(' ')[0]}
              </span>

              <button
                className="navbar-esci"
                type="button"
                onClick={esci}
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <Link to="/accedi" className="navbar-login">
                Accedi
              </Link>

              <Link to="/registrati" className="navbar-register">
                Inizia
              </Link>
            </>
          )}
        </div>

        {/* MENU MOBILE */}
        <button
          className={`mobile-menu-button ${
            menuAperto ? 'mobile-menu-button--open' : ''
          }`}
          type="button"
          aria-label={menuAperto ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={menuAperto}
          onClick={() => setMenuAperto((prev) => !prev)}
        >
          <span />
          <span />
        </button>
      </div>

      {/* MENU MOBILE APERTO */}
      {menuAperto && (
        <div className="mobile-menu">
          <NavLink
            to="/"
            className={navClass}
            onClick={chiudiMenu}
          >
            Home
          </NavLink>

          {utente ? (
            <>
              <NavLink
                to="/avatar"
                className={navClass}
                onClick={chiudiMenu}
              >
                Mentor
              </NavLink>

              <NavLink
                to="/quiz"
                className={navClass}
                onClick={chiudiMenu}
              >
                Quiz
              </NavLink>

              <NavLink
                to="/mappe"
                className={navClass}
                onClick={chiudiMenu}
              >
                Percorsi
              </NavLink>

              <NavLink
                to="/profilo"
                className={navClass}
                onClick={chiudiMenu}
              >
                Profilo
              </NavLink>

              <button
                className="mobile-menu-logout"
                type="button"
                onClick={esci}
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/accedi"
                className={navClass}
                onClick={chiudiMenu}
              >
                Accedi
              </NavLink>

              <NavLink
                to="/registrati"
                className="mobile-menu-primary"
                onClick={chiudiMenu}
              >
                Inizia
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;