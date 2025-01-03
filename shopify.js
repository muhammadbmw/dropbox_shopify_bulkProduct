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

// Step 1: Create product with variants
// Step 1: Create product with variants
async function createProductWithVariants() {
  const mutation = `
      mutation AddProduct($input: ProductCreateInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  sku
                  inventoryItem {
                    id
                    tracked
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  const variables = {
    input: {
      title: "T-Shirt",
      options: [{ name: "Color" }, { name: "Size" }],
      variants: [
        {
          title: "Red - Small",
          sku: "TSHIRT-RED-S",
          optionValues: [
            { name: "Color", value: "Red" },
            { name: "Size", value: "Small" },
          ],
          price: "25.00",
          inventoryManagement: "SHOPIFY",
          inventoryPolicy: "DENY",
          quantity: 100,
        },
        {
          title: "Red - Medium",
          sku: "TSHIRT-RED-M",
          optionValues: [
            { name: "Color", value: "Red" },
            { name: "Size", value: "Medium" },
          ],
          price: "25.00",
          inventoryManagement: "SHOPIFY",
          inventoryPolicy: "DENY",
          quantity: 100,
        },
        {
          title: "Blue - Small",
          sku: "TSHIRT-BLUE-S",
          optionValues: [
            { name: "Color", value: "Blue" },
            { name: "Size", value: "Small" },
          ],
          price: "25.00",
          inventoryManagement: "SHOPIFY",
          inventoryPolicy: "DENY",
          quantity: 100,
        },
        {
          title: "Blue - Medium",
          sku: "TSHIRT-BLUE-M",
          optionValues: [
            { name: "Color", value: "Blue" },
            { name: "Size", value: "Medium" },
          ],
          price: "25.00",
          inventoryManagement: "SHOPIFY",
          inventoryPolicy: "DENY",
          quantity: 100,
        },
      ],
    },
  };
  await executeGraphQL(mutation, variables);
  console.log("Product created successfully.");
}

// Step 2: Retrieve product by title
async function getProductByTitle(title) {
  const query = `
    query GetProductByTitle($title: String!) {
      products(first: 1, query: $title) {
        edges {
          node {
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
      }
    }
  `;
  const variables = { title };
  const data = await executeGraphQL(query, variables);
  return data.products.edges[0].node;
}

// Step 3: Enable inventory tracking for each variant
async function enableInventoryTracking(inventoryItemIds) {
  const mutation = `
    mutation UpdateInventoryItem($input: InventoryItemUpdateInput!) {
      inventoryItemUpdate(input: $input) {
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
    const variables = { input: { id: inventoryItemId, tracked: true } };
    await executeGraphQL(mutation, variables);
    console.log(
      `Inventory tracking enabled for Inventory Item ID: ${inventoryItemId}`
    );
  }
}

// Main function to orchestrate the process
async function main() {
  try {
    // Step 1: Create product with variants
    await createProductWithVariants();

    // Step 2: Retrieve product by title
    const product = await getProductByTitle("T-Shirt");
    console.log(`Product ID: ${product.id}`);

    // Step 3: Enable inventory tracking
    const inventoryItemIds = product.variants.edges.map(
      (variant) => variant.node.inventoryItem.id
    );
    await enableInventoryTracking(inventoryItemIds);

    console.log("All variants now have inventory tracking enabled.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the script
main();
