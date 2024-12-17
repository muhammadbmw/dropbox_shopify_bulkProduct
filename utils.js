const axios = require("axios");
require("dotenv").config();

// Function to check access token validity
async function isAccessTokenValid(accessToken) {
  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/2/users/get_current_account",
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data) return true; // Token is valid
    else false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return false; // Token is invalid or expired
    }
    throw error; // Other errors
  }
}

// Function to refresh access token
async function refreshAccessToken(refreshToken) {
  const CLIENT_ID = process.env.DROPBOX_APP_KEY;
  const CLIENT_SECRET = process.env.DROPBOX_APP_SECRET;

  try {
    const response = await axios.post(
      "https://api.dropboxapi.com/oauth2/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    //console.log(response.data);
    const { access_token, expires_in } = response.data;
    // Update your token storage with the new access token and expiration
    return { accessToken: access_token, expiresIn: expires_in };
  } catch (error) {
    console.error(
      "Error refreshing access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to refresh access token");
  }
}

async function getValidAccessToken(accessToken, refreshToken) {
  const isValid = await isAccessTokenValid(accessToken);

  if (isValid) {
    return accessToken; // Return the current access token
  } else {
    const { accessToken: newAccessToken } = await refreshAccessToken(
      refreshToken
    );
    return newAccessToken; // Return the new access token
  }
}

async function getQuery(url, query) {
  try {
    const response = await axios.post(
      url,
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    //throw new Error("Failed to query");
  }
}

// Fetch Products
async function fetchProducts(url, access_token) {
  const query = `
    {
      products(first: 5) {
        edges {
          node {
            id
            title
            handle
            description
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  `;
  const response = await axios.post(
    url,
    { query },
    {
      headers: {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(JSON.stringify(response.data, null, 2));
}

module.exports = { getValidAccessToken, getQuery, fetchProducts };
