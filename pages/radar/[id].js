import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import RadarChart from '../../components/RadarChart';
import Link from 'next/link'; // Import Link from Next.js
import styles from './[id].module.css'; // Import your CSS module

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function RadarPage() {
  const router = useRouter();
  const { id } = router.query;

  const [radarName, setRadarName] = useState('');
  const [items, setItems] = useState([]);
  const [radars, setRadars] = useState([]); // To store all radars
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    type: 'problem',
    category: 'cat1',
    impact: 'low',
    cost: 'low',
    distance: 'dist1',
    zoom_in: null, // For the zoom in field (initially null)
  });
  const [editingItem, setEditingItem] = useState(null);  // Store the item being edited
  const [showRadar, setShowRadar] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRadar();
      fetchItems();
      fetchRadars(); // Fetch all radars when page loads
    }
  }, [id]);

  // Fetch the current radar details
// Fetch the current radar details
async function fetchRadar() {
  try {
    // Fetch the radar data
    const { data, error } = await supabase
      .from('radars')
      .select('name')
      .eq('id', id)
      .single();  // Fetch a single record

    if (error) {
      console.error("Error fetching radar:", error.message);
    } else {
      console.log("Radar fetched:", data);  // Debugging log
      setRadarName(data.name);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}


  // Fetch all radar items for the current radar
  async function fetchItems() {
    const { data, error } = await supabase
      .from('radar_items')
      .select('*')
      .eq('radar_id', id);

    if (error) {
      console.error("Error fetching items:", error.message);
    } else {
      setItems(data);
    }
  }

  // Fetch all radars except the current one
  async function fetchRadars() {
    const { data, error } = await supabase
      .from('radars')
      .select('*')
      .neq('id', id); // Exclude the current radar

    if (error) {
      console.error("Error fetching radars:", error.message);
    } else {
      setRadars(data); // Set radars in state
    }
  }

  // Handle adding a new radar item
  async function handleAddItem() {
    const { error } = await supabase
      .from('radar_items')
      .insert([{ ...newItem, radar_id: id }]);

    if (error) {
      console.error("Error inserting item:", error.message);
    } else {
      setNewItem({
        name: '',
        description: '',
        type: 'problem',
        category: 'cat1',
        impact: 'low',
        cost: 'low',
        distance: 'dist1',
        zoom_in: null,
      });
      fetchItems(); // Refresh the items list
    }
  }

  // Handle updating a radar item (including Zoom In field)
  async function handleUpdateItem() {
    if (!editingItem || !editingItem.id) {
      console.error("No item selected for editing.");
      return; // Exit if editingItem is null or doesn't have an id
    }

    // Get the updated values from newItem
    const updatedItem = {
      ...editingItem,
      ...newItem, // Merge newItem values into the editingItem
    };

    const { error } = await supabase
      .from('radar_items')
      .update(updatedItem)
      .eq('id', editingItem.id);

    if (error) {
      console.error("Error updating item:", error.message);
    } else {
      setEditingItem(null); // Clear the editing state
      setNewItem({
        name: '',
        description: '',
        type: 'problem',
        category: 'cat1',
        impact: 'low',
        cost: 'low',
        distance: 'dist1',
        zoom_in: null,
      }); // Reset the form fields
      fetchItems(); // Refresh the items list
    }
  }

  // Handle deleting a radar item
  async function handleDeleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase
        .from('radar_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error("Error deleting item:", error.message);
      } else {
        fetchItems(); // Refresh the items list
      }
    }
  }

  // Set item for editing when "Edit" button is clicked
  const handleEditClick = (item) => {
    setEditingItem(item); // Set the item being edited
    setNewItem({
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      impact: item.impact,
      cost: item.cost,
      distance: item.distance,
      zoom_in: item.zoom_in,
    }); // Populate the new item state with the current item's values
  };

  return (
    <div className={styles.radarContainer}>
      <Link href="/" className={styles.backLink}>
        Back to Radar List
      </Link>

      <h1 className={styles.title}>Radar: {radarName}</h1>

      {showRadar && (
        <RadarChart
          items={items}
          radius={250}
          defaultTooltip="Mouse over a radar item to get more information!"
        />
      )}

      <h2 className={styles.sectionHeading}>
        {editingItem ? "Edit Radar Item" : "Add New Radar Item"}
      </h2>

      <div className={styles.formGroup}>
        <input
          className={styles.inputField}
          type="text"
          placeholder="Name"
          value={newItem.name || ""}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <textarea
          className={styles.textareaField}
          placeholder="Description"
          value={newItem.description || ""}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        <select
          className={styles.selectField}
          value={newItem.type || ""}
          onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
        >
          <option value="problem">Problem</option>
          <option value="opportunity">Opportunity</option>
        </select>
        <select
          className={styles.selectField}
          value={newItem.category || ""}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        >
          <option value="cat1">Cat1</option>
          <option value="cat2">Cat2</option>
          <option value="cat3">Cat3</option>
          <option value="cat4">Cat4</option>
        </select>
        <select
          className={styles.selectField}
          value={newItem.impact || ""}
          onChange={(e) => setNewItem({ ...newItem, impact: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          className={styles.selectField}
          value={newItem.cost || ""}
          onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          className={styles.selectField}
          value={newItem.distance || ""}
          onChange={(e) => setNewItem({ ...newItem, distance: e.target.value })}
        >
          <option value="dist1">Dist1</option>
          <option value="dist2">Dist2</option>
          <option value="dist3">Dist3</option>
          <option value="dist4">Dist4</option>
        </select>
        <select
          className={styles.selectField}
          value={newItem.zoom_in || ""}
          onChange={(e) => setNewItem({ ...newItem, zoom_in: e.target.value })}
        >
          <option value="">Select a Radar</option>
          {radars.map((radar) => (
            <option key={radar.id} value={radar.id}>
              {radar.name}
            </option>
          ))}
        </select>
        <button
          className={styles.submitButton}
          onClick={editingItem ? handleUpdateItem : handleAddItem}
        >
          {editingItem ? "Update Item" : "Add Item"}
        </button>
      </div>

      <h2 className={styles.sectionHeading}>Radar Items For</h2>
      <ul className={styles.itemList}>
        {items.map((item) => {
          const zoomInRadar = radars.find((radar) => radar.id === item.zoom_in);
          return (
            <li className={styles.item} key={item.id}>
              <div>
                <strong>{item.name}</strong>: {item.description} - {item.category} | {item.distance}
              </div>
              <div className={styles.zoomButtonWrapper}>
                <Link href={zoomInRadar ? `/radar/${item.zoom_in}` : "#"}>
                  <button
                    className={`${styles.zoomInButton} ${
                      zoomInRadar ? styles.enabled : styles.disabled
                    }`}
                    disabled={!zoomInRadar}
                  >
                    {zoomInRadar ? `Zoom in to: ${zoomInRadar.name}` : "No radar to zoom in to"}
                  </button>
                </Link>
              </div>
              <div className={styles.itemButtons}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditClick(item)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}