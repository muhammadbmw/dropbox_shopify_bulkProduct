const express = require("express");
const uploadRoutes = require("./routes/uploadRoutes");
const dropboxRoutes = require("./routes/dropboxRoutes");
require("dotenv").config();
const axios = require("axios");
const app = express();
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const hostname = "localhost";
const port = 3000;
const getImageUrl = require("./utils/getImageUrl");
const { getValidAccessToken } = require("./utils");

// Dropbox app credentials
const CLIENT_ID = process.env.DROPBOX_APP_KEY;
const CLIENT_SECRET = process.env.DROPBOX_APP_SECRET;
//const REDIRECT_URI = "http://localhost:3000/auth/dropbox/callback";

const REDIRECT_URI = `http://${hostname}:${port}/auth/dropbox/callback`;

app.use("/auth/dropbox", dropboxRoutes);
// app.get("/auth/dropbox", (req, res) => {
//   const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&token_access_type=offline&redirect_uri=${encodeURIComponent(
//     REDIRECT_URI
//   )}`;
//   res.redirect(authUrl);
// });

// app.get("/auth/dropbox/callback", async (req, res) => {
//   const { code } = req.query;

//   try {
//     const tokenResponse = await axios.post(
//       "https://api.dropboxapi.com/oauth2/token",
//       null,
//       {
//         params: {
//           code,
//           grant_type: "authorization_code",
//           client_id: CLIENT_ID,
//           client_secret: CLIENT_SECRET,
//           redirect_uri: REDIRECT_URI,
//         },
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );
//     console.log(tokenResponse);
//     const { access_token, refresh_token, expires_in } = tokenResponse.data;
//     // Save these tokens securely for future use
//     res.json({ access_token, refresh_token, expires_in });
//   } catch (error) {
//     console.error(
//       "Error exchanging code for token:",
//       error.response?.data || error.message
//     );
//     res.status(500).send("Authentication failed");
//   }
// });

// app.get("/refresh-token", async (req, res) => {
//   const refreshToken =
//     "XQqkQ9ZhhewAAAAAAAAAAbZ5ySJKljDSRPHESXy9cetM80oLpjzQGGTy-clINRuP"; // Replace with stored refresh token

//   try {
//     const response = await axios.post(
//       "https://api.dropboxapi.com/oauth2/token",
//       null,
//       {
//         params: {
//           grant_type: "refresh_token",
//           refresh_token: refreshToken,
//           client_id: CLIENT_ID,
//           client_secret: CLIENT_SECRET,
//         },
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     const { access_token, expires_in } = response.data;

//     // Save the new access token securely
//     res.json({ access_token, expires_in });
//   } catch (error) {
//     console.error(
//       "Error refreshing token:",
//       error.response?.data || error.message
//     );
//     res.status(500).send("Failed to refresh token");
//   }
// });

app.get("/getFileUrl", async (req, res) => {
  // const storedAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
  // const storedRefreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  let path_display, link;
  let image_name = "ABC_Heather Charcoal";
  link = await getImageUrl(image_name);
  //console.log(link);
  res.json(link);
  // try {
  //   const validAccessToken = await getValidAccessToken(
  //     storedAccessToken,
  //     storedRefreshToken
  //   );
  //   const response = await axios.post(
  //     "https://api.dropboxapi.com/2/files/search_v2",
  //     {
  //       match_field_options: { include_highlights: false },
  //       query: `${image_name}`,
  //       options: { max_results: 1, filename_only: true, file_status: "active" },
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${validAccessToken}`,
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  //   if (response.data) {
  //     path_display = response.data.matches[0].metadata.metadata.path_display;
  //     const response2 = await axios.post(
  //       "https://api.dropboxapi.com/2/files/get_temporary_link",
  //       {
  //         path: path_display,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${validAccessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     //res.json(response2.data);
  //     if (response2.data) {
  //       link = response2.data.link;
  //     }
  //     res.json(link);
  //   } else {
  //     res.json({
  //       message: "Image not found",
  //     });
  //   }
  //   // res.json(validAccessToken);
  // } catch (error) {
  //   console.error(
  //     "Error fetching secure data:",
  //     error.response?.data || error.message
  //   );
  //   res.status(500).send("Failed to fetch data");
  // }
});

// Use the upload routes
app.use("/api/upload", uploadRoutes);

//Error Handler
app.use(notFound);
app.use(errorHandler);

app.listen(port);
