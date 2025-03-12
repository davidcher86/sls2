exports.hello = async (event: any) => {
  console.log('rrr:' + JSON.stringify(event));
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go 2 Serverless v4! Your function executed successfully!",
    }),
  };
};
