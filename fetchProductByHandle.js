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
        `GraphQL Errors: ${JSON.stringify(response.data.errors)}`
      );
    }
    return response.data.data;
  } catch (error) {
    console.error("GraphQL Error:", error.message);
    throw error;
  }
}
// Step 3: Enable inventory tracking for each variant
async function enableInventoryTracking(inventoryItemIds) {
  const mutation = `
   mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
  inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem {
          id
          tracked
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  for (const inventoryItemId of inventoryItemIds) {
    const variables = { id: inventoryItemId, input: { tracked: true } };
    await executeGraphQL(mutation, variables);
    console.log(
      `Inventory tracking enabled for Inventory Item ID: ${inventoryItemId}`
    );
  }
}

const fetchProductByHandle = async (handle) => {
  const query = `
      query GetProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          variants(first: 10) {
              edges {
                node {
                  id
                  inventoryItem {
                    id
                  }
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
    //console.log(JSON.stringify(response.data, null, 2));
    if (response.data.errors) {
      console.error(
        "GraphQL Errors:",
        JSON.stringify(response.data.errors, null, 2)
      );
    } else {
      const inventoryItemIds =
        response.data.data.productByHandle.variants.edges.map(
          (variant) => variant.node.inventoryItem.id
        );
      await enableInventoryTracking(inventoryItemIds);

      console.log("All variants now have inventory tracking enabled.");
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
const productHandle = "yts-sapph";
fetchProductByHandle(productHandle);
