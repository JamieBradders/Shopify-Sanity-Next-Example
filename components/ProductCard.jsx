import React, { useState } from "react";
import { useRouter } from "next/router";
import { gql, GraphQLClient } from "graphql-request";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Create Checkout Function
   * Creates a shopify checkout url and redirects customer
   * to the Shopify checkout page.
   * @param {string} variantId
   */
  async function createCheckout(variantId) {
    setLoading(true);

    const graphQLClient = new GraphQLClient(
      process.env.NEXT_PUBLIC_SHOPIFY_URL,
      {
        headers: {
          "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_TOKEN,
        },
      }
    );

    const mutation = gql`
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lineItems: [
          {
            variantId,
            quantity: 1,
          },
        ],
      },
    };

    const res = await graphQLClient.request(mutation, variables);

    if (res.checkoutCreate.checkoutUserErrors.length > 0) {
      setLoading(false);
      alert("There was a problem processing the request.");
    } else {
      router.push(res.checkoutCreate.checkout.webUrl);
    }
  }

  return (
    <article
      className="text-center bg-white rounded-xl p-8 shadow-md pt-6 md:p-8 space-y-8"
      key={product.node.id}
    >
      {product.node.images && (
        <Image
          src={product.node.images.edges[0].node.transformedSrc}
          width="125"
          height="125"
          alt={product.node.images.edges[0].node.altText}
          className="rounded-full"
          objectFit="cover"
        />
      )}

      <p className="font-semibold text-2xl">{product.node.title}</p>

      <div className="font-medium">
        <button
          onClick={() => createCheckout(product.node.variants.edges[0].node.id)}
          disabled={loading}
          className={`bg-indigo-500 text-white px-6 py-2 rounded block mb-4 w-full ${
            loading && "opacity-70 cursor-not-allowed"
          }`}
        >
          {loading ? "Please Wait..." : "Buy Now"}
        </button>

        <Link href="/">
          <a className="bg-gray-100 text-gray-800 px-6 py-2 rounded block">
            View Product
          </a>
        </Link>
      </div>
    </article>
  );
}
