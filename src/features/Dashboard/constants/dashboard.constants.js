export const DASHBOARD_COPY = {
  pageTitle: 'Operations dashboard',
  pageSubtitle: 'Live payment, trip, and inventory performance from your admin API.',
}

export const DASHBOARD_FALLBACK_RESPONSE = {
  data: {
    totalGuide: 2,
    totalPackage: 3,
    totalRoute: 8,
    totalTransaction: 81,
    totalTable: 41,
    totalTours: 19,
    totalVehicles: 8,
    totalPayments: 81,
    monthlyPayments: '4040500.00',
    tripData: [
      { trip_exist: '1', origin: 'America' },
      { trip_exist: '12', origin: 'Asia' },
      { trip_exist: '3', origin: 'Europe' },
      { trip_exist: '3', origin: 'Ocean Area' },
    ],
    paymentData: [
      { total_amount: '1037780.00', payment_held: '22', payment_method: 'bkash' },
      { total_amount: '4241200.00', payment_held: '42', payment_method: 'card' },
      { total_amount: '1835780.00', payment_held: '17', payment_method: 'nagad' },
    ],
  },
  message: 'success',
}

export const DASHBOARD_TRIP_SALES_FALLBACK_RESPONSE = {
  data: [
    { trip_name: 'Explore Coxs Bazar', month: 'May-2026', total_transaction: '28000.00' },
    { trip_name: 'Bangkok trip', month: 'May-2026', total_transaction: '50000.00' },
  ],
  isExecute: 'SUCCESS',
  message: 'Report fetch successfully',
}

export const DASHBOARD_PACKAGE_PROFIT_MARGIN_FALLBACK_RESPONSE = {
  data: [
    {
      package_name: "Grand Package to Cox's Bazar",
      total_revenue: '90000.00',
      total_fixed_cost: '0.00',
      gross_profit: '90000.00',
      margin_percentage: '100.000000',
    },
    {
      package_name: 'Complete Package of New Zealand Travel',
      total_revenue: '2085000.00',
      total_fixed_cost: '0.00',
      gross_profit: '2085000.00',
      margin_percentage: '100.000000',
    },
    {
      package_name: "Grand Package to Cox's Bazar (23 Feb)",
      total_revenue: '900000.00',
      total_fixed_cost: '16500.00',
      gross_profit: '883500.00',
      margin_percentage: '98.166667',
    },
  ],
  isExecute: 'SUCCESS',
  message: 'Report fetch successfully',
}
