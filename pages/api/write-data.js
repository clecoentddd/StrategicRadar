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

      if (error) {
        // Log the error in the console for debugging
        console.error("Supabase insert error:", error);
        throw error;  // Throw the error to be caught by the catch block
      }

      // Return a success response
      res.status(200).json({ message: 'Data inserted successfully', data });
    } catch (error) {
      // Log the detailed error message
      console.error("DBG 1 Error inserting data:", error.message);
      res.status(500).json({
        error: 'DBG 2 Error inserting data into Supabase',
        details: error.message,
      });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
