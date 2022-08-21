import { TruffleGQlConnection } from "../deps.ts";
import { Collectible } from "./collectible.types.ts";

export interface Product {
  id: string;
  source: Collectible;
  productVariants: ProductVariantConnection;
}

export type ProductConnection = TruffleGQlConnection<Product>;

export interface ProductVariant {
  amountType: string;
  amountValue: number;
  amountId: string;
}

export type ProductVariantConnection = TruffleGQlConnection<ProductVariant>;
