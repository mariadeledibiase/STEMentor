import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import AvatarGallery from './pages/AvatarGallery.jsx';
import Chat from './pages/Chat.jsx';
import Quiz from './pages/Quiz.jsx';
import Maps from './pages/Maps.jsx';
import Registrazione from './pages/Registrazione.jsx';
import Accedi from './pages/Accedi.jsx';
import Profilo from './pages/Profilo.jsx';
import RecuperaPassword from './pages/RecuperaPassword.jsx';
import ReimpostaPassword from './pages/ReimpostaPassword.jsx';
import PrivacyTermini from './pages/PrivacyTermini.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/avatar" element={<AvatarGallery />} />
          <Route path="/chat/:avatarId" element={<Chat />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/mappe" element={<Maps />} />
          <Route path="/registrati" element={<Registrazione />} />
          <Route path="/accedi" element={<Accedi />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/recupera-password" element={<RecuperaPassword />} />
          <Route path="/reimposta-password" element={<ReimpostaPassword />} />
          <Route path="/privacy" element={<PrivacyTermini />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;

