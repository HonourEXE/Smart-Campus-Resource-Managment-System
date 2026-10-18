import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto py-4 border-top" style={{ borderColor: 'var(--surface-border)', background: 'rgba(15, 23, 42, 0.7)' }}>
      <div className="container text-center text-muted small">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <strong className="text-white">Smart Campus & Resource Management System (SCRMS)</strong>
            <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
              Full Stack Development Project (Course Code: 23DC2032 | IA III Capstone)
            </div>
          </div>
          <div className="d-flex gap-3 text-secondary">
            <span><i className="bi bi-shield-check text-success me-1"></i> JWT & RBAC Secured</span>
            <span><i className="bi bi-cpu text-info me-1"></i> Conflict Detection Engine</span>
            <span><i className="bi bi-lightning-charge text-warning me-1"></i> In-Memory / MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
