exports.handler = async function (event, context) {
  console.log("Checking URL redirect...");

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { url } = JSON.parse(event.body); // Extract a single URL from the request body

    if (!url || typeof url !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input. 'url' must be a valid string." })
      };
    }

    async function checkRedirect(url) {
      try {
        const response = await fetch(url, {
          method: "GET",
          redirect: "manual",
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
          return {
            url,
            redirect: true,
            redirectUrl: redirectUrl || "Redirect detected but 'Location' header is missing."
          };
        } else {
          return {
            url,
            redirect: false,
            statusCode: response.status
          };
        }
      } catch (error) {
        return {
          url,
          error: error.message
        };
      }
    }

    const result = await checkRedirect(url);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message })
    };
  }
};
