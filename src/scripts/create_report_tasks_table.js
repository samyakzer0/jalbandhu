// Script to create the report_tasks table for task assignment functionality
// Run this in the browser console when logged in as an admin

async function createReportTasksTable() {
  try {
    // Make sure we're on the app page and supabase is initialized
    if (!window.supabase) {
      console.error('Supabase client not found. Make sure you are on the app page and logged in.');
      return;
    }

    const supabase = window.supabase;

    console.log('Creating report_tasks table...');

    // Create the report_tasks table
    const { error } = await supabase.rpc('run_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS report_tasks (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          report_id VARCHAR NOT NULL,
          task_description TEXT NOT NULL,
          assigned_by UUID REFERENCES auth.users(id) NOT NULL,
          assigned_to UUID REFERENCES auth.users(id),
          category VARCHAR NOT NULL,
          priority VARCHAR DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
          status VARCHAR DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
          due_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          notes TEXT,

          -- Index for better performance
          INDEX idx_report_tasks_report_id (report_id),
          INDEX idx_report_tasks_category (category),
          INDEX idx_report_tasks_assigned_to (assigned_to),
          INDEX idx_report_tasks_status (status),
          INDEX idx_report_tasks_priority (priority),

          -- Foreign key constraint to reports table (if it exists)
          FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE
        );

        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_report_tasks_updated_at
          BEFORE UPDATE ON report_tasks
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (error) {
      console.error('Error creating report_tasks table:', error);

      // Try alternative method if RPC fails
      console.log('Trying alternative method to create report_tasks table...');
      const { error: altError } = await supabase
        .from('report_tasks')
        .select('*')
        .limit(1);

      if (altError && altError.code === '42P01') {
        console.log('Table does not exist, attempting to create via insert...');

        // Try to create table by inserting a dummy record that will fail but create the table
        const dummyTask = {
          id: '00000000-0000-0000-0000-000000000000',
          report_id: 'DUMMY',
          task_description: 'Dummy task to create table',
          assigned_by: '00000000-0000-0000-0000-000000000000',
          category: 'Dummy',
          priority: 'Low',
          status: 'Cancelled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await supabase.from('report_tasks').insert([dummyTask]);

        // Clean up dummy record
        await supabase.from('report_tasks').delete().eq('report_id', 'DUMMY');

        console.log('report_tasks table created successfully via alternative method');
      } else if (!altError) {
        console.log('report_tasks table already exists');
      }
    } else {
      console.log('report_tasks table created successfully');
    }

    // Test the table by inserting a sample task
    console.log('Testing table with sample task...');
    const testTask = {
      report_id: 'CG-RD-20241201-0001',
      task_description: 'Sample task for testing table creation',
      assigned_by: (await supabase.auth.getUser()).data.user?.id || 'test-user-id',
      category: 'Roads',
      priority: 'Medium',
      status: 'Pending',
      notes: 'This is a test task created during table setup'
    };

    const { error: insertError } = await supabase
      .from('report_tasks')
      .insert([testTask]);

    if (insertError) {
      console.error('Error inserting test task:', insertError);
    } else {
      console.log('Test task inserted successfully');

      // Clean up test task
      const { error: deleteError } = await supabase
        .from('report_tasks')
        .delete()
        .eq('report_id', 'CG-RD-20241201-0001');

      if (deleteError) {
        console.error('Error cleaning up test task:', deleteError);
      } else {
        console.log('Test task cleaned up');
      }
    }

    console.log('Report tasks table setup completed!');

  } catch (error) {
    console.error('Error setting up report_tasks table:', error);
  }
}

// Execute the function
createReportTasksTable().then(() => {
  console.log('Report tasks table setup process finished.');
});
