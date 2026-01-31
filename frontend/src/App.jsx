import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BrowseItems from './pages/BrowseItems';
import ItemDetailPage from './pages/ItemDetailPage';
import AddItemPage from './pages/AddItemPage';
import MyBidsPage from './pages/MyBidsPage';
import ChatPage from './pages/ChatPage';
import SellerProfilePage from './pages/SellerProfilePage';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationPopup from './components/NotificationPopup';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-slate-950 text-white font-body selection:bg-cherry/30">
            <Navbar />
            <NotificationPopup />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat/:swapId" element={<ChatPage />} />
              <Route path="/browse" element={<BrowseItems />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/add-item" element={<AddItemPage />} />
              <Route path="/my-bids" element={<MyBidsPage />} />
              <Route path="/profile/:userId" element={<SellerProfilePage />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
