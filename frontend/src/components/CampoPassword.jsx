import { useState } from 'react';

// Campo password riutilizzabile con bottone "Mostra/Nascondi", da usare
// al posto di <input type="password" /> in tutti i form del progetto.

function CampoPassword({ value, onChange, placeholder, disabled }) {
  const [visibile, setVisibile] = useState(false);

  return (
    <div className="campo-password-wrapper">
      <input
        type={visibile ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        className="campo-password-toggle"
        onClick={() => setVisibile((v) => !v)}
        tabIndex={-1}
      >
        {visibile ? 'Nascondi' : 'Mostra'}
      </button>
    </div>
  );
}

export default CampoPassword;
