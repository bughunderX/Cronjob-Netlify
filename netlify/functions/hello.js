exports.handler = async function (event, context) {
  console.log("Checking URL redirects...");

  const urlList = [
    "https://www.fromjapan.co.jp/japan/en/special/order/confirm/kanteidan:10002352/2_1/",
    "https://www.fromjapan.co.jp/japan/en/special/order/confirm/kanteidan:10002804/2_1/"
  ];

  async function checkRedirect(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.5",
          "Connection": "keep-alive"
        }
      });

      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get("Location");
        return redirectUrl ? `The URL ${url} redirects to: ${redirectUrl}` : `Redirect detected for ${url}, but 'Location' header is missing.`;
      } else {
        return `The URL ${url} does not redirect. Status code: ${response.status}`;
      }
    } catch (error) {
      return `An error occurred with ${url}: ${error.message}`;
    }
  }

  const results = await Promise.all(urlList.map(url => checkRedirect(url)));
  results.forEach(result => console.log(result));

  return {
    statusCode: 200,
    body: JSON.stringify({ results })
  };
};
