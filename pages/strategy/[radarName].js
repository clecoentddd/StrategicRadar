import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function StrategyPage() {
  const router = useRouter();
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
    <div>
      <h1>Strategy - {radarName}</h1>
      <div style={{ marginBottom: '2rem' }}>
        <h2>{editElementId ? 'Edit Strategic Element' : 'Add New Strategic Element'}</h2>
        <input
          type="text"
          placeholder="Element Name"
          value={newElement.name}
          onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <textarea
            placeholder="Diagnosis"
            value={newElement.diagnosis}
            onChange={(e) => setNewElement({ ...newElement, diagnosis: e.target.value })}
            style={{ flex: 1, padding: '1rem' }}
          />
          <textarea
            placeholder="Overall Approach"
            value={newElement.overall_approach}
            onChange={(e) => setNewElement({ ...newElement, overall_approach: e.target.value })}
            style={{ flex: 1, padding: '1rem' }}
          />
          <textarea
            placeholder="Set of Coherent Actions"
            value={newElement.set_of_coherent_actions}
            onChange={(e) => setNewElement({ ...newElement, set_of_coherent_actions: e.target.value })}
            style={{ flex: 1, padding: '1rem' }}
          />
          <textarea
            placeholder="Proximate Objectives"
            value={newElement.proximate_objectives}
            onChange={(e) => setNewElement({ ...newElement, proximate_objectives: e.target.value })}
            style={{ flex: 1, padding: '1rem' }}
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <select
            value={newElement.status}
            onChange={(e) => setNewElement({ ...newElement, status: e.target.value })}
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
            style={{ width: '100px' }}
          />
          <input
            type="number"
            placeholder="To Year"
            value={newElement.toYear || ''}
            onChange={(e) => setNewElement({ ...newElement, toYear: e.target.value ? parseInt(e.target.value, 10) : '' })}
            style={{ width: '100px' }}
          />
          <div>
            <select 
              multiple
              value={newElement.tags} 
              onChange={(e) => handleTagChange(e.target.selectedOptions)}
              style={{ width: '100%', minHeight: '100px' }}
            >
              <option value="">Select tags...</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <div style={{ marginTop: '0.5rem' }}>
              {newElement.tags.map((tag, index) => (
                <span key={index} style={{ display: 'inline-block', padding: '0.2rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '5px', margin: '0 0.3rem' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={editElementId ? handleUpdateElement : handleCreateElement} style={{ marginTop: '1rem' }}>
          {editElementId ? 'Save Changes' : 'Add Strategic Element'}
        </button>
      </div>

      <h2>Strategic Elements</h2>
      <div>
        {strategicElements.map((element) => (
          <div key={element.id} style={{ borderBottom: '1px solid #ddd', padding: '1rem 0' }}>
            <strong>{element.name}</strong> ({element.status})
            <p><strong>Diagnosis:</strong> {element.diagnosis}</p>
            <p><strong>Overall Approach:</strong> {element.overall_approach}</p>
            <p><strong>Set of Coherent Actions:</strong> {element.set_of_coherent_actions}</p>
            <p><strong>Proximate Objectives:</strong> {element.proximate_objectives}</p>
            <p><strong>Tags:</strong> {Array.isArray(element.tags) ? element.tags.join(', ') : 'None'}</p>
            <p><strong>From:</strong> {element.fromYear} <strong>To:</strong> {element.toYear}</p>
            <button onClick={() => handleEditElement(element)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}