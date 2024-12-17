const getImageUrl = require("./getImageUrl");

module.exports = async (data) => {
  let handle = data.Name;
  let title = data["Display Name"];
  let size = data["NRT sizes"];
  let color = data["NRT Colors"];
  let descriptionHtml = data["Store Description"];
  let image_name = data["Image Name"];
  let image_src = await getImageUrl(image_name);

  let product = {
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
  };
  //return product;
  return new Promise((resolve) => {
    resolve(product);
    //   setTimeout(() => {
    //     resolve(product); // Return processed row
    //   }, 100); // Simulate delay
  });
};
