import React from 'react';
import { Link } from 'react-router-dom';

const PortalSwitcherTabs = ({ activeRole = 'student' }) => {
  const portals = [
    {
      role: 'student',
      label: 'Student',
      path: '/login',
      icon: 'bi-mortarboard-fill',
      activeClass: 'active-student',
    },
    {
      role: 'faculty',
      label: 'Faculty',
      path: '/login/faculty',
      icon: 'bi-award-fill',
      activeClass: 'active-faculty',
    },
    {
      role: 'resource_manager',
      label: 'Manager',
      path: '/login/resource-manager',
      icon: 'bi-building-gear',
      activeClass: 'active-manager',
    },
    {
      role: 'admin',
      label: 'Admin',
      path: '/login/admin',
      icon: 'bi-shield-lock-fill',
      activeClass: 'active-admin',
    },
  ];

  return (
    <div className="portal-tabs-container mb-4" role="tablist" aria-label="Campus Portal Role Selector">
      {portals.map((p) => {
        const isActive = activeRole === p.role;
        return (
          <Link
            key={p.role}
            to={p.path}
            className={`portal-tab-btn ${isActive ? p.activeClass : ''}`}
            role="tab"
            aria-selected={isActive}
            title={`Switch to ${p.label} Portal Sign In`}
          >
            <i className={`bi ${p.icon}`}></i>
            <span>{p.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default PortalSwitcherTabs;
