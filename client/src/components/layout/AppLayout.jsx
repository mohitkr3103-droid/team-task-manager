import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
