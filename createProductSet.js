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
  let handle = "yts-Sapph";
  let title = "Youth Basic Tee";
  let size = ["Small", "Medium", "Large", "XL"];
  //let size = "Small";
  let color = "Sapphire";
  let sku = "YTS-Sapph";
  let descriptionHtml =
    "<b>Blank Apparel:</b> <br>12 pieces per colour in assorted sizes. <br> <br><b>Custom Apparel:</b> <br>48 prints per design, which can be placed on an assortment of our garments meeting the following style minimums: <br>Short Sleeve Garments (Tees, Tanks) 24 pieces per colour <br>Long Sleeve Garments (Hoodies, Crews, Long Sleeves) 12 pieces per colour <br>Pants (Joggers, Shorts) 12 pieces per colour <br> <br>*If your order does not meet the minimum, you will be contacted to revise it.";
  let productOptionsSizes = [];
  let productVariantsValues = [];
  for (let i in size) {
    let pOption = { name: size[i] };
    let vValues = {
      optionValues: [
        {
          optionName: "Color",
          name: color,
        },
        {
          optionName: "Size",
          name: size[i],
        },
      ],
      sku: sku + "-" + size[i],
      inventoryPolicy: "DENY",
      inventoryQuantities: [
        {
          locationId: "gid://shopify/Location/95240028437",
          name: "available",
          quantity: 12,
        },
      ],
    };
    productOptionsSizes.push(pOption);
    productVariantsValues.push(vValues);
  }
  //console.log(JSON.stringify(productVariantsValues, null, 2));
  // let image_name = "ACN Heather Charcoal";
  // let image_src =
  //   "https://uc91bd8076d9cf4db5097cd8941d.dl.dropboxusercontent.com/cd/0/get/CgN0DU69P2EbFyVG7dRMj_64-_vflsPKfy7adlCOyCYAQiLaigq8w62uhtLlZI9MYH2dzRj5xm-nKd7CoXx6fj1s8FCLEGZthB8ML6-iFYJg4YD3fqGBb2Wr5nfJzxtl-RAMzxQIT4lksR0Kd6yMbjNlPoamb5KvxopSFonWQJhNfA/file";

  const query = `
   mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
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
    productSetOperation {
      id
      status
      userErrors {
        code
        field
        message
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

  const variables = {
    synchronous: true,
    productSet: {
      title,
      descriptionHtml,
      handle,

      productOptions: [
        {
          name: "Color",
          position: 1,
          values: [
            {
              name: color,
            },
          ],
        },
        {
          name: "Size",
          position: 2,
          // values: [
          //   {
          //     name: "Small",
          //   },
          //   {
          //     name: "Medium",
          //   },
          // ],
          values: productOptionsSizes,
        },
      ],
      // files: [
      //   {
      //     originalSource: image_src,
      //     alt: image_name,
      //     filename: image_name,
      //     contentType: "IMAGE",
      //   },
      // ],

      // variants: [
      //   {
      //     optionValues: [
      //       {
      //         optionName: "Color",
      //         name: color,
      //       },
      //       {
      //         optionName: "Size",
      //         name: "Small",
      //       },
      //     ],
      //   },
      //   {
      //     optionValues: [
      //       {
      //         optionName: "Color",
      //         name: color,
      //       },
      //       {
      //         optionName: "Size",
      //         name: "Medium",
      //       },
      //     ],
      //   },
      // ],
      variants: productVariantsValues,
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
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(
      "Error creating product:",
      error.response?.data || error.message
    );
  }
};

createProduct();
