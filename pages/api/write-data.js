import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body;

    try {
      // Insert data into the 'test_data' table
      const { data, error } = await supabase
        .from('test_data')
        .insert([{ name }]);

      if (error) throw error;

      res.status(200).json({ message: 'Data inserted successfully', data });
    } catch (error) {
      res.status(500).json({ error: 'Error inserting data into Supabase', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
