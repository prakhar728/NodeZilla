// src/app/layout.tsx

import React from 'react';
import './globals.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="page-container">
      <div className="logo-container">
        <img
          src="/Name-n.png"
          alt="NodeZilla Logo"
          className="logo"
          id="nodezilla-logo"
        />
      </div>
      {children}
    </div>
  );
};

export default Layout;
