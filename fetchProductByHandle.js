const axios = require("axios");
require("dotenv").config();

const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Headers for Shopify API
const headers = {
  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json",
};

const fetchProductByHandle = async (handle) => {
  const query = `
      query GetProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          descriptionHtml
          createdAt
          updatedAt
          options {
            name
            values
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price
              }
            }
          }
        }
      }
    `;

  const variables = { handle };

  try {
    const response = await axios.post(
      SHOPIFY_URL,
      { query, variables },
      {
        headers,
      }
    );

    if (response.data.errors) {
      console.error(
        "GraphQL Errors:",
        JSON.stringify(response.data.errors, null, 2)
      );
    } else {
      console.log(
        "Product Details:",
        JSON.stringify(response.data.data.productByHandle, null, 2)
      );
    }
  } catch (error) {
    console.error(
      "Error fetching product by handle:",
      error.response?.data || error.message
    );
  }
};

// Replace with the product handle you want to retrieve
const productHandle = "yts-Sapph-1";
fetchProductByHandle(productHandle);
