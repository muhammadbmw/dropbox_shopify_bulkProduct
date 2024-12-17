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
  createJsonlFile(products, "products.jsonl");
  performBulkProductImport();
  res.json({
    message: "File uploaded successfully",
    data: products,
  });
};

async function readCSVFile(filePath) {
  const results = [];
  const stream = fs.createReadStream(filePath).pipe(csv());
  for await (const row of stream) {
    try {
      const processedRow = await processData(row); // Process each row
      results.push(processedRow); // Add the processed row to results
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
