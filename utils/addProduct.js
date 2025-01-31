const executeGraphQL = require("./config");
const getImageUrl = require("./getImageUrl");

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
    // console.log(
    //   `Inventory tracking enabled for Inventory Item ID: ${inventoryItemId}`
    // );
  }
}

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
  const response = await executeGraphQL(query);
  //console.log(JSON.stringify(response, null, 2));
  return response.data.publications.edges.map((edge) => edge.node);
}

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

  const response = await executeGraphQL(query, variables);
  //console.log(JSON.stringify(response, null, 2));
  if (response.data.publishablePublish.userErrors.length > 0) {
    console.error(
      "Publishing Errors:",
      response.data.publishablePublish.userErrors
    );
  }

  return response.data.publishablePublish.publishable.availablePublicationsCount
    .count;
}

module.exports = async (data) => {
  let handle = data["handle"].toLowerCase();
  let title = data["Display Name"];
  let size = data["NRT sizes"];
  let color = data["NRT Colors"];
  let descriptionHtml = data["Store Description"];
  let sku = handle;
  let itemQuantity = data["On Hand"];
  let image_name = data["Image Name"];
  let image_src = [];
  for (let i in image_name) image_src[i] = await getImageUrl(image_name[i]);

  let productOptionsSizes = [];
  let productVariantsValues = [];
  let productOptionsColors = [];
  let imageFiles = [];
  let imageFile;

  // if (size.length > 0) {
  //   for (let i in size) {
  //     let pOption = { name: size[i] };
  //     let vValues = {
  //       optionValues: [
  //         {
  //           optionName: "Color",
  //           name: color,
  //         },
  //         {
  //           optionName: "Size",
  //           name: size[i],
  //         },
  //       ],
  //       sku: sku + "-" + size[i],
  //       inventoryPolicy: "DENY",
  //       inventoryQuantities: [
  //         {
  //           locationId: "gid://shopify/Location/95240028437",
  //           name: "available",
  //           quantity: itemQuantity[i],
  //         },
  //       ],
  //     };
  //     productOptionsSizes.push(pOption);
  //     productVariantsValues.push(vValues);
  //   }
  // }
  if (size.length === 0 && color.length > 0) {
    for (let i in color) {
      imageFile = "";
      let pOption = { name: color[i] };
      if (image_src[i].length > 0) {
        imageFile = {
          originalSource: image_src[i],
          alt: image_name[i],
          filename: image_name[i],
          contentType: "IMAGE",
        };
      }
      let vValues = {
        optionValues: [
          {
            optionName: "Color",
            name: color[i],
          },
        ],
        file: imageFile,
        sku: sku + "-" + color[i],
        inventoryPolicy: "DENY",
        inventoryQuantities: [
          {
            locationId: "gid://shopify/Location/95240028437",
            name: "available",
            quantity: itemQuantity[i],
          },
        ],
      };
      productOptionsColors.push(pOption);
      productVariantsValues.push(vValues);
      imageFiles.push(imageFile);
    }
  }

  const query = `
    mutation createProduct($productSet: ProductSetInput!, $synchronous: Boolean!) {
    productSet(synchronous: $synchronous, input: $productSet) {
            product {
                id
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
            userErrors {
                code
                field
                message
            }
       }
    }
    `;
  // send the GraphQL request
  let variables;
  // if (size.length > 0) {
  //   variables = {
  //     synchronous: true,
  //     productSet: {
  //       title,
  //       status: "DRAFT",
  //       descriptionHtml,
  //       handle,
  //       productOptions: [
  //         {
  //           name: "Color",
  //           position: 1,
  //           values: [
  //             {
  //               name: color,
  //             },
  //           ],
  //         },
  //         {
  //           name: "Size",
  //           position: 2,
  //           values: productOptionsSizes,
  //         },
  //       ],
  //       // files: [
  //       //   {
  //       //     originalSource: image_src,
  //       //     alt: image_name,
  //       //     filename: image_name,
  //       //     contentType: "IMAGE",
  //       //   },
  //       // ],
  //       variants: productVariantsValues,
  //     },
  //   };
  // } else {
  //   variables = {
  //     synchronous: true,
  //     productSet: {
  //       title,
  //       status: "DRAFT",
  //       descriptionHtml,
  //       handle,
  //       productOptions: [
  //         {
  //           name: "Color",
  //           position: 1,
  //           values: [
  //             {
  //               name: color,
  //             },
  //           ],
  //         },
  //       ],
  //       // files: [
  //       //   {
  //       //     originalSource: image_src,
  //       //     alt: image_name,
  //       //     filename: image_name,
  //       //     contentType: "IMAGE",
  //       //   },
  //       // ],
  //       variants: [
  //         {
  //           optionValues: [
  //             {
  //               optionName: "Color",
  //               name: color,
  //             },
  //           ],
  //           sku,
  //           inventoryPolicy: "DENY",
  //           inventoryQuantities: [
  //             {
  //               locationId: "gid://shopify/Location/95240028437",
  //               name: "available",
  //               quantity: itemQuantity[0],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   };
  // }
  // if (image_src.length > 0) {
  //   variables.productSet.files = [
  //     {
  //       originalSource: image_src,
  //       alt: image_name,
  //       filename: image_name,
  //       contentType: "IMAGE",
  //     },
  //   ];
  // }
  if (size.length === 0 && color.length > 0) {
    variables = {
      synchronous: true,
      productSet: {
        title,
        //status: "DRAFT",
        descriptionHtml,
        handle,
        productOptions: [
          {
            name: "Color",
            position: 1,
            values: productOptionsColors,
          },
        ],
        files: imageFiles,
        variants: productVariantsValues,
      },
    };
  }

  const response = await executeGraphQL(query, variables);
  //console.log(JSON.stringify(response.data, null, 2));
  if (response.data.productSet.product) {
    const productId = response.data.productSet.product.id;
    const inventoryItemIds =
      response.data.productSet.product.variants.edges.map(
        (variant) => variant.node.inventoryItem.id
      );
    await enableInventoryTracking(inventoryItemIds);

    const publications = await getPublications();
    //console.log("Available Publications:", publications);
    const publicationIds = publications.map((pub) => pub.id); // Publish to all available publications
    //console.log(publicationIds);
    for (const publicationId of publicationIds) {
      await publishProduct(productId, publicationId);
      //console.log("Product Published:", publishedProduct);
    }
    return productId;
  }

  return response.data;
};
