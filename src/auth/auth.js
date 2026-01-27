import axios from 'axios';
import config from '../config/config.js';

/**
 * Validates an OAuth token with Twitch
 */
export async function validateToken(token) {
  try {
    const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `OAuth ${token.replace('oauth:', '')}`
      }
    });
    
    return {
      valid: true,
      data: response.data
    };
  } catch (error) {
    return {
      valid: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Gets an app access token (for API calls, not chat)
 */
export async function getAppAccessToken() {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: config.twitch.clientId,
        client_secret: config.twitch.clientSecret,
        grant_type: 'client_credentials'
      }
    });

    return {
      success: true,
      token: response.data.access_token,
      expiresIn: response.data.expires_in
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Refreshes a user access token
 */
export async function refreshToken(refreshToken) {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: config.twitch.clientId,
        client_secret: config.twitch.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }
    });

    return {
      success: true,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

export default {
  validateToken,
  getAppAccessToken,
  refreshToken
};
