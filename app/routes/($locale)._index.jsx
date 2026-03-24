import { Await, useLoaderData, Link } from 'react-router';
import { Suspense, useMemo } from 'react';
import { Image } from '@shopify/hydrogen';
import { ProductItem } from '~/components/ProductItem';
import { Swiper, SwiperSlide } from 'swiper/react';
// import 'swiper/css/bundle';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "swiper/css/thumbs";
import Carousel from './carousel';

import { Autoplay, Navigation, Pagination } from 'swiper/modules';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: 'Hydrogen | Home' }];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({ context }) {
  const [{ collections }] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({ context }) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  const carousel = useMemo(() => (
    <Carousel/>
  ), []);

  return (

    <div className="home">

      {carousel}
      <RecommendedProducts products={data.recommendedProducts} />
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      <FeaturedCollections collections={data.featuredCollection} />

    </div>

  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
// function FeaturedCollection({ collection }) {
//   if (!collection) return null;
//   const image = collection?.image;
//   return (
//     <>
//      <h2>Featured Collections</h2>
//     <Link
//       className="featured-collection"
//       to={`/collections/${collection.handle}`}
//     >
//       {image && (
//         <div className="featured-collection-image">
//           <Image data={image} sizes="100vw" />
//         </div>
//       )}
//       <h1>{collection.title}</h1>
//     </Link>
//     </>
//   ); 
// }

function FeaturedCollections({ collections }) {

  if (!collections || collections.length === 0) return null;

  return (
    <>
      <h2>Featured Collections</h2>

      <div className="featured-collections-grid">
        {collections.map((collection) => {
          const image = collection?.image;

          return (
            <Link
              key={collection.id}
              className="featured-collection"
              to={`/collections/${collection.handle}`}
            >
              {image && (
                <div className="featured-collection-image">
                  <Image data={image} sizes="100vw" />
                </div>
              )}

              <h1>{collection.title}</h1>
            </Link>
          );
        })}
      </div>
    </>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({ products }) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => {
            // Add this console.log to see what you're getting
            console.log('Product handles:', response?.products?.nodes?.map(p => p.handle));

            return (
              <div className="recommended-products-grid">
                {response
                  ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                  : null}
              </div>
            );
          }}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 3, sortKey: TITLE, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: PRICE, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
