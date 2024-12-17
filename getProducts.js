require("dotenv").config();
const axios = require("axios");
const { fetchProducts, getQuery } = require("./utils.js");

const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE}.myshopify.com/admin/api/2024-10/graphql.json`;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

//fetchProducts(SHOPIFY_URL, SHOPIFY_ACCESS_TOKEN);
// GraphQL query to fetch products
// const query = `
//   {
//     products(first: 5) {
//       edges {
//         node {
//           id
//           title
//           handle
//           description
//           variants(first: 1) {
//             edges {
//               node {
//                 id
//                 title
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// `;
//getQuery(SHOPIFY_URL, query);

// Create Product
async function createProduct() {
  const mutation = `
      mutation {
        productCreate(input: {
          title: "New Product",
          descriptionHtml: "<p>This is a new product</p>",
          variants: [{ price: "29.99", sku: "NEW123" }]
        }) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  const response = await axios.post(
    SHOPIFY_URL,
    { query: mutation },
    {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(JSON.stringify(response.data, null, 2));
}

createProduct();
