import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import LoginModal from './LoginModal';

const NAV_ITEMS = [
  { path: '/', label: '画廊', icon: '🏛️' },
  { path: '/workspace', label: '工作台', icon: '🎨' },
  { path: '/progress', label: '成长档案', icon: '📊', needsAuth: true },
  { path: '/teacher', label: '教师端', icon: '👨‍🏫' },
  { path: '/faq', label: '合作与FAQ', icon: '🤝' },
];

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoggedIn, logout } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  const handleNavClick = (item) => {
    if (item.needsAuth && !isLoggedIn()) {
      setShowLogin(true);
      return;
    }
    
    if (item.path === '/progress' && currentUser) {
      navigate(`/progress/${currentUser.id}`);
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <span className="text-2xl">🎨</span>
              <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                童画·奇境
              </span>
            </motion.div>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavClick(item)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2">
              {isLoggedIn() ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {currentUser?.nickname}
                  </span>
                  <button
                    onClick={logout}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm px-3 py-1.5 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

export default NavBar;
