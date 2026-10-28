import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto py-4 border-top footer-custom" style={{ borderColor: 'var(--surface-border-sky)', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="container text-muted small">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="text-start">
            <strong className="text-dark">Smart Campus & Resource Management System (SCRMS)</strong>
            <div className="text-muted" style={{ fontSize: '0.78rem' }}>
              Full Stack Development Project (Course Code: 23DC2032 | IA III Capstone)
            </div>
            <div className="d-flex flex-wrap gap-2 text-muted mt-1" style={{ fontSize: '0.75rem' }}>
              <span className="fw-semibold text-secondary">Portals:</span>
              <Link to="/login" className="text-decoration-none text-muted hover-sky">Student</Link>
              <span>•</span>
              <Link to="/login/faculty" className="text-decoration-none text-muted hover-sky">Faculty</Link>
              <span>•</span>
              <Link to="/login/resource-manager" className="text-decoration-none text-muted hover-sky">Resource Manager</Link>
              <span>•</span>
              <Link to="/login/admin" className="text-decoration-none text-muted hover-sky">Admin</Link>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-3 text-muted">
            <span><i className="bi bi-shield-check text-success me-1"></i> JWT & RBAC Secured</span>
            <span><i className="bi bi-cpu text-primary me-1"></i> Conflict Detection Engine</span>
            <span><i className="bi bi-lightning-charge text-warning me-1"></i> MongoDB / In-Memory</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
