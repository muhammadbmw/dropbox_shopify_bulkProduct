require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const SHOPIFY_API_VERSION = "2024-10";
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const API_URL = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
const AUTH_HEADER = `Basic ${Buffer.from(
  `${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_API_PASSWORD}`
).toString("base64")}`;

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

  const response = await axios.post(
    API_URL,
    { query: mutation },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
    }
  );
  //console.log(JSON.stringify(response.data, null, 2));
  const { stagedTargets, userErrors, parameters } =
    response.data.data.stagedUploadsCreate;

  if (userErrors.length > 0) {
    console.error("Error fetching signed URL:", userErrors);
    return null;
  }

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
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
    }
  );
  console.log(JSON.stringify(response.data, null, 2));
  const { bulkOperation, userErrors } =
    response.data.data.bulkOperationRunMutation;

  if (userErrors.length > 0) {
    console.error("Error starting bulk operation:", userErrors);
    return null;
  }

  console.log("Bulk operation started:", bulkOperation);
}

async function performBulkProductImport() {
  try {
    // Step 1: Get signed upload URL
    const signedTarget = await getSignedUploadUrl();
    if (!signedTarget) return;

    // Step 2: Upload JSONL file to signed URL
    // const sampleProducts = `
    //   {"product": {"title": "Sample Product 1", "variants": [{"price": "19.99"}]}}
    //   {"product": {"title": "Sample Product 2", "variants": [{"price": "29.99"}]}}
    //   `;
    const stagedUploadPath = await uploadFileToSignedUrl(signedTarget);
    // Step 3: Start bulk operation
    await startBulkOperation(stagedUploadPath);
  } catch (error) {
    console.error("Error in bulk product import:", error.message);
  }
}

performBulkProductImport();
