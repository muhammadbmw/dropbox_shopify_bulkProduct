const fs = require("fs");

let handle = "abc-Burg";
let title = "Adult Basic Ball Cap Velcrocls";
let size = "small";
let color = "Burgundy";
let descriptionHtml =
  "<b>Blank Apparel:</b> <br>12 pieces per colour in assorted sizes. <br> <br><b>Custom Apparel:</b> <br>48 prints per design, which can be placed on an assortment of our garments meeting the following style minimums: <br>Short Sleeve Garments (Tees, Tanks) 24 pieces per colour <br>Long Sleeve Garments (Hoodies, Crews, Long Sleeves) 12 pieces per colour <br>Pants (Joggers, Shorts) 12 pieces per colour <br> <br>*If your order does not meet the minimum, you will be contacted to revise it.";

let image_name = "ACN Heather Charcoal";
let image_src =
  "https://uc91bd8076d9cf4db5097cd8941d.dl.dropboxusercontent.com/cd/0/get/CgN0DU69P2EbFyVG7dRMj_64-_vflsPKfy7adlCOyCYAQiLaigq8w62uhtLlZI9MYH2dzRj5xm-nKd7CoXx6fj1s8FCLEGZthB8ML6-iFYJg4YD3fqGBb2Wr5nfJzxtl-RAMzxQIT4lksR0Kd6yMbjNlPoamb5KvxopSFonWQJhNfA/file";

const products = [
  {
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
        values: [
          {
            name: size,
          },
        ],
      },
    ],
    files: [
      {
        originalSource: image_src,
        alt: image_name,
        filename: image_name,
        contentType: "IMAGE",
      },
    ],
    variants: [
      {
        optionValues: [
          {
            optionName: "Color",
            name: color,
          },
          {
            optionName: "Size",
            name: size,
          },
        ],
      },
    ],
  },
];

function createJsonlFile(products, outputPath) {
  const jsonlData = products
    .map((product) =>
      JSON.stringify({ synchronous: false, productSet: product })
    )
    .join("\n");

  fs.writeFileSync(outputPath, jsonlData, "utf8");
  console.log(`JSONL file created at ${outputPath}`);
}

createJsonlFile(products, "products.jsonl");
