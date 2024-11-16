import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './StrategyPage.module.css';
import supabase from '../../lib/supabaseClient';

export default function StrategyPage() {
  const router = useRouter();
  const { strategies } = router.query; // Get the 'strategies' from the URL query
  console.log('router.query:', router.query);  // Log to check if 'strategies' exists
  
  const [radarName, setRadarName] = useState(''); // State to store radar name
  const [strategicElements, setStrategicElements] = useState([]);
  const [newElement, setNewElement] = useState({
    name: '',
    diagnosis: '',
    overall_approach: '',
    set_of_coherent_actions: '',
    proximate_objectives: '',
    status: 'active',
    tags: [],  // tags are UUIDs
    strategy_id: '', // New field for strategy_id
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [editElementId, setEditElementId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);  // To toggle form visibility

  useEffect(() => {
    console.log('router.query:', router.query); // Log the entire router.query to see the available query parameters
    const { strategies } = router.query;  // Destructure strategies (UUID)
  
    console.log("Received radarId (strategies):", strategies); // Log the value of strategies (which is your radarId)
  
    if (strategies) {
      // If radarId (strategies) exists, fetch the radar name
      fetchRadarName(strategies); 
      fetchStrategicElements();
      fetchRadarItems();
    }
  }, [router.query]);  // This hook depends on changes to router.query (or specifically the strategies value)
  

  // Fetch the radar name from the database
  async function fetchRadarName(radarId) {
    const { data, error } = await supabase
      .from('radars')
      .select('name')
      .eq('id', radarId)
      .single(); // Assuming 'radars' table has 'id' and 'name'

    if (error) {
      console.error('Error fetching radar name:', error.message);
    } else {
      setRadarName(data.name); // Set radar name in the state
    }
  }

  async function fetchStrategicElements() {
    console.log("Fetching strategic elements...");
    if (strategies) {
      const { data, error } = await supabase
        .from('strategic_elements')
        .select('*')
        .eq('radar_id', strategies);

      if (error) {
        console.error('Error fetching strategic elements:', error.message);
        return;
      }

      setStrategicElements(
        data.map((element) => ({
          ...element,
          tags: Array.isArray(element.tags)
            ? element.tags
            : typeof element.tags === 'string'
            ? element.tags.split(',')
            : [],
        }))
      );
    }
  }

  async function fetchRadarItems() {
    if (strategies) {
      const { data, error } = await supabase
        .from('radar_items')
        .select('id, name')
        .eq('radar_id', strategies);

      if (error) {
        console.error('Error fetching radar items:', error.message);
      } else {
        setAvailableTags(data);
      }
    }
  }

  // Handle Create/Update Strategic Element
  async function handleCreateElement() {
    const { data, error } = await supabase
      .from('strategic_elements')
      .insert([{
        ...newElement,
        radar_id: strategies,
        tags: Array.isArray(newElement.tags) ? newElement.tags : [],
        strategy_id: newElement.strategy_id, // Adding strategy_id field
      }]);

    if (error) {
      console.error('Error creating element:', error.message);
    } else {
      console.log("Element created successfully:", data);
      setNewElement({
        name: '',
        diagnosis: '',
        overall_approach: '',
        set_of_coherent_actions: '',
        proximate_objectives: '',
        status: 'active',
        tags: [],
        strategy_id: '', // Reset strategy_id
      });
      setIsCreating(false); // Hide the form after saving
      fetchStrategicElements(); // Refetch elements
    }
  }

  // Handle Edit Strategic Element
  async function handleEditElement() {
    const { data, error } = await supabase
      .from('strategic_elements')
      .update({
        ...newElement,
        radar_id: strategies,
        tags: Array.isArray(newElement.tags) ? newElement.tags : [],
        strategy_id: newElement.strategy_id, // Add strategy_id when editing
      })
      .eq('id', editElementId);

    if (error) {
      console.error('Error editing element:', error.message);
    } else {
      console.log("Element edited successfully:", data);
      setNewElement({
        name: '',
        diagnosis: '',
        overall_approach: '',
        set_of_coherent_actions: '',
        proximate_objectives: '',
        status: 'active',
        tags: [],
        strategy_id: '', // Reset strategy_id
      });
      setIsCreating(false); // Hide the form after editing
      fetchStrategicElements(); // Refetch elements
      setEditElementId(null); // Reset edit state
    }
  }

  // Handle Delete Strategic Element
  async function handleDeleteElement(id) {
    const { data, error } = await supabase
      .from('strategic_elements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting element:', error.message);
    } else {
      console.log("Element deleted successfully:", data);
      fetchStrategicElements(); // Refetch elements
    }
  }

  // Handle Cancel Create/Edit
  function handleCancelCreate() {
    setIsCreating(false); // Hide the form without saving
    setEditElementId(null); // Reset edit state
  }

  return (
    <div className={styles.container}>
    {/* Page title with radar name */}
    <h1 className={styles.title}>
      Strategy - {radarName ? radarName : 'Loading...'}
    </h1> 
  
    {/* Button to create new strategic element */}
    <button
      onClick={() => setIsCreating(true)} // Show form when clicked
      className={styles.newElementButton}
    >
      New Strategic Element
    </button>
  
    {/* Form for adding/editing strategic element */}
    {isCreating && (
      <div style={{ marginTop: '1rem' }}>
        // <h2>{editElementId ? 'Edit Strategic Element' : 'Add New Strategic Element'}</h2>
        <input
          type="text"
          placeholder="Element Name"
          value={newElement.name}
          onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
          className={styles.inputField}
        />
        {/* Other input fields */}
        <div className={styles.descriptionRow}>
          <label htmlFor="diagnosis">Diagnosis</label>
          <textarea
            id="diagnosis"
            placeholder="Diagnosis"
            value={newElement.diagnosis}
            onChange={(e) => setNewElement({ ...newElement, diagnosis: e.target.value })}
            className={styles.textAreaField}
          />

              {/* Overall Objectives textarea */}
          <label htmlFor="Overall Objectives">Overall Objectives</label>
          <textarea
            placeholder="Overall Objectives"
            value={newElement.overall_objectives}
            onChange={(e) => setNewElement({ ...newElement, overall_objectives: e.target.value })}
            className={styles.textAreaField}
          />

              {/* Set of Coherent Actions textarea */}
           <label htmlFor="Set of coherent action s">Set of coherent actions</label>
            <textarea
              placeholder="Set of coherent actions"
              value={newElement.set_of_coherent_actions}
              onChange={(e) => setNewElement({ ...newElement, set_of_coherent_actions: e.target.value })}
              className={styles.textAreaField}
            />
            <label htmlFor="Proximate Objectives">Proximate Objectives</label>
            <textarea
              placeholder="Proximate Objectives"
              value={newElement.proximate_objectives}
              onChange={(e) => setNewElement({ ...newElement, proximate_objectives: e.target.value })}
              className={styles.textAreaField}
            />
        </div>
        <div className={styles.tagsStatusContainer}>
      {/* Tags dropdown */}
      <div className={styles.tagsContainer}>
        <label>Tags:</label>
        <select
          multiple
          name="tags"
          value={newElement.tags}
          onChange={(e) =>
            setNewElement({ ...newElement, tags: Array.from(e.target.selectedOptions, opt => opt.value) })
          }
        >
          {availableTags.map((tag) => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>
      
      {/* Status dropdown */}
      <div className={styles.statusContainer}>
        <label>Status:</label>
        <select
          name="status"
          value={newElement.status}
          onChange={(e) => setNewElement({ ...newElement, status: e.target.value })}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
        <div>
          <button
            onClick={editElementId ? handleEditElement : handleCreateElement}
            className={styles.submitButton}
          >
            {editElementId ? 'Save Changes' : 'Save'}
          </button>
          <button onClick={handleCancelCreate} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    )}
  
    {/* Strategic Elements table */}
    <div>
      <h2>Strategic Elements</h2>
      {strategicElements.length === 0 ? (
        <p>No strategic elements found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Diagnosis</th>
              <th>Overall Approach</th>
              <th>Coherent Actions</th>
              <th>Proximate Objectives</th>
              <th>Status</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {strategicElements.map((element) => (
              <tr key={element.id}>
                <td>{element.name}</td>
                <td>{element.diagnosis}</td>
                <td>{element.overall_approach}</td>
                <td>{element.set_of_coherent_actions}</td>
                <td>{element.proximate_objectives}</td>
                <td>{element.status}</td>
                <td>
                  {element.tags && element.tags.length > 0 ? (
                    element.tags.map((tagId) => {
                      const tag = availableTags.find(t => t.id === tagId);
                      return tag ? <span key={tag.id}>{tag.name}</span> : null;
                    })
                  ) : (
                    <span>No tags</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => {
                      setNewElement({
                        name: element.name,
                        diagnosis: element.diagnosis,
                        overall_approach: element.overall_approach,
                        set_of_coherent_actions: element.set_of_coherent_actions,
                        proximate_objectives: element.proximate_objectives,
                        status: element.status,
                        tags: element.tags,
                      });
                      setEditElementId(element.id);
                      setIsCreating(true);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteElement(element.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
  );
}
