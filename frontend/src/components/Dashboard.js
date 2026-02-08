import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Chart from './Chart';
import '../styles/Dashboard.css';

const POSITIONS = ['HOK', 'MID', 'EDG', 'HLF', 'CTR', 'WFB', 'RES'];

const Dashboard = () => {
  const players = useSelector((state) => state.players.allPlayers);
  const priorityList = useSelector((state) => state.players.priorityList);
  const draftedTeam = useSelector((state) => state.players.draftedTeam);

  const draftedIdSet = useMemo(() => new Set(draftedTeam.map((p) => p.id)), [draftedTeam]);

  const topAvailable = useMemo(() => {
    const available = (players || []).filter((p) => !draftedIdSet.has(p.id));
    const sortable = available.filter((p) => Number.isFinite(p?.stats?.adp));
    return sortable.sort((a, b) => a.stats.adp - b.stats.adp).slice(0, 8);
  }, [players, draftedIdSet]);

  const draftedByPosition = useMemo(() => {
    const counts = POSITIONS.reduce((acc, pos) => ({ ...acc, [pos]: 0 }), {});
    draftedTeam.forEach((p) => {
      const pos = p.positions || 'RES';
      counts[pos] = (counts[pos] || 0) + 1;
    });
    return counts;
  }, [draftedTeam]);

  return (
    <div className="dashboard">
      <section className="dash-hero">
        <div className="dash-hero-left">
          <p className="dash-kicker">NRL Draft HQ</p>
          <h1>Draft faster with a clearer board.</h1>
          <p className="dash-subtitle">
            Quick entry to the draft tool, live roster counts, and best-available
            at a glance.
          </p>
          <div className="dash-actions">
            <Link className="btn btn-primary" to="/draft-tool">Open Draft Tool</Link>
            <Link className="btn btn-ghost" to="/players-database">Browse Players</Link>
          </div>
        </div>
        <div className="dash-hero-card">
          <div className="stat">
            <span className="stat-label">Total Players</span>
            <span className="stat-value">{players.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Drafted</span>
            <span className="stat-value">{draftedTeam.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Priority List</span>
            <span className="stat-value">{priorityList.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Available</span>
            <span className="stat-value">{Math.max(players.length - draftedTeam.length, 0)}</span>
          </div>
        </div>
      </section>

      <section className="dash-grid">
        <div className="dash-panel">
          <div className="panel-header">
            <h2>Best Available (ADP)</h2>
            <Link to="/draft-tool" className="link">Draft from list</Link>
          </div>
          <div className="best-available">
            {topAvailable.length === 0 ? (
              <p className="empty-state">No players available yet.</p>
            ) : (
              topAvailable.map((p) => (
                <div key={p.id} className="player-row">
                  <div>
                    <span className="player-name">{p.first_name} {p.last_name}</span>
                    <span className="player-meta">{p.positions}</span>
                  </div>
                  <span className="player-rank">ADP {p.stats.adp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="panel-header">
            <h2>Roster Snapshot</h2>
            <Link to="/draft-tool" className="link">Manage roster</Link>
          </div>
          <div className="position-grid">
            {POSITIONS.map((pos) => (
              <div key={pos} className="position-card">
                <span className="position-label">{pos}</span>
                <span className="position-value">{draftedByPosition[pos] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel wide">
          <div className="panel-header">
            <h2>Insights</h2>
            <span className="muted">Totals and averages</span>
          </div>
          <div className="chart-grid">
            <Chart type="points" />
            <Chart type="average" />
            <Chart type="positionHLF" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
