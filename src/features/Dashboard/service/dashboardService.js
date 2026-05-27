import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import {
  DASHBOARD_COPY,
  DASHBOARD_FALLBACK_RESPONSE,
  DASHBOARD_PACKAGE_PROFIT_MARGIN_FALLBACK_RESPONSE,
  DASHBOARD_TRIP_SALES_FALLBACK_RESPONSE,
} from '../constants/dashboard.constants'

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value) || 0)

const formatCurrency = (value) => `BDT ${formatNumber(value)}`

const formatPercent = (value) =>
  `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}%`

const formatLabel = (value) =>
  String(value ?? '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const toNumber = (value) => Number(value) || 0

const getToneByRank = (index) => {
  if (index === 0) return 'success'
  if (index === 1) return 'info'
  return 'warning'
}

const normalizeTripSales = (payload) => {
  const rows = payload?.data ?? payload ?? []
  const totalAmount = rows.reduce((sum, item) => sum + toNumber(item.total_transaction), 0)
  const monthLabel = rows[0]?.month ?? 'Current month'

  return {
    monthLabel,
    totalAmount,
    totalAmountLabel: formatCurrency(totalAmount),
    items: rows.map((item, index) => {
      const amount = toNumber(item.total_transaction)
      const share = totalAmount ? Math.round((amount / totalAmount) * 100) : 0

      return {
        id: `${item.trip_name}-${index}`,
        tripName: item.trip_name || 'Untitled trip',
        monthLabel: item.month || monthLabel,
        totalTransaction: amount,
        totalTransactionLabel: formatCurrency(amount),
        share,
        shareLabel: `${share}% of visible sales`,
      }
    }),
    chartItems: rows
      .map((item, index) => ({
        id: `${item.trip_name}-${index}`,
        label: item.trip_name || 'Untitled trip',
        value: toNumber(item.total_transaction),
      }))
      .filter((item) => item.value > 0),
  }
}

const normalizePackageProfitMargin = (payload) => {
  const rows = payload?.data ?? payload ?? []
  const totalGrossProfit = rows.reduce((sum, item) => sum + toNumber(item.gross_profit), 0)
  const averageMargin = rows.length
    ? rows.reduce((sum, item) => sum + toNumber(item.margin_percentage), 0) / rows.length
    : 0

  return {
    totalGrossProfit,
    totalGrossProfitLabel: formatCurrency(totalGrossProfit),
    averageMargin,
    averageMarginLabel: formatPercent(averageMargin),
    items: rows.map((item, index) => ({
      id: `${item.package_name}-${index}`,
      packageName: item.package_name || 'Untitled package',
      totalRevenueLabel: formatCurrency(item.total_revenue),
      totalFixedCostLabel: formatCurrency(item.total_fixed_cost),
      grossProfitLabel: formatCurrency(item.gross_profit),
      marginPercentage: toNumber(item.margin_percentage),
      marginPercentageLabel: formatPercent(item.margin_percentage),
    })),
    chartItems: rows
      .map((item, index) => ({
        id: `${item.package_name}-${index}`,
        label: item.package_name || 'Untitled package',
        value: toNumber(item.margin_percentage),
      }))
      .sort((first, second) => second.value - first.value),
  }
}

export const normalizeDashboardOverview = (
  payload,
  tripSalesPayload = DASHBOARD_TRIP_SALES_FALLBACK_RESPONSE,
  packageProfitPayload = DASHBOARD_PACKAGE_PROFIT_MARGIN_FALLBACK_RESPONSE,
) => {
  const source = payload?.data ?? payload ?? {}
  const tripSales = normalizeTripSales(tripSalesPayload)
  const packageProfitMargin = normalizePackageProfitMargin(packageProfitPayload)
  const totalTrips = source.tripData?.reduce((sum, item) => sum + toNumber(item.trip_exist), 0) ?? 0
  const totalPaymentAmount = source.paymentData?.reduce((sum, item) => sum + toNumber(item.total_amount), 0) ?? 0
  const paymentCaptureRate = source.totalTransaction
    ? Math.round((toNumber(source.totalPayments) / toNumber(source.totalTransaction)) * 100)
    : 0

  const tripOrigins = (source.tripData ?? []).map((item, index) => {
    const tripCount = toNumber(item.trip_exist)
    const share = totalTrips ? Math.round((tripCount / totalTrips) * 100) : 0

    return {
      id: `${item.origin}-${index}`,
      origin: item.origin || 'Unknown region',
      tripCount,
      tripCountLabel: formatNumber(tripCount),
      share,
      shareLabel: `${share}% of trip coverage`,
      tone: getToneByRank(index),
    }
  })

  const paymentMethods = (source.paymentData ?? []).map((item, index) => {
    const amount = toNumber(item.total_amount)
    const share = totalPaymentAmount ? Math.round((amount / totalPaymentAmount) * 100) : 0

    return {
      id: `${item.payment_method}-${index}`,
      paymentMethod: formatLabel(item.payment_method),
      totalAmountLabel: formatCurrency(amount),
      paymentHeldLabel: formatNumber(item.payment_held),
      share,
      shareLabel: `${share}% of collected value`,
      tone: getToneByRank(index),
    }
  })

  const metrics = [
    {
      id: 'monthly-payments',
      label: 'Monthly payments',
      value: formatCurrency(source.monthlyPayments),
      change: `${formatNumber(source.totalPayments)} captured payments`,
      tone: 'green',
    },
    {
      id: 'total-transactions',
      label: 'Total transactions',
      value: formatNumber(source.totalTransaction),
      change: `${paymentCaptureRate}% capture rate`,
      tone: 'blue',
    },
    {
      id: 'total-tours',
      label: 'Active tours',
      value: formatNumber(source.totalTours),
      change: `${formatNumber(source.totalRoute)} routes active`,
      tone: 'amber',
    },
    {
      id: 'package-profit',
      label: 'Package gross profit',
      value: packageProfitMargin.totalGrossProfitLabel,
      change: `${packageProfitMargin.averageMarginLabel} avg margin`,
      tone: 'cyan',
    },
  ]

  const summaryStats = [
    { id: 'guides', label: 'Guides', value: formatNumber(source.totalGuide) },
    { id: 'packages', label: 'Packages', value: formatNumber(source.totalPackage) },
    { id: 'routes', label: 'Routes', value: formatNumber(source.totalRoute) },
    { id: 'vehicles', label: 'Vehicles', value: formatNumber(source.totalVehicles) },
    { id: 'tables', label: 'Tables', value: formatNumber(source.totalTable) },
    { id: 'payments', label: 'Payments', value: formatNumber(source.totalPayments) },
    { id: 'trip-regions', label: 'Trip regions', value: formatNumber(totalTrips) },
    { id: 'avg-margin', label: 'Avg margin', value: packageProfitMargin.averageMarginLabel },
  ]

  return {
    copy: DASHBOARD_COPY,
    metrics,
    summaryStats,
    tripOrigins,
    paymentMethods,
    packageProfitMargin,
    tripSales,
    paymentCaptureRate,
    totals: {
      monthlyPayments: formatCurrency(source.monthlyPayments),
      totalTransactions: formatNumber(source.totalTransaction),
      totalPayments: formatNumber(source.totalPayments),
      totalTours: formatNumber(source.totalTours),
      totalRoutes: formatNumber(source.totalRoute),
      totalVehicles: formatNumber(source.totalVehicles),
      totalTripRegions: formatNumber(totalTrips),
      currentMonthTripSales: tripSales.totalAmountLabel,
      packageGrossProfit: packageProfitMargin.totalGrossProfitLabel,
      packageAverageMargin: packageProfitMargin.averageMarginLabel,
    },
  }
}

const fallbackDashboardOverview = normalizeDashboardOverview(
  DASHBOARD_FALLBACK_RESPONSE,
  DASHBOARD_TRIP_SALES_FALLBACK_RESPONSE,
  DASHBOARD_PACKAGE_PROFIT_MARGIN_FALLBACK_RESPONSE,
)

export const getDashboardOverview = async () => {
  const [overviewResult, tripSalesResult, packageProfitResult] = await Promise.allSettled([
    apiRequest(API_URLS.dashboard.overview),
    apiRequest(API_URLS.dashboard.currentMonthTripSales),
    apiRequest(API_URLS.dashboard.packageProfitMargin),
  ])

  const overviewPayload =
    overviewResult.status === 'fulfilled' ? overviewResult.value : DASHBOARD_FALLBACK_RESPONSE
  const tripSalesPayload =
    tripSalesResult.status === 'fulfilled' ? tripSalesResult.value : DASHBOARD_TRIP_SALES_FALLBACK_RESPONSE
  const packageProfitPayload =
    packageProfitResult.status === 'fulfilled'
      ? packageProfitResult.value
      : DASHBOARD_PACKAGE_PROFIT_MARGIN_FALLBACK_RESPONSE

  if (overviewPayload) {
    return normalizeDashboardOverview(overviewPayload, tripSalesPayload, packageProfitPayload)
  }

  return fallbackDashboardOverview
}
