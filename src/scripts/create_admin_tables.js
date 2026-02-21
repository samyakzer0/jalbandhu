/**
 * This script is meant to be run in the browser console when logged in as an admin
 * to create the necessary tables for admin functionality if they don't exist.
 * 
 * How to use:
 * 1. Login to the app as an admin user
 * 2. Open the browser console (F12 or right-click > Inspect > Console)
 * 3. Copy and paste this entire script into the console and press Enter
 * 4. The script will create the necessary tables if they don't exist
 */

// Function to check if a table exists and create it if it doesn't
async function ensureTableExists(supabase, tableName, createTableFn) {
  try {
    console.log(`Checking if ${tableName} table exists...`);
    // Try to select from the table
    const { error } = await supabase.from(tableName).select('*').limit(1);
    
    // If there's an error with code 42P01, the table doesn't exist
    if (error && (error.code === '42P01' || error.message.includes('does not exist'))) {
      console.log(`Table ${tableName} does not exist. Creating...`);
      await createTableFn();
      console.log(`Table ${tableName} created successfully.`);
    } else if (error) {
      console.error(`Error checking table ${tableName}:`, error);
    } else {
      console.log(`Table ${tableName} already exists.`);
    }
  } catch (e) {
    console.error(`Error ensuring table ${tableName} exists:`, e);
  }
}

// Get the supabase client from the window object (it should be available in the app)
async function setupAdminTables() {
  try {
    // Make sure we're on the app page and supabase is initialized
    if (!window.supabase) {
      console.error('Supabase client not found. Make sure you are on the app page and logged in.');
      return;
    }
    
    const supabase = window.supabase;
    
    // Get current user to set as admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user is logged in. Please log in first.');
      return;
    }
    
    console.log('Current user:', user.email);
    
    // Create user_roles table if it doesn't exist
    await ensureTableExists(supabase, 'user_roles', async () => {
      // This is simplified - in a real environment, you'd use Supabase migrations
      // Here we're just inserting a row to create the table with the right structure
      const { error } = await supabase
        .rpc('create_user_roles_table');
      
      if (error) {
        console.error('Error creating user_roles table:', error);
        
        // Try using SQL directly if RPC fails
        console.log('Trying alternate method to create user_roles table...');
        const { error: sqlError } = await supabase.rpc('run_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS user_roles (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) NOT NULL,
              role VARCHAR NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              UNIQUE(user_id, role)
            );
          `
        });
        
        if (sqlError) {
          console.error('Error with SQL creation of user_roles table:', sqlError);
          throw sqlError;
        }
      }
      
      // Make current user an admin
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: user.id, role: 'admin' }]);
        
      if (insertError && !insertError.message.includes('duplicate')) {
        console.error('Error setting user as admin:', insertError);
      } else {
        console.log('Current user set as admin');
      }
    });
    
    // Create category_admins table if it doesn't exist
    await ensureTableExists(supabase, 'category_admins', async () => {
      const { error } = await supabase
        .rpc('create_category_admins_table');
        
      if (error) {
        console.error('Error creating category_admins table:', error);
        
        // Try using SQL directly if RPC fails
        console.log('Trying alternate method to create category_admins table...');
        const { error: sqlError } = await supabase.rpc('run_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS category_admins (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) NOT NULL,
              category VARCHAR NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              UNIQUE(user_id, category)
            );
          `
        });
        
        if (sqlError) {
          console.error('Error with SQL creation of category_admins table:', sqlError);
          throw sqlError;
        }
      }
      
      // Add the current user as admin for some default categories
      const categories = ['Tsunami', 'Cyclone', 'Storm Surge', 'High Waves', 'Coastal Erosion', 'Marine Pollution', 'Maritime Accident', 'Other'];
      
      for (const category of categories) {
        const { error: insertError } = await supabase
          .from('category_admins')
          .insert([{ user_id: user.id, category }]);
          
        if (insertError && !insertError.message.includes('duplicate')) {
          console.error(`Error setting user as admin for category ${category}:`, insertError);
        } else {
          console.log(`User set as admin for category ${category}`);
        }
      }
    });
    
    console.log('Admin tables setup completed!');
    
  } catch (error) {
    console.error('Error setting up admin tables:', error);
  }
}

// Execute the function
setupAdminTables().then(() => {
  console.log('Admin tables setup process finished.');
});
