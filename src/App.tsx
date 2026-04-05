import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebinarLanding from './pages/WebinarLanding';
import AdminDashboard from './pages/AdminRegistry';
import PaymentStatus from './pages/PaymentStatus';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebinarLanding />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
      </Routes>
    </Router>
  );
}

export default App;
