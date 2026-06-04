/** eBay final value fee approximation (category-dependent; default ~13.25% + $0.30) */
const DEFAULT_FVF_RATE = 0.1325;
const PER_ORDER_FEE = 0.3;

export function calculateEbayFees(salePrice: number, rate = DEFAULT_FVF_RATE) {
  if (salePrice <= 0) return 0;
  return Number((salePrice * rate + PER_ORDER_FEE).toFixed(2));
}

export function calculateProfit(input: {
  salePrice: number;
  shippingCost: number;
  costBasis: number;
  taxRate?: number;
  ebayFeeRate?: number;
}) {
  const { salePrice, shippingCost, costBasis, taxRate = 0, ebayFeeRate } = input;
  const ebayFees = calculateEbayFees(salePrice, ebayFeeRate);
  const taxAmount = Number((salePrice * taxRate).toFixed(2));
  const netProfit = Number(
    (salePrice - shippingCost - ebayFees - taxAmount - costBasis).toFixed(2),
  );
  const roiPct =
    costBasis > 0 ? Number(((netProfit / costBasis) * 100).toFixed(2)) : 0;

  return {
    salePrice,
    shippingCost,
    ebayFees,
    taxAmount,
    costBasis,
    netProfit,
    roiPct,
  };
}
