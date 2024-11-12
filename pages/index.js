// pages/radar/index.js

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RadarDashboard() {
  const [radars, setRadars] = useState([]);
  const [newRadar, setNewRadar] = useState({ name: '', description: '' });
  const router = useRouter();

  useEffect(() => {
    console.log("RadarDashboard component mounted, fetching radars...");
    fetchRadars();
  }, []);

  // Fetch all radars from Supabase
  async function fetchRadars() {
    console.log("Fetching radars...");
    const { data, error } = await supabase.from('radars').select('*');
    if (error) {
      console.error("Error fetching radars:", error.message);
    } else {
      console.log("Fetched radars data:", data);
      setRadars(data);
    }
  }

  // Create a new radar entry
  async function handleCreateRadar() {
    const { data, error } = await supabase
      .from('radars')
      .insert([{ name: newRadar.name, description: newRadar.description }]);
    if (error) console.error("Error creating radar:", error.message);
    else {
      setNewRadar({ name: '', description: '' });
      fetchRadars(); // Refresh the list after creating a radar
    }
  }

  // Delete a radar with confirmation
  async function handleDeleteRadar(id, name) {
    if (confirm(`Are you sure you want to delete the radar "${name}"?`)) {
      const { error } = await supabase.from('radars').delete().eq('id', id);
      if (error) console.error("Error deleting radar:", error.message);
      else fetchRadars(); // Refresh the list after deletion
    }
  }

  // Handle navigation to the strategy page
  const navigateToStrategy = (radarName) => {
    const encodedRadarName = encodeURIComponent(radarName);
    router.push(`/strategy/${encodedRadarName}`);
  };

  return (
    <div>
      <h1>Radar Dashboard</h1>

      {/* Form to create a new radar */}
      <div>
        <h2>Create New Radar</h2>
        <input
          type="text"
          placeholder="Radar Name"
          value={newRadar.name}
          onChange={(e) => setNewRadar({ ...newRadar, name: e.target.value })}
        />
        <textarea
          placeholder="Radar Description"
          value={newRadar.description}
          onChange={(e) =>
            setNewRadar({ ...newRadar, description: e.target.value })
          }
        />
        <button onClick={handleCreateRadar}>Create Radar</button>
      </div>

      {/* List of existing radars */}
      <h2>Existing Radars</h2>
      <ul>
        {radars.map((radar) => (
          <li key={radar.id}>
            <strong>{radar.name}</strong> - {radar.description}
            <br />
            Last updated: {new Date(radar.updated_at).toLocaleString()}
            <br />
            <Link href={`/radar/${radar.id}`} legacyBehavior>
              <a>View Radar Items</a>
            </Link>
            <button onClick={() => handleDeleteRadar(radar.id, radar.name)}>
              Delete
            </button>
            <button onClick={() => navigateToStrategy(radar.name)}>
              Go to Strategy - {radar.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}