const dotenv = require("dotenv");

// Load initial .env variables
dotenv.config();
const fs = require("fs");

const reloadEnv = () => {
  const envConfig = dotenv.parse(fs.readFileSync(".env"));

  for (const key in envConfig) {
    process.env[key] = envConfig[key];
    console.log(key, envConfig[key]);
  }
};
process.env["DROPBOX_ACCESS_TOKEN"] = "test";
// Reload .env variables
//console.log(process.env.test);
reloadEnv();
