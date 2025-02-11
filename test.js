const addProduct = require("./utils/addProduct");
const checkProductExists = require("./utils/checkProductExists");
const getImageUrl = require("./utils/getImageUrl");

const testProduct = async () => {
  let data = {
    Name: "ACN : ACN-Black--  S",
    "Display Name": "Adult 75/25 Crewneck Sweatshirt",
    Description: "",
    "NRT Colors": [
      "Black",
      "Black",
      "Black",
      "Black",
      "Black",
      "Black",
      "Cardinal",
      "Cardinal",
      "Cardinal",
      "Cardinal",
      "Cardinal",
      "Forest Green",
      "Forest Green",
      "Forest Green",
      "Forest Green",
      "Forest Green",
      "Forest Green",
      "Heather Charcoal",
      "Heather Charcoal",
      "Heather Charcoal",
      "Heather Charcoal",
      "Heather Charcoal",
      "Heather Charcoal",
      "Natural",
      "Natural",
      "Natural",
      "Natural",
      "Natural",
      "Natural",
      "Navy",
      "Navy",
      "Navy",
      "Navy",
      "Navy",
      "Navy",
      "Navy",
      "Oatmeal",
      "Oatmeal",
      "Oatmeal",
      "Oatmeal",
      "Oatmeal",
      "Royal Blue",
      "Royal Blue",
      "Royal Blue",
      "Royal Blue",
      "Royal Blue",
      "Red",
      "Red",
      "Red",
      "Red",
      "Red",
      "Sports Grey",
      "Sports Grey",
      "Sports Grey",
      "Sports Grey",
      "Sports Grey",
      "Sports Grey",
      "White",
      "White",
      "White",
      "White",
      "White",
    ],
    "NRT sizes": [
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "XXXL",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "XXXL",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "XXXL",
      "Extra Small",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "Extra Small",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "XXXL",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "Extra Small",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
      "Small",
      "Medium",
      "Large",
      "XL",
      "XXL",
    ],
    Parent: "ACN",
    "BREEZEMAX ACTIVE": "Yes",
    "On Hand": [
      187, 164, 58, 143, 228, 163, 139, 99, 99, 103, 69, 976, 1232, 1253, 1145,
      706, 0, 984, 985, 975, 1046, 476, 0, 0, 251, 336, 327, 234, 100, 460,
      1165, 1059, 766, 1209, 588, 0, 771, 788, 1096, 1237, 700, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 445, 1242, 1189, 1283, 1162, 428, 310, 439, 541, 433, 280,
    ],
    "On Order": "600",
    "Store Description":
      "<b>Blank Apparel:</b>  <br>12 pieces per colour in assorted sizes.  <br>  <br><b>Custom Apparel:</b>  <br>48 prints per design, which can be placed on an assortment of our garments meeting the following style minimums:  <br>Short Sleeve Garments (Tees, Tanks) – 24 pieces per colour  <br>Long Sleeve Garments (Hoodies, Crews, Long Sleeves) – 12 pieces per colour  <br>Pants (Joggers, Shorts) – 12 pieces per colour  <br>  <br>*If your order does not meet the minimum, you will be contacted to revise it.",
    "Store Display Name": "Adult Basic Crewneck",
    "Image Name": [
      "ACN_Black",
      "ACN_Black",
      "ACN_Black",
      "ACN_Black",
      "ACN_Black",
      "ACN_Black",
      "ACN_Cardinal",
      "ACN_Cardinal",
      "ACN_Cardinal",
      "ACN_Cardinal",
      "ACN_Cardinal",
      "ACN_Forest Green",
      "ACN_Forest Green",
      "ACN_Forest Green",
      "ACN_Forest Green",
      "ACN_Forest Green",
      "ACN_Forest Green",
      "ACN_Heather Charcoal",
      "ACN_Heather Charcoal",
      "ACN_Heather Charcoal",
      "ACN_Heather Charcoal",
      "ACN_Heather Charcoal",
      "ACN_Heather Charcoal",
      "ACN_Natural",
      "ACN_Natural",
      "ACN_Natural",
      "ACN_Natural",
      "ACN_Natural",
      "ACN_Natural",
      "ACN_Navy",
      "ACN_Navy",
      "ACN_Navy",
      "ACN_Navy",
      "ACN_Navy",
      "ACN_Navy",
      "ACN_Navy",
      "ACN_Oatmeal",
      "ACN_Oatmeal",
      "ACN_Oatmeal",
      "ACN_Oatmeal",
      "ACN_Oatmeal",
      "ACN_Royal Blue",
      "ACN_Royal Blue",
      "ACN_Royal Blue",
      "ACN_Royal Blue",
      "ACN_Royal Blue",
      "ACN_Red",
      "ACN_Red",
      "ACN_Red",
      "ACN_Red",
      "ACN_Red",
      "ACN_Sports Grey",
      "ACN_Sports Grey",
      "ACN_Sports Grey",
      "ACN_Sports Grey",
      "ACN_Sports Grey",
      "ACN_Sports Grey",
      "ACN_White",
      "ACN_White",
      "ACN_White",
      "ACN_White",
      "ACN_White",
    ],
    active: 0,
    handle: "ACN",
  };

  let handle = data["handle"].toLowerCase();
  let title = data["Display Name"];
  let size = data["NRT sizes"];
  let color = [...new Set(data["NRT Colors"])];
  let descriptionHtml = data["Store Description"];
  let sku = handle;
  let itemQuantity = data["On Hand"];
  let image_name = [...new Set(data["Image Name"])];
  let image_src = [];
  let images = new Map();

  for (let i in image_name) {
    image_src[i] = await getImageUrl(image_name[i]);
    images.set(image_name[i], image_src[i]);
  }
  //console.log(images);
  let productOptionsSizes = [];
  let productVariantsValues = [];
  let productOptionsColors = [];
  let imageFiles = [];
  let imageFile;
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
  } else {
    for (let i in color) {
      imageFile = {};
      let pOptionColor = { name: color[i] };
      if (image_src[i].length > 0) {
        imageFile = {
          originalSource: image_src[i],
          alt: image_name[i],
          filename: image_name[i],
          contentType: "IMAGE",
        };
      }

      productOptionsColors.push(pOptionColor);
      // productVariantsValues.push(vValues);
      if (Object.keys(imageFile).length > 0) imageFiles.push(imageFile);
    }
    // console.log(imageFiles);

    for (let i in itemQuantity) {
      let vValues = {
        optionValues: [
          {
            optionName: "Color",
            name: data["NRT Colors"][i],
          },
          {
            optionName: "Size",
            name: size[i],
          },
        ],
        // file: imageFiles[i],
        sku: sku + "-" + data["NRT Colors"][i] + "-" + size[i],
        inventoryPolicy: "DENY",
        inventoryQuantities: [
          {
            locationId: "gid://shopify/Location/95240028437",
            name: "available",
            quantity: itemQuantity[i],
          },
        ],
      };
      console.log(
        `Color: ${data["NRT Colors"][i]}, Size: ${size[i]}, Quantity: ${itemQuantity[i]}\n`
      );
      //console.log(images.get(data["Image Name"][i].length));
      if (images.get(data["Image Name"][i])) {
        imageFile = {
          originalSource: images.get(data["Image Name"][i]),
          alt: data["Image Name"][i],
          filename: data["Image Name"][i],
          contentType: "IMAGE",
        };
        vValues.file = imageFile;
        //console.log(imageFile);
      }
      productVariantsValues.push(vValues);
    }
    size = [...new Set(size)];
    for (let i in size) {
      let pOptionSize = { name: size[i] };
      productOptionsSizes.push(pOptionSize);
    }
  }
  //console.log(productOptionsColors, imageFiles, productOptionsSizes);
  //  console.log(JSON.stringify(productVariantsValues, null, 2));

  //console.log(JSON.stringify(productVariantsValues, null, 2));
  let variables;
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
  } else {
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
          {
            name: "Size",
            position: 2,
            values: productOptionsSizes,
          },
        ],
        files: imageFiles,
        variants: productVariantsValues,
      },
    };
  }

  console.log(JSON.stringify(variables, null, 2));
  const productExist = await checkProductExists(data.handle.toLowerCase());
  if (!productExist) {
    const response = await addProduct(data);
    console.log(response);
  } else console.log("Product exists");
};
testProduct();
