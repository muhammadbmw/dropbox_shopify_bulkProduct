const axios = require("axios");
require("dotenv").config();

const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Headers for Shopify API
const headers = {
  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json",
};

// Function to execute a GraphQL query/mutation
async function executeGraphQL(query, variables = {}) {
  try {
    const response = await axios.post(
      SHOPIFY_URL,
      { query, variables },
      { headers }
    );
    if (response.data.errors) {
      throw new Error(
        `GraphQL Errors: ${JSON.stringify(response.data.errors, null, 2)}`
      );
    }
    return response.data;
  } catch (error) {
    console.error("GraphQL Error:", error.message);
    throw error;
  }
}

module.exports = executeGraphQL;
