import { groq } from "next-sanity";
import { gql, GraphQLClient } from "graphql-request";
import { getClient } from "../lib/sanity";
import { ProductCard } from "../components/ProductCard";

const homepageQuery = groq`*[_type == "homepage"]{...}[0]`;

function HomePage({ data }) {
  const { homepageData, collection } = data;

  return (
    <>
      <main className="bg-gray-50">
        <div className="h-96 bg-indigo-500 flex justify-center items-center px-4">
          <h1 className="text-white font-semibold text-6xl">
            {homepageData.heroTitle}
          </h1>
        </div>

        {collection?.products?.edges.length > 0 && (
          <section className="container mx-auto py-12 px-4">
            <h2 className="font-semibold text-4xl mb-8">Featured Products</h2>
            <div className="grid grid-flow-row sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-auto gap-8">
              {collection.products.edges.map((product) => {
                return <ProductCard product={product} />;
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="text-center py-4">
        <p>
          Developed with{" "}
          <a
            href="https://sanity.io"
            target="_blank"
            className="text-indigo-500 font-medium"
          >
            Sanity
          </a>
          ,{" "}
          <a
            href="https://shopify.com"
            target="_blank"
            className="text-indigo-500 font-medium"
          >
            Shopify
          </a>{" "}
          &amp;{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="text-indigo-500 font-medium"
          >
            Next.js
          </a>
        </p>
      </footer>
    </>
  );
}

export default HomePage;

export async function getStaticProps() {
  const homepageData = await getClient().fetch(homepageQuery, {});
  const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_SHOPIFY_URL, {
    headers: {
      "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_TOKEN,
    },
  });

  // Shopify Request
  const query = gql`
    {
      collectionByHandle(handle: "homepage") {
        id
        title
        products(first: 12) {
          edges {
            node {
              id
              title
              variants(first: 12) {
                edges {
                  node {
                    id
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    altText
                    transformedSrc
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await graphQLClient.request(query);

  if (res.errors) {
    console.log(JSON.stringify(res.errors, null, 2));
    throw Error("Unable to retrieve Shopify Products. Please check logs");
  }

  return {
    props: {
      data: {
        homepageData,
        collection: res.collectionByHandle,
      },
    },
  };
}
