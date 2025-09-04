"""
S45 Default Agent Service

This service handles the installation and management of the default S45 agent for new users.
"""

import os
import logging
from typing import Optional, Dict, Any
from supabase import create_client, Client

logger = logging.getLogger(__name__)

class S45DefaultAgentService:
    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
    
    def install_default_agent_for_user(self, user_id: str) -> bool:
        """
        Install the default S45 agent for a new user.
        
        Args:
            user_id: The ID of the user to install the agent for
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Create the default agent configuration
            agent_data = {
                "user_id": user_id,
                "name": "S45",
                "description": "Your default AI assistant powered by S45",
                "is_default": True,
                "is_active": True,
                "metadata": {
                    "is_s45_default": True,
                    "version": "1.0.0"
                }
            }
            
            # Insert the agent into the database
            result = self.supabase.table("agents").insert(agent_data).execute()
            
            if result.data:
                logger.info(f"Successfully installed default S45 agent for user {user_id}")
                return True
            else:
                logger.error(f"Failed to install default S45 agent for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error installing default S45 agent for user {user_id}: {str(e)}")
            return False
    
    def get_default_agent_config(self) -> Dict[str, Any]:
        """
        Get the default S45 agent configuration.
        
        Returns:
            Dict containing the default agent configuration
        """
        return {
            "name": "S45",
            "description": "Your default AI assistant powered by S45",
            "is_default": True,
            "is_active": True,
            "metadata": {
                "is_s45_default": True,
                "version": "1.0.0"
            }
        }
