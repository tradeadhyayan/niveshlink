import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WebinarLanding from './pages/WebinarLanding';
import AdminRegistry from './pages/AdminRegistry';
import PaymentStatus from './pages/PaymentStatus';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Landing Page (Topmate Replica) */}
        <Route path="/" element={<WebinarLanding />} />
        
        {/* Legacy Registry View */}
        <Route path="/admin" element={<AdminRegistry />} />
        
        {/* Payment Callback */}
        <Route path="/payment-status" element={<PaymentStatus />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
