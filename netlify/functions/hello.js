exports.handler = async function(event, context) {
  console.log("Hello, this function runs on a schedule!");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, world!" })
  };
};