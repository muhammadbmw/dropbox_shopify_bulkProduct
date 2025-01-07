const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const processData = require("../utils/processData");
const performBulkProductImport = require("../utils/bulkProductImport");

// Controller function to handle successful file uploads
const uploadFile = async (req, res, next) => {
  if (!req.file) {
    const error = new Error("File attachment not found!");
    error.status = 400;
    return next(error);
  }
  const fileType = path.extname(req.file.originalname).toLowerCase();
  if (fileType !== ".csv") {
    const error = new Error("CSV file format only!");
    error.status = 400;
    return next(error);
  }
  const products = await readCSVFile(req.file.path);
  // createJsonlFile(products, "products.jsonl");
  // performBulkProductImport();
  let processedProducts = [];
  for (const product of products) {
    if (product.active === 1) {
      let tokens = product.Name.split(":");
      let handle = cleanHyphens(tokens[1]);
      let size = product["NRT sizes"];
      if (size) {
        tokens = handle.split("-");
        handle = tokens[0] + "-" + tokens[1];
      }
      const filterData = products.filter((item) => item.Name.includes(handle));
      let sizes = [];
      let hand = [];
      for (let item of filterData) {
        item["active"] = 0;
        if (item["NRT sizes"]) sizes.push(item["NRT sizes"]);
        hand.push(Number(item["On Hand"]));
      }
      //console.log(JSON.stringify(filterData, null, 2));
      product["NRT sizes"] = sizes;
      product["On Hand"] = hand;
      product["handle"] = handle;
      processedProducts.push(product);
    }
  }
  res.json({
    message: "File uploaded successfully",
    size: processedProducts.length,
    data: processedProducts,
  });
};

function cleanHyphens(str) {
  // Replace multiple hyphens with a single hyphen
  str = str.replace(/-+/g, "-");

  // Remove spaces before and after hyphens
  str = str.replace(/\s*-\s*/g, "-");

  // Remove leading/trailing hyphens and spaces
  return str.trim().replace(/^-|-$/g, "");
}

async function readCSVFile(filePath) {
  const results = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  for await (const row of stream) {
    try {
      // const processedRow = await processData(row); // Process each row
      //results.push(processedRow); // Add the processed row to results
      row["active"] = 1;
      results.push(row);
    } catch (error) {
      console.error("Error processing row:", error);
    }
  }
  fs.unlink(filePath, () => {});
  return results;
}
// Controller function to handle errors
const uploadErrorHandler = (err, req, res, next) => {
  res.status(400).send(err.message);
};

function createJsonlFile(products, outputPath) {
  const jsonlData = products
    .map((product) =>
      JSON.stringify({ synchronous: false, productSet: product })
    )
    .join("\n");

  fs.writeFileSync(outputPath, jsonlData, "utf8");
  // console.log(`JSONL file created at ${outputPath}`);
}

module.exports = { uploadFile, uploadErrorHandler };
