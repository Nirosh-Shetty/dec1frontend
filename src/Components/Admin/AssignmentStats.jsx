import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssignmentStats = ({ orders, zones }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    assignedOrders: 0,
    unassignedOrders: 0,
    totalValue: 0,
    activeRiders: 0,
    zonesWithOrders: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [orders, zones]);

  const calculateStats = () => {
    if (!orders || !Array.isArray(orders)) {
      return;
    }

    const totalOrders = orders.length;
    const assignedOrders = orders.filter(order => order.riderId).length;
    const unassignedOrders = totalOrders - assignedOrders;
    const totalValue = orders.reduce((sum, order) => sum + (parseFloat(order.allTotal) || 0), 0);
    
    // Get unique riders
    const uniqueRiders = new Set();
    orders.forEach(order => {
      if (order.riderId) {
        uniqueRiders.add(order.riderId._id || order.riderId);
      }
    });
    
    // Count zones with orders
    const zonesWithOrders = zones?.filter(zone => {
      // This would need the zone-order mapping logic
      return zone.assignedRiders && zone.assignedRiders.length > 0;
    }).length || 0;

    setStats({
      totalOrders,
      assignedOrders,
      unassignedOrders,
      totalValue,
      activeRiders: uniqueRiders.size,
      zonesWithOrders,
    });
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: color,
          marginBottom: '4px',
        }}
      >
        {typeof value === 'number' && value > 999 
          ? `${(value / 1000).toFixed(1)}k` 
          : value}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const assignmentPercentage = stats.totalOrders > 0 
    ? Math.round((stats.assignedOrders / stats.totalOrders) * 100) 
    : 0;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="📦"
          color="#2563eb"
          subtitle="Today's orders"
        />
        <StatCard
          title="Assigned"
          value={stats.assignedOrders}
          icon="✅"
          color="#059669"
          subtitle={`${assignmentPercentage}% complete`}
        />
        <StatCard
          title="Unassigned"
          value={stats.unassignedOrders}
          icon="⏳"
          color="#ea580c"
          subtitle="Pending assignment"
        />
        <StatCard
          title="Total Value"
          value={`₹${stats.totalValue.toFixed(0)}`}
          icon="💰"
          color="#7c3aed"
          subtitle="Order value"
        />
        <StatCard
          title="Active Riders"
          value={stats.activeRiders}
          icon="🏍️"
          color="#0ea5e9"
          subtitle="With assignments"
        />
        <StatCard
          title="Active Zones"
          value={stats.zonesWithOrders}
          icon="🗺️"
          color="#10b981"
          subtitle="With riders"
        />
      </div>
      
      {/* Progress Bar */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Assignment Progress
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>
            {assignmentPercentage}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f1f5f9',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${assignmentPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
          <span>{stats.assignedOrders} assigned</span>
          <span>{stats.unassignedOrders} remaining</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentStats;