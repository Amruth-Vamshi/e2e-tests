import { logger } from "./logger";
import axios, {AxiosRequestConfig} from 'axios';

export async function createUser(email: string, password: string, index: number): Promise<any> {
  try {
    const url = `${process.env.FUSIONAUTH_BASE_URL}/api/user/registration`;
    const apiKey = process.env.FUSIONAUTH_API_KEY || '';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    };

    const userData = {
      registration: {
        applicationId: process.env.APPLICATION_ID
      },
      user: {
        email,
        password,
      }
    };

    const response = await axios.post(url, userData, { headers });

    if (response.status === 200) {
      logger.logProcess(`User${index}`, `created successfully!`);
      return response.data;
    } else {
      logger.logProcess(`User${index}`, `Failed to create User${index}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logger.logProcess(`User${index}`, `Error creating User${index}: ${error}`);
    return false;
  }
}

export async function deleteUser(userId: string) {
  try {
    const url = `${process.env.FUSIONAUTH_BASE_URL}/api/user/${userId}?hardDelete=true`;
    const apiKey = process.env.FUSIONAUTH_API_KEY || '';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    };

    await axios.delete(url, { headers });

    console.log('User deleted successfully!');
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const url = `${process.env.FUSIONAUTH_BASE_URL}/api/login`;
    const apiKey = process.env.FUSIONAUTH_API_KEY || '';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    };

    const credentials = {
      loginId: email,
      password
    };

    const response = await axios.post(url, credentials, { headers });

    if (response.status === 200) {
      console.log('User logged in successfully!');
      return response.data;
    } else {
      console.error('Failed to log in:', response.statusText);
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
}

export async function deleteAllUsers() {
  logger.logProcess('AllUsers', 'deleting all users....');
  const apiKey = process.env.FUSIONAUTH_API_KEY || '';
  const headers = {
    'Authorization': apiKey,
    'x-application-id': process.env.APPLICATION_ID || ''
  };

  const requestOptions: AxiosRequestConfig = {
    method: 'DELETE',
    headers: headers,
    url: `${process.env.FUSIONAUTH_BASE_URL}/api/user/bulk?hardDelete=true&queryString=registrations.applicationId:${process.env.APPLICATION_ID}`
  };

  try {
    const response = await axios(requestOptions);
    const result = response.data;
    logger.logProcess('AllUsers', 'deleted users');
    logger.logProcess('AllUsers', result.userIds);
  } catch (error) {
    logger.logProcess('AllUsers', `error ${error}`);
  }
}

export async function deleteUserQueries(userId: string) {
  const headers = {
    'Content-Type': 'application/json',
    'x-hasura-admin-secret': process.env.HASURA_SECRET || ''
  };

  const requestOptions: AxiosRequestConfig = {
    method: 'DELETE',
    headers: headers,
    url: `${process.env.HASURA_BASE_URL}/api/rest/query/${userId}`
  };

  try {
    const response = await axios(requestOptions);
    console.log(userId, response.data);
  } catch (error) {
    console.log(userId, `error ${error}`);
  }
}