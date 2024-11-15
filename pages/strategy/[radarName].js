import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';  // <-- Ensure this is here
import styles from './StrategyPage.module.css';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function StrategyPage() {
  const router = useRouter();  // Initialize useRouter hook here
  const radarName = decodeURIComponent(router.query.radarName || '');
  const [strategicElements, setStrategicElements] = useState([]);
  const [newElement, setNewElement] = useState({
    name: '',
    diagnosis: '',
    overall_approach: '',
    set_of_coherent_actions: '',
    proximate_objectives: '',
    status: 'active',
    fromYear: '',
    toYear: '',
    tags: [],
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [editElementId, setEditElementId] = useState(null);
  const [radarId, setRadarId] = useState(null);

  // Update useEffect to refetch radar items when radarId changes
  useEffect(() => {
    if (radarName) {
      fetchRadarId();  // fetchRadarId will set radarId
    }
  }, [radarName]);

  // Fetch radar items after radarId is set
  useEffect(() => {
    if (radarId) {
      fetchStrategicElements();  // Fetch elements for the specific radar
      fetchRadarItems();         // Fetch tags specific to this radar
    }
  }, [radarId]);

  async function fetchRadarId() {
    const { data, error } = await supabase
      .from('radars')
      .select('id')
      .eq('name', radarName)
      .single();
    if (error) {
      console.error('Error fetching radar ID:', error.message);
    } else {
      setRadarId(data.id);
    }
  }

  async function fetchStrategicElements() {
    if (radarId) {
      const { data, error } = await supabase
        .from('strategic_elements')
        .select('*')
        .eq('radar_id', radarId);
      if (error) {
        console.error('Error fetching strategic elements:', error.message);
      } else {
        setStrategicElements(
          data.map((element) => ({
            ...element,
            tags: Array.isArray(element.tags)
              ? element.tags
              : typeof element.tags === 'string'
              ? element.tags.split(',')
              : [],  // Ensure tags is always an array
          }))
        );
      }
    }
  }

  // Fetch radar items to populate tags
  async function fetchRadarItems() {
    if (radarId) {  // Check if radarId is set before making the query
      const { data, error } = await supabase
        .from('radar_items')
        .select('name')
        .eq('radar_id', radarId);  // Filter items by radarId

      if (error) {
        console.error('Error fetching radar items:', error.message);
      } else {
        setAvailableTags(data.map(item => item.name));  // Set tags for the current radar only
      }
    }
  }

  async function handleCreateElement() {
    const { data, error } = await supabase
      .from('strategic_elements')
      .insert([{
        ...newElement,
        radar_id: radarId,
        tags: Array.isArray(newElement.tags) ? newElement.tags.join(',') : '', // Convert tags to string
        fromYear: newElement.fromYear ? parseInt(newElement.fromYear, 10) : null,
        toYear: newElement.toYear ? parseInt(newElement.toYear, 10) : null
      }]);
    if (error) {
      console.error('Error creating element:', error.message);
    } else {
      setNewElement({
        name: '',
        diagnosis: '',
        overall_approach: '',
        set_of_coherent_actions: '',
        proximate_objectives: '',
        status: 'active',
        fromYear: '',
        toYear: '',
        tags: [],
      });
      fetchStrategicElements();
    }
  }

  async function handleUpdateElement() {
    const { error } = await supabase
      .from('strategic_elements')
      .update({
        ...newElement,
        tags: Array.isArray(newElement.tags) ? newElement.tags.join(',') : '', // Convert tags to string
        fromYear: newElement.fromYear ? parseInt(newElement.fromYear, 10) : null,
        toYear: newElement.toYear ? parseInt(newElement.toYear, 10) : null
      })
      .eq('id', editElementId);
    if (error) {
      console.error('Error updating element:', error.message);
    } else {
      setEditElementId(null);
      setNewElement({
        name: '',
        diagnosis: '',
        overall_approach: '',
        set_of_coherent_actions: '',
        proximate_objectives: '',
        status: 'active',
        fromYear: '',
        toYear: '',
        tags: [],
      });
      fetchStrategicElements();
    }
  }

  const handleEditElement = (element) => {
    setEditElementId(element.id);
    setNewElement({
      name: element.name,
      diagnosis: element.diagnosis,
      overall_approach: element.overall_approach,
      set_of_coherent_actions: element.set_of_coherent_actions,
      proximate_objectives: element.proximate_objectives,
      status: element.status,
      fromYear: element.fromYear,
      toYear: element.toYear,
      tags: Array.isArray(element.tags)
        ? element.tags
        : typeof element.tags === 'string'
        ? element.tags.split(',')
        : [],  // Ensure tags is always an array
    });
  };

  const handleTagChange = (selectedOptions) => {
    const selectedTags = Array.from(selectedOptions).map(option => option.value);
    setNewElement({ ...newElement, tags: selectedTags });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Strategy - {radarName}</h1>
      <div style={{ marginBottom: '2rem' }}>
        <h2>{editElementId ? 'Edit Strategic Element' : 'Add New Strategic Element'}</h2>
        <input
          type="text"
          placeholder="Element Name"
          value={newElement.name}
          onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
          className={styles.inputField}
        />
        <div className={styles.rowLayout}>
          <div
            contentEditable
            className={styles.richTextField}
            dir="ltr"
            onInput={(e) => setNewElement({ ...newElement, diagnosis: e.currentTarget.innerHTML })}
          />
          <div
            contentEditable
            className={styles.richTextField}
            dir="ltr"
            onInput={(e) => setNewElement({ ...newElement, overall_approach: e.currentTarget.innerHTML })}
          />
          <div
            contentEditable
            className={styles.richTextField}
            dir="ltr"
            onInput={(e) => setNewElement({ ...newElement, set_of_coherent_actions: e.currentTarget.innerHTML })}
          />
          <div
            contentEditable
            className={styles.richTextField}
            dir="ltr"
            onInput={(e) => setNewElement({ ...newElement, proximate_objectives: e.currentTarget.innerHTML })}
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <select
            value={newElement.status}
            onChange={(e) => setNewElement({ ...newElement, status: e.target.value })}
            className={styles.selectField}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="obsolete">Obsolete</option>
            <option value="deleted">Deleted</option>
          </select>
            <input
              type="number"
              placeholder="From Year"
              value={newElement.fromYear || ''}
              onChange={(e) => setNewElement({ ...newElement, fromYear: e.target.value ? parseInt(e.target.value, 10) : '' })}
              className={`${styles.inputField} ${styles.numberInput}`}
            />

            <input
              type="number"
              placeholder="To Year"
              value={newElement.toYear || ''}
              onChange={(e) => setNewElement({ ...newElement, toYear: e.target.value ? parseInt(e.target.value, 10) : '' })}
              className={`${styles.inputField} ${styles.numberInput}`}
            />

        </div>
        <div className={styles.formGroup}>
          <label>Tags</label>
          <select
            multiple
            value={newElement.tags}
            onChange={(e) => handleTagChange(e.target.selectedOptions)}
            className={styles.selectField}
          >
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
        <div>
          {editElementId ? (
            <button onClick={handleUpdateElement} className={styles.submitButton}>Update Element</button>
          ) : (
            <button onClick={handleCreateElement} className={styles.submitButton}>Create Element</button>
          )}
        </div>
      </div>
      <div>
        <h2>Existing Strategic Elements</h2>
        {strategicElements.map((element) => (
          <div key={element.id} className={styles.item}>
            <h3>{element.name}</h3>
            <button onClick={() => handleEditElement(element)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
