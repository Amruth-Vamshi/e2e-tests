import { logger } from "./logger";

export async function createUser(email:string, password:string, index: number): Promise<any> {
    try {
        // FusionAuth API endpoint
        const url = `${process.env.FUSIONAUTH_BASE_URL}/api/user/registration`;
    
        // FusionAuth API key
        const apiKey = process.env.FUSIONAUTH_API_KEY || '';
    
        // Request headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': apiKey,
        };
    
        // User data
        const userData = {
            registration: {
                applicationId: process.env.APPLICATION_ID
            },
            user: {
                email,
                password,
            }
        // Add other user data fields as needed
        };
    
        // Create user request
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(userData),
        });
        if (response.ok) {
            logger.logProcess(`User${index}`,`created successfully!`);
            const data = await response.json();
            return data
        } else {
            logger.logProcess(`User${index}`,`Failed to create User${index}: ${response.statusText}`);
        }
        return false
    } catch (error) {
        logger.logProcess(`User${index}`,`Error creating User${index}: ${error}`);
        return false
    }
}

export async function deleteUser(userId: string) {
    try {
      // FusionAuth API endpoint
      const url = `${process.env.FUSIONAUTH_BASE_URL}/api/user/${userId}?hardDelete=true`;
  
      // FusionAuth API key
      const apiKey = process.env.FUSIONAUTH_API_KEY || '';
  
      // Request headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      };
  
      // Delete user request
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });
  
      if (response.ok) {
        console.log('User deleted successfully!');
      } else {
        console.error('Failed to delete user:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
}

export async function loginUser(email:string,password:string) {
    try {
      // FusionAuth API endpoint
      const url = `${process.env.FUSIONAUTH_BASE_URL}/api/login`;
  
      // FusionAuth API key
      const apiKey = process.env.FUSIONAUTH_API_KEY || '';
  
      // Request headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      };
  
      // User credentials
      const credentials = {
        loginId: email,
        password
      };
  
      // User login request
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(credentials),
      });
  
      if (response.ok) {
        console.log('User logged in successfully!');
        const data = await response.json();
        return data
      } else {
        console.error('Failed to log in:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
}

export async function deleteAllUsers(){
    logger.logProcess('AllUsers','deleting all users....')
    var myHeaders = new Headers();
    const apiKey = process.env.FUSIONAUTH_API_KEY || '';
    myHeaders.append("Authorization", apiKey);
    myHeaders.append("x-application-id", process.env.APPLICATION_ID || '');

    var requestOptions: RequestInit = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow'
    };

    try {
        let result: any = await fetch(`${process.env.FUSIONAUTH_BASE_URL}/api/user/bulk?hardDelete=true&queryString=registrations.applicationId:${process.env.APPLICATION_ID}`, requestOptions)
        result = await result.json()
        logger.logProcess('AllUsers','deleted users')
        logger.logProcess('AllUsers',result.userIds)
    } catch(error) {
        logger.logProcess(`AllUsers`,`error ${error}`)
    }
}