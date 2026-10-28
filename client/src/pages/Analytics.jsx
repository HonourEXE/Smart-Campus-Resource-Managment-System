import React, { useState, useEffect } from 'react';
import { getAnalyticsOverview } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalyticsOverview();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Computing campus utilization metrics...</p>
      </div>
    );
  }

  const { summary, topResources = [], peakHours = {}, categories = [] } = data || {};

  // Peak Hours Bar Chart Data
  const hourLabels = Object.keys(peakHours);
  const hourCounts = Object.values(peakHours);

  const barChartData = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Booked Sessions',
        data: hourCounts,
        backgroundColor: 'rgba(14, 165, 233, 0.75)',
        borderColor: '#0284c7',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0c4a6e',
        bodyColor: '#334155',
        borderColor: '#bae6fd',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(14, 165, 233, 0.08)' },
        ticks: { color: '#64748b' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(14, 165, 233, 0.08)' },
        ticks: { color: '#64748b', stepSize: 1 },
      },
    },
  };

  // Category Doughnut Data
  const doughnutData = {
    labels: categories.map((c) => c._id),
    datasets: [
      {
        data: categories.map((c) => c.count),
        backgroundColor: [
          '#0284c7',
          '#38bdf8',
          '#0ea5e9',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#6366f1',
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#334155', boxWidth: 12, padding: 12 },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Campus Resource Utilization & Analytics</h2>
          <p className="text-muted small mb-0">
            Real-time usage insights, peak reservation hours, and facility demand patterns
          </p>
        </div>

        <button onClick={fetchAnalytics} className="btn btn-secondary-dark d-flex align-items-center gap-2">
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card primary">
            <div className="text-muted small text-uppercase fw-semibold">Utilization Rate</div>
            <div className="stat-val text-info mt-1">{summary?.utilizationRate || 0}%</div>
            <div className="text-muted small mt-1">Based on operational hours</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card success">
            <div className="text-muted small text-uppercase fw-semibold">Total Reservations</div>
            <div className="stat-val text-white mt-1">{summary?.totalBookings || 0}</div>
            <div className="text-success small mt-1">{summary?.approvedBookings || 0} Confirmed</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card warning">
            <div className="text-muted small text-uppercase fw-semibold">Facilities Operational</div>
            <div className="stat-val text-warning mt-1">{summary?.availableResources || 0}</div>
            <div className="text-muted small mt-1">Out of {summary?.totalResources || 0} venues</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card danger">
            <div className="text-muted small text-uppercase fw-semibold">Maintenance Backlog</div>
            <div className="stat-val text-danger mt-1">
              {(summary?.openTickets || 0) + (summary?.inProgressTickets || 0)}
            </div>
            <div className="text-muted small mt-1">{summary?.resolvedTickets || 0} Tickets Resolved</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Peak Hours Chart */}
        <div className="col-12 col-lg-8">
          <div className="card-glass p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-primary"></i>
                Peak Booking Hours Distribution
              </h5>
              <span className="badge bg-light border text-primary" style={{ borderColor: '#bae6fd' }}>08:00 - 18:00</span>
            </div>
            <p className="text-muted small mb-4">
              Identifies congestion hours to assist timetable planners and optimize campus facility load
            </p>
            <div style={{ height: '280px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="col-12 col-lg-4">
          <div className="card-glass p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-pie-chart-fill text-primary"></i>
                Facility Breakdown
              </h5>
              <p className="text-muted small mb-3">
                Distribution across labs, lecture halls, and specialized sports/hardware facilities
              </p>
            </div>
            <div className="d-flex justify-content-center my-auto" style={{ maxHeight: '240px' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Most Booked Facilities */}
      <div className="card-glass p-4">
        <h5 className="mb-3 fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-trophy-fill text-warning"></i>
          Top 5 Most In-Demand Campus Facilities
        </h5>

        {topResources.length === 0 ? (
          <p className="text-muted small">No usage data accumulated yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Facility Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Bookings Count</th>
                  <th>Demand Level</th>
                </tr>
              </thead>
              <tbody>
                {topResources.map((item, idx) => (
                  <tr key={item._id}>
                    <td>
                      <span className="badge rounded-circle p-2 bg-light border text-primary font-monospace" style={{ borderColor: '#bae6fd' }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <strong className="text-dark">{item.name}</strong>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border" style={{ borderColor: '#bae6fd' }}>{item.type}</span>
                    </td>
                    <td className="small text-muted">{item.building}</td>
                    <td>
                      <span className="fw-bold text-primary">{item.count}</span> <span className="small text-muted">sessions</span>
                    </td>
                    <td>
                      <div className="progress" style={{ height: '8px', maxWidth: '140px', background: '#e2e8f0' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${Math.min(item.count * 25, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
