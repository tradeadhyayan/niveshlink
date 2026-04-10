import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebinarLanding from './pages/WebinarLanding';
import AdminDashboard from './pages/AdminRegistry';
import PaymentStatus from './pages/PaymentStatus';
import Courses from './pages/Courses';
import SmartNiveshak from './pages/SmartNiveshak';
import EliteNiveshak from './pages/EliteNiveshak';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebinarLanding />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/smart-niveshak" element={<SmartNiveshak />} />
        <Route path="/courses/elite-niveshak" element={<EliteNiveshak />} />
      </Routes>
    </Router>
  );
}

export default App;
