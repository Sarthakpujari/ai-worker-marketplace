async function installS45ForNewUser(userId: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    if (!process.env.KORTIX_ADMIN_API_KEY) {
      console.error('KORTIX_ADMIN_API_KEY not configured - cannot install S45 agent');
      return false;
    }

    const response = await fetch(`${backendUrl}/admin/s45-agents/install-user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KORTIX_ADMIN_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to install S45 agent for user:`, errorData);
      return false;
    }

    console.log(`Successfully installed S45 agent for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error installing S45 agent for new user:', error);
    return false;
  }
}

export async function checkAndInstallS45Agent(userId: string, userCreatedAt: string) {
  try {
    // Check if we've already attempted to install for this user
    const installKey = `s45-install-attempted-${userId}`;
    if (localStorage.getItem(installKey)) {
      return;
    }

    const success = await installS45ForNewUser(userId);
    
    if (success) {
      localStorage.setItem(installKey, 'true');
    }
  } catch (error) {
    console.error('Error in checkAndInstallS45Agent:', error);
  }
}
