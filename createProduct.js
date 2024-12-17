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
  let handle = "abc-Burg";
  let title = "Adult Basic Ball Cap Velcrocls";
  let size = "small";
  let color = "Burgundy";
  let descriptionHtml =
    "<b>Blank Apparel:</b> <br>12 pieces per colour in assorted sizes. <br> <br><b>Custom Apparel:</b> <br>48 prints per design, which can be placed on an assortment of our garments meeting the following style minimums: <br>Short Sleeve Garments (Tees, Tanks) 24 pieces per colour <br>Long Sleeve Garments (Hoodies, Crews, Long Sleeves) 12 pieces per colour <br>Pants (Joggers, Shorts) 12 pieces per colour <br> <br>*If your order does not meet the minimum, you will be contacted to revise it.";

  let image_name = "ACN Heather Charcoal";
  let image_src =
    "https://uc91bd8076d9cf4db5097cd8941d.dl.dropboxusercontent.com/cd/0/get/CgN0DU69P2EbFyVG7dRMj_64-_vflsPKfy7adlCOyCYAQiLaigq8w62uhtLlZI9MYH2dzRj5xm-nKd7CoXx6fj1s8FCLEGZthB8ML6-iFYJg4YD3fqGBb2Wr5nfJzxtl-RAMzxQIT4lksR0Kd6yMbjNlPoamb5KvxopSFonWQJhNfA/file";

  const query = `
    mutation CreateProductWithNewMedia($input: ProductInput!, $media: [CreateMediaInput!]) { 
      productCreate(input: $input, media: $media) {
       product {
      id
      options {
        id
        name
        position
        values
        optionValues {
          id
          name
          hasVariants
        }
      }
      variants(first: 5) {
        nodes {
          id
          title
          selectedOptions {
            name
            value
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
  // send the GraphQL request

  const variables = {
    input: {
      title,
      descriptionHtml,
      handle,
      //options: [{ name: "Size", values: ["Small"] }],
      productOptions: [
        {
          name: "Color",
          values: [
            {
              name: color,
            },
          ],
        },
        {
          name: "Size",
          values: [
            {
              name: size,
            },
          ],
        },
      ],
    },
    media: [
      {
        originalSource: image_src,
        alt: image_name,
        mediaContentType: "IMAGE",
      },
    ],
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
