import { useLoaderData, data } from 'react-router';
import { CartForm } from '@shopify/hydrogen';
import { CartMain } from '~/components/CartMain';
import axios from 'axios';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: `Hydrogen | Cart` }];
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({ actionHeaders }) => actionHeaders;
/**
 * @param {Route.ActionArgs}
 */
export async function action({ request, context }) {
  const { cart } = context;

  const formData = await request.formData();

  const { action, inputs } = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    // case CartForm.ACTIONS.LinesAdd: {
    //   console.log("🔥 STEP 1: Inside LinesAdd");

    //   // 1️⃣ Get current cart
    //   const currentCart = await cart.get();
    //   const existingLines = currentCart?.lines?.nodes || [];

    //   // 2️⃣ Add new items
    //   result = await cart.addLines(inputs.lines);

    //   console.log("🔥 STEP 2: Cart updated");

    //   // 3️⃣ Merge items (exclude free items)
    //   const mergedItems = [
    //     ...existingLines
    //       .filter(line => !line.attributes?.some(attr => attr.key === "free"))
    //       .map(line => ({
    //         variantId: line.merchandise.id,
    //         quantity: line.quantity,
    //       })),
    //     ...inputs.lines.map(line => ({
    //       variantId: line.merchandiseId,
    //       quantity: line.quantity || 0,
    //     })),
    //   ];

    //   try {
    //     console.log("🔥 STEP 3: Calling backend...");

    //     const response = await axios.post(
    //       'http://127.0.0.1:8080/api/cart/smart',
    //       { items: mergedItems }
    //     );

    //     const smartData = response.data;

    //     console.log("SMART RESPONSE:", smartData);

    //     // 🔍 Check if free item already exists
    //     const freeItemLine = existingLines.find(line =>
    //       line.attributes?.some(attr => attr.key === "free")
    //     );

    //     // 🎁 ADD FREE ITEM (only if not exists)
    //     if (smartData.offerApplied && smartData.freeItem && !freeItemLine) {
    //       console.log("🎁 Adding free product...");

    //       await cart.addLines([
    //         {
    //           // merchandiseId: smartData.freeItem.variantId,
    //           merchandiseId: "gid://shopify/ProductVariant/48099460612335",
    //           quantity: 1,
    //           attributes: [{ key: "free", value: "true" }]
    //         }
    //       ]);
    //     }

    //     // ❌ REMOVE FREE ITEM (if offer not valid)
    //     if (!smartData.offerApplied && freeItemLine) {
    //       console.log("🗑 Removing free product...");

    //       await cart.removeLines([freeItemLine.id]);
    //     }

    //   } catch (err) {
    //     console.error("❌ SMART ERROR:", err);
    //   }

    //   break;
    // }
    case CartForm.ACTIONS.LinesAdd: 
      result = await cart.addLines(inputs.lines); 
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesAdd: {
      const formGiftCardCode = inputs.giftCardCode;

      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      result = await cart.addGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesRemove: {
      const appliedGiftCardIds = inputs.giftCardCodes;
      result = await cart.removeGiftCardCodes(appliedGiftCardIds);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const { cart: cartResult, errors, warnings } = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    { status, headers },
  );
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({ context }) {
  const { cart } = context;
  return await cart.get();
}

export default function Cart() {
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();

  return (
    <div className="cart">
      <h1>Cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}

/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @typedef {import('./+types/cart').Route} Route */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
