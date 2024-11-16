import { useState, useEffect } from 'react';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './RadarDashboard.module.css'; // Import the CSS module

export default function RadarDashboard() {
  const [radars, setRadars] = useState([]);
  const [newRadar, setNewRadar] = useState({ name: '', description: '', org_level: 1 });
  const [editRadar, setEditRadar] = useState(null); // State to handle editing
  const router = useRouter();

  useEffect(() => {
    fetchRadars();
  }, []);

  // Fetch all radars from Supabase, ordered by org_level
  async function fetchRadars() {
    const { data, error } = await supabase
      .from('radars')
      .select('*')
      .order('org_level', { ascending: true });
    if (error) {
      console.error("Error fetching radars:", error.message);
    } else {
      setRadars(data);
    }
  }

  // Create a new radar entry
  async function handleCreateRadar() {
    const { data, error } = await supabase
      .from('radars')
      .insert([{ name: newRadar.name, description: newRadar.description, org_level: newRadar.org_level }]);
    if (error) {
      console.error("Error creating radar:", error.message);
    } else {
      setNewRadar({ name: '', description: '', org_level: 1 });
      fetchRadars();
    }
  }

  // Edit an existing radar
  function handleEditRadar(radar) {
    setEditRadar({ ...radar });
  }

  async function handleSaveEditRadar() {
    const { error } = await supabase
      .from('radars')
      .update({
        name: editRadar.name,
        description: editRadar.description,
        org_level: editRadar.org_level,
      })
      .eq('id', editRadar.id);
    if (error) {
      console.error("Error updating radar:", error.message);
    } else {
      setEditRadar(null);
      fetchRadars();
    }
  }

  // Delete a radar with confirmation
  async function handleDeleteRadar(id, name) {
    if (confirm(`Are you sure you want to delete the radar "${name}"?`)) {
      const { error } = await supabase.from('radars').delete().eq('id', id);
      if (error) {
        console.error("Error deleting radar:", error.message);
      } else {
        fetchRadars();
      }
    }
  }

  // Handle navigation to the strategy page
  const navigateToStrategy = (radarId) => {
    console.log('navigateToStrategy for id: ', radarId);
    router.push(`/strategy/${radarId}`);  // Pass radarId to the URL
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Organisation Radar Dashboard</h1>

      {/* Form to create a new radar */}
      <div className={styles.formContainer}>
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
        <input
          type="number"
          placeholder="Organization Level (1-20)"
          value={newRadar.org_level}
          onChange={(e) =>
            setNewRadar({ ...newRadar, org_level: Math.min(20, Math.max(1, e.target.value)) })
          }
        />
        <button className={styles.button} onClick={handleCreateRadar}>Create Radar</button>
      </div>

      {/* List of existing radars, ordered by org_level */}
      <h2>Existing Radars by Organization Level</h2>
      <div className={styles.radarContainer}>
        {Array.from(new Set(radars.map((r) => r.org_level))).map((level) => (
          <div key={level} className={styles.levelSection}>
            <h3>Level {level}</h3>
            <ul className={styles.radarList}>
              {radars
                .filter((radar) => radar.org_level === level)
                .map((radar) => (
                  <li key={radar.id} className={styles.radarItem}>
                    {editRadar && editRadar.id === radar.id ? (
                      <div>
                        <input
                          type="text"
                          value={editRadar.name}
                          onChange={(e) =>
                            setEditRadar({ ...editRadar, name: e.target.value })
                          }
                        />
                        <textarea
                          value={editRadar.description}
                          onChange={(e) =>
                            setEditRadar({ ...editRadar, description: e.target.value })
                          }
                        />
                        <input
                          type="number"
                          value={editRadar.org_level}
                          onChange={(e) =>
                            setEditRadar({ ...editRadar, org_level: Math.min(20, Math.max(1, e.target.value)) })
                          }
                        />
                        <button className={styles.button} onClick={handleSaveEditRadar}>Save</button>
                        <button className={styles.button} onClick={() => setEditRadar(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div>
                        <strong>{radar.name}</strong> - {radar.description}
                        <br />
                        Last updated: {new Date(radar.updated_at).toLocaleString()}
                        <br />
                        <Link href={`/radar/${radar.id}`} legacyBehavior>
                          <a>View Radar Items</a>
                        </Link>
                        <button className={styles.button} onClick={() => handleEditRadar(radar)}>Edit</button>
                        <button className={styles.button} onClick={() => handleDeleteRadar(radar.id, radar.name)}>
                          Delete
                        </button>
                        <button className={styles.button} onClick={() => navigateToStrategy(radar.id)}>
                          Go to Strategy - {radar.name}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
