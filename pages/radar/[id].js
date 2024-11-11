  // pages/radar/[id].js

  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/router';
  import { createClient } from '@supabase/supabase-js';
  import RadarChart from '../../components/RadarChart';

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  export default function RadarPage() {
    const router = useRouter();
    const { id } = router.query;

    const [radarName, setRadarName] = useState('');
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
      name: '',
      description: '',
      type: 'problem',
      category: 'cat1',
      impact: 'low',
      cost: 'low',
      distance: 'dist1',
    });
    const [editingItem, setEditingItem] = useState(null);
    const [showRadar, setShowRadar] = useState(false);

    useEffect(() => {
      if (id) {
        fetchRadar();
        fetchItems();
      }
    }, [id]);

    async function fetchRadar() {
      const { data, error } = await supabase
        .from('radars')
        .select('name')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching radar:", error.message);
      } else {
        setRadarName(data.name);
      }
    }

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

    async function handleAddItem() {
      const { error } = await supabase
        .from('radar_items')
        .insert([{ ...newItem, radar_id: id }]);

      if (error) {
        console.error("Error inserting item:", error.message);
      } else {
        setNewItem({ name: '', description: '', type: 'problem', category: 'cat1', impact: 'low', cost: 'low', distance: 'dist1' });
        fetchItems(); // Refresh the items list
      }
    }

    async function handleUpdateItem() {
      const { error } = await supabase
        .from('radar_items')
        .update(editingItem)
        .eq('id', editingItem.id);

      if (error) {
        console.error("Error updating item:", error.message);
      } else {
        setEditingItem(null);
        fetchItems(); // Refresh the items list
      }
    }

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

    return (
      <div>
        <h1>Radar: {radarName}</h1>

        <button onClick={() => setShowRadar(!showRadar)}>
          {showRadar ? "Hide Radar" : "Display Radar"}
        </button>

        {showRadar && <RadarChart items={items} radius={200} />}

        <h2>Add New Radar Item</h2>
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        <select
          value={newItem.type}
          onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
        >
          <option value="problem">Problem</option>
          <option value="opportunity">Opportunity</option>
        </select>
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        >
          <option value="cat1">Cat1</option>
          <option value="cat2">Cat2</option>
          <option value="cat3">Cat3</option>
          <option value="cat4">Cat4</option>
        </select>
        <select
          value={newItem.impact}
          onChange={(e) => setNewItem({ ...newItem, impact: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={newItem.cost}
          onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={newItem.distance}
          onChange={(e) => setNewItem({ ...newItem, distance: e.target.value })}
        >
          <option value="dist1">Dist1</option>
          <option value="dist2">Dist2</option>
          <option value="dist3">Dist3</option>
          <option value="dist4">Dist4</option>
        </select>
        <button onClick={handleAddItem}>Add Item</button>

        <h2>Radar Items</h2>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong>: {item.description} - {item.category} | {item.distance}
              <button onClick={() => setEditingItem(item)}>Edit</button>
              <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>

        {editingItem && (
          <div>
            <h2>Edit Item</h2>
            <input
              type="text"
              placeholder="Name"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            />
            <select
              value={editingItem.type}
              onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
            >
              <option value="problem">Problem</option>
              <option value="opportunity">Opportunity</option>
            </select>
            <select
              value={editingItem.category}
              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
            >
              <option value="cat1">Cat1</option>
              <option value="cat2">Cat2</option>
              <option value="cat3">Cat3</option>
              <option value="cat4">Cat4</option>
            </select>
            <select
              value={editingItem.impact}
              onChange={(e) => setEditingItem({ ...editingItem, impact: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={editingItem.cost}
              onChange={(e) => setEditingItem({ ...editingItem, cost: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              value={editingItem.distance}
              onChange={(e) => setEditingItem({ ...editingItem, distance: e.target.value })}
            >
              <option value="dist1">Dist1</option>
              <option value="dist2">Dist2</option>
              <option value="dist3">Dist3</option>
              <option value="dist4">Dist4</option>
            </select>
            <button onClick={handleUpdateItem}>Update Item</button>
            <button onClick={() => setEditingItem(null)}>Cancel</button>
          </div>
        )}
      </div>
    );
  }
