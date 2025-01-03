const axios = require("axios");
require("dotenv").config();

const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Headers for Shopify API
const headers = {
  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json",
};

const createProduct = async () => {
  const query = `
    mutation CreateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          options {
            id
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
                selectedOptions {
                  name
                  value
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
      title: "T-Shirt with Size and Color",
      options: [
        {
          name: "Size",
          values: ["S", "M", "L"],
        },
        {
          name: "Color",
          values: ["Red", "Blue"],
        },
      ],
      variants: [
        {
          title: "Small Red",
          price: "19.99",
          sku: "SKU001",
          options: ["S", "Red"],
        },
        {
          title: "Medium Red",
          price: "19.99",
          sku: "SKU002",
          options: ["M", "Red"],
        },
        {
          title: "Large Red",
          price: "19.99",
          sku: "SKU003",
          options: ["L", "Red"],
        },
        {
          title: "Small Blue",
          price: "19.99",
          sku: "SKU004",
          options: ["S", "Blue"],
        },
        {
          title: "Medium Blue",
          price: "19.99",
          sku: "SKU005",
          options: ["M", "Blue"],
        },
        {
          title: "Large Blue",
          price: "19.99",
          sku: "SKU006",
          options: ["L", "Blue"],
        },
      ],
    },
  };

  try {
    //const response = await shopify.graphql(query, variables);
    const response = await axios.post(
      SHOPIFY_URL,
      { query, variables },
      { headers }
    );
    const { data, errors } = response.data;

    if (errors || data.productCreate.userErrors.length > 0) {
      console.error("Errors:", errors || data.productCreate.userErrors);
    } else {
      console.log("Product created:", data.productCreate.product);
    }
  } catch (error) {
    console.error(
      "Error creating product:",
      error.response?.data || error.message
    );
  }
};

createProduct();
