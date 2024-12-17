require("dotenv").config();
const axios = require("axios");

// Dropbox app credentials
const CLIENT_ID = process.env.DROPBOX_APP_KEY;
const CLIENT_SECRET = process.env.DROPBOX_APP_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/dropbox/callback";

const dropboxAuth = (req, res) => {
  const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&token_access_type=offline&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}`;
  res.redirect(authUrl);
};

const dropboxCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      "https://api.dropboxapi.com/oauth2/token",
      null,
      {
        params: {
          code,
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    // console.log(tokenResponse);
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    // Save these tokens securely for future use
    res.json({ access_token, refresh_token, expires_in });
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response?.data || error.message
    );
    res.status(500).send("Authentication failed");
  }
};

module.exports = { dropboxAuth, dropboxCallback };
