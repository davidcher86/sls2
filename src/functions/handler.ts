module.exports.hello = async (event: any) => {
  console.log('event' + JSON.stringify(event));
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go go4 Serverless v4! Your function executed successfully!",
    }),
  };
};
