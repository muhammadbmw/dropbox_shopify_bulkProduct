const addProduct = require("./utils/addProduct");
const checkProductExists = require("./utils/checkProductExists");

const testProduct = async () => {
  let data = {
    Name: "ABC : ABC-Brown",
    "Display Name": "Adult Basic Ball Cap Velcro<",
    Description: "",
    "NRT Colors": "Brown",
    "NRT sizes": [],
    Parent: "ABC",
    "BREEZEMAX ACTIVE": "Yes",
    "On Hand": [0],
    "On Order": "",
    "Store Description":
      "<b>Blank Apparel:</b> <br>12 pieces per colour in assorted sizes. <br> <br><b>Custom Apparel:</b> <br>48 prints per design, which can be placed on an assortment of our garments meeting the following style minimums: <br>Short Sleeve Garments (Tees, Tanks) – 24 pieces per colour <br>Long Sleeve Garments (Hoodies, Crews, Long Sleeves) – 12 pieces per colour <br>Pants (Joggers, Shorts) – 12 pieces per colour <br> <br>*If your order does not meet the minimum, you will be contacted to revise it.",
    "Store Display Name": "Adult Basic Ballcap (new price!)",
    "Image Name": "ABC_Brown",
    active: 0,
    handle: "ABC-Brown",
  };

  const productExist = await checkProductExists(data.handle.toLowerCase());
  if (!productExist) {
    const response = await addProduct(data);
    console.log(response);
  } else console.log("Product exists");
};
testProduct();
