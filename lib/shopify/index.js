/**
 * Request Helper
 */

export async function request(query, variables = {}) {
  const API_URL =
    "https://sanity-plugin-store.myshopify.com/api/2021-01/graphql.json";
  const TOKEN = "56a92fdfe8a7a585db63b30836fd7bbf";

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": TOKEN,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (res.ok) {
      const json = await res.json();

      if (json.errors) {
        return {
          errors: json.errors,
        };
      }

      return {
        ...json.data,
      };
    } else {
      console.error("Problem issuing request => res:", res);
      return res;
    }
  } catch (err) {
    console.error("Problem issuing request => err:", err);
    return err;
  }
}
