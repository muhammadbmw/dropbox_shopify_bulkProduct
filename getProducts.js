const axios = require("axios");
require("dotenv").config();

const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Headers for Shopify API
const headers = {
  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json",
};

//fetchProducts(SHOPIFY_URL, SHOPIFY_ACCESS_TOKEN);
// GraphQL query to fetch products
const query = `
    query GetProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges {
          cursor
          node {
            id
            title
            handle
          totalInventory
          tracksInventory
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
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

const getProduct = async () => {
  let products = [];
  let hasNextPage = true;
  let cursor = null;
  try {
    while (hasNextPage) {
      const variables = {
        first: 50, // Fetch 50 products per request
        after: cursor,
      };
      const response = await axios.post(
        SHOPIFY_URL,
        { query, variables },
        {
          headers,
        }
      );
      const data = response.data.data.products;
      products = products.concat(data.edges.map((edge) => edge.node));
      hasNextPage = data.pageInfo.hasNextPage;
      cursor =
        data.edges.length > 0 ? data.edges[data.edges.length - 1].cursor : null;
    }

    console.log(
      `Fetched ${products.length} products:`,
      JSON.stringify(products, null, 2)
    );
    const locations = await getLocations();
    console.log("Locations:", locations[0].id);
  } catch (error) {
    console.error(
      "Error fetching products:",
      error.response?.data || error.message
    );
  }
};

// Function to send GraphQL requests
async function shopifyGraphQL(query, variables = {}) {
  try {
    const response = await axios.post(
      SHOPIFY_URL,
      { query, variables },
      {
        headers,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "GraphQL Request Failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Fetch Locations
async function getLocations() {
  const query = `
    query {
      locations(first: 5) {
        edges {
          node {
            id
            name
       
          }
        }
      }
    }
  `;

  const response = await shopifyGraphQL(query);
  console.log(JSON.stringify(response, null, 2));
  return response.data.locations.edges.map((edge) => edge.node);
}

getProduct();
