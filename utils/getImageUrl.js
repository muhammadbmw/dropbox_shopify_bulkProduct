require("dotenv").config();
const axios = require("axios");

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

const getImageUrl = async (image_name) => {
  const storedAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
  const storedRefreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  let path_display,
    link = "";
  try {
    const validAccessToken = await getValidAccessToken(
      storedAccessToken,
      storedRefreshToken
    );

    const response = await axios.post(
      "https://api.dropboxapi.com/2/files/search_v2",
      {
        match_field_options: { include_highlights: false },
        query: `${image_name}`,
        options: {
          max_results: 1,
          filename_only: true,
          file_status: "active",
          path: "/Product Photos",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${validAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log(JSON.stringify(response.data, null, 2));
    if (
      response.data.matches.length > 0 &&
      response.data.matches[0].metadata.metadata.name.includes(image_name)
    ) {
      path_display = response.data.matches[0].metadata.metadata.path_display;

      const response2 = await axios.post(
        "https://api.dropboxapi.com/2/files/get_temporary_link",
        {
          path: path_display,
        },
        {
          headers: {
            Authorization: `Bearer ${validAccessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      //res.json(response2.data);
      if (response2.data) {
        link = response2.data.link;
      }
      // res.json(link);
      //return link;
    } else {
      // res.json({
      //   message: "Image not found",
      // });
    }
    return link;
    // res.json(validAccessToken);
  } catch (error) {
    console.error(
      "Error fetching secure data:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to fetch data");
  }
};
module.exports = getImageUrl;
