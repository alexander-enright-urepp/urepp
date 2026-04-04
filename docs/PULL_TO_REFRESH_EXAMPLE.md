// Example: Adding Pull-to-Refresh to Dashboard
// Use this in your dashboard or feed pages

import PullToRefreshContainer from '@/components/PullToRefreshContainer';
import { supabase } from '@/lib/supabase';

// In your dashboard component:

const handleRefresh = async () => {
  // Re-fetch your data here
  await Promise.all([
    fetchProfile(),
    fetchStats(),
    fetchVideos(),
    // etc.
  ]);
};

// Wrap your content:
<PullToRefreshContainer 
  onRefresh={handleRefresh}
  className="h-full"
>
  {/* Your existing dashboard content */}
  <div className="p-4">
    <h1>Dashboard</h1>
    {/* ... */}
  </div>
</PullToRefreshContainer>

// Works on any page - just wrap the scrollable content!