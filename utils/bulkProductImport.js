const axios = require("axios");
require("dotenv").config();
const fs = require("fs");

const API_URL = `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2024-10/graphql.json`;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Headers for Shopify API
const headers = {
  "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json",
};

async function getSignedUploadUrl() {
  const mutation = `
      mutation {
        stagedUploadsCreate(input: {
          resource: BULK_MUTATION_VARIABLES,
           filename: "bulk_op_vars",
          mimeType: "text/jsonl",
          httpMethod: POST
        }) {
          stagedTargets {
            url
            resourceUrl,
            parameters {
            name,
            value
        }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

  const response = await axios.post(API_URL, { query: mutation }, { headers });
  const { stagedTargets, userErrors, parameters } =
    response.data.data.stagedUploadsCreate;

  return stagedTargets[0]; // URL and resourceUrl
}

async function uploadFileToSignedUrl(stagedTargets) {
  const formData = new FormData();
  stagedTargets.parameters.forEach((param) => {
    formData.append(param.name, param.value);
  });

  const buffer = fs.readFileSync("./products.jsonl");
  const blob = new Blob([buffer]);
  const myFile = new File([blob], "products.jsonl");

  formData.append("file", myFile);

  try {
    // // Upload Update File
    const uploadUrlResult = await fetch(stagedTargets.url, {
      method: "POST",
      body: formData,
    });
    //console.log(uploadUrlResult);
    const resultXml = await uploadUrlResult.text();
    const regex = /<Key>(.*?)<\/Key>/;
    const stagedUploadPath = resultXml.match(regex)[1];
    return stagedUploadPath;
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response?.data || error.message
    );
  }
}

async function startBulkOperation(resourceUrl) {
  const mutation = `
      mutation {
        bulkOperationRunMutation(
          stagedUploadPath: "${resourceUrl}",
          mutation: """
           mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
    productSet(synchronous: $synchronous, input: $productSet) {
              product {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
          """
        ) {
          bulkOperation {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

  const response = await axios.post(
    API_URL,
    { query: mutation },
    {
      headers,
    }
  );
  const { bulkOperation, userErrors } =
    response.data.data.bulkOperationRunMutation;
}

const performBulkProductImport = async () => {
  try {
    // Step 1: Get signed upload URL
    const signedTarget = await getSignedUploadUrl();
    if (!signedTarget) return;
    // Step 2: Upload JSONL file to signed URL
    const stagedUploadPath = await uploadFileToSignedUrl(signedTarget);
    // Step 3: Start bulk operation
    await startBulkOperation(stagedUploadPath);
  } catch (error) {
    console.error("Error in bulk product import:", error.message);
  }
};

module.exports = performBulkProductImport;
