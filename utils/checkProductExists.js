const executeGraphQL = require("./config");

module.exports = async (handle) => {
  const query = `
    query($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
      }
    }
  `;

  const variables = { handle };
  const response = await executeGraphQL(query, variables);
  if (response.data.productByHandle) {
    //console.log("Product exists:", response.data.productByHandle);
    return true;
  } else {
    // console.log("Product does not exist.");
    return false;
  }
};
