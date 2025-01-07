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

// Step 2: Get Available Publications
async function getPublications() {
  const query = `
    query {
      publications(first: 10) {
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
  return response.data.publications.edges.map((edge) => edge.node);
}

// Step 3: Publish the Product
async function publishProduct(productId, publicationId) {
  const query = `
   mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
        publishable {
     availablePublicationsCount {
        count
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
    id: productId,
    input: { publicationId },
  };

  const response = await shopifyGraphQL(query, variables);
  console.log(JSON.stringify(response, null, 2));
  if (response.data.publishablePublish.userErrors.length > 0) {
    console.error(
      "Publishing Errors:",
      response.data.publishablePublish.userErrors
    );
  }

  return response.data.publishablePublish.publishable.availablePublicationsCount
    .count;
}

// Step 2: Create a Custom Collection
async function createCollection(title) {
  const query = `
    mutation collectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
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
      title,
    },
  };

  const response = await shopifyGraphQL(query, variables);
  if (response.data.collectionCreate.userErrors.length > 0) {
    console.error(
      "Collection Creation Errors:",
      response.data.collectionCreate.userErrors
    );
    return null;
  }

  return response.data.collectionCreate.collection.id;
}

// Step 3: Add Product to Collection
async function addProductToCollection(collectionId, productId) {
  const query = `
    mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        collection {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    id: collectionId,
    productIds: [productId],
  };

  const response = await shopifyGraphQL(query, variables);

  if (response.data.collectionAddProducts.userErrors.length > 0) {
    console.error(
      "Adding Product to Collection Errors:",
      response.data.productToCollectionAdd.userErrors
    );
    return false;
  }

  return true;
}

// Step 4: Publish the Collection
async function publishCollection(collectionId, publicationId) {
  const query = `
    mutation PublishablePublish($collectionId: ID!, $publicationId: ID!) {
       publishablePublish(id: $collectionId, input: {publicationId: $publicationId}) {
        publishable {
          publishedOnPublication(publicationId: $publicationId)
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    collectionId,
    publicationId,
  };

  const response = await shopifyGraphQL(query, variables);
  console.log(JSON.stringify(response, null, 2));
  if (response.data.publishablePublish.userErrors.length > 0) {
    console.error(
      "Publishing Collection Errors:",
      response.data.publishablePublish.userErrors
    );
  }

  return response.data.publishablePublish.publishable.publishedOnPublication;
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
      const productId = response.data.data.productByHandle.id;
      const title = response.data.data.productByHandle.title;
      if (!productId) {
        console.error("Product creation failed.");
        return;
      }
      console.log("Product created with ID:", productId);

      // Create a collection
      // const collectionId = await createCollection(title);
      // if (!collectionId) return console.error("Failed to create collection.");
      // console.log("Collection created with ID:", collectionId);

      // Add the product to the collection
      // const productAdded = await addProductToCollection(
      //   collectionId,
      //   productId
      // );
      // if (!productAdded)
      //   return console.error("Failed to add product to collection.");
      // console.log("Product added to collection.");

      const publications = await getPublications();
      console.log("Available Publications:", publications);
      const publicationIds = publications.map((pub) => pub.id); // Publish to all available publications
      console.log(publicationIds);
      for (const publicationId of publicationIds) {
        const publishedProduct = await publishProduct(productId, publicationId);
        console.log("Product Published:", publishedProduct);
      }
      // Publish the collection
      // for (const publicationId of publicationIds) {
      //   const publishedCollection = await publishCollection(
      //     collectionId,
      //     publicationId
      //   );
      //   console.log("Collection Published:", publishedCollection);
      // }
    }
  } catch (error) {
    console.error(
      "Error fetching product by handle:",
      error.response?.data || error.message
    );
  }
};

// Replace with the product handle you want to retrieve
const productHandle = "abc-brown";
fetchProductByHandle(productHandle);
