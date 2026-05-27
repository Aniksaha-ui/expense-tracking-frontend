import { APP_ROUTES } from "../../../constants/routes";

const toOrderNumber = (value) => {
  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

export const sortMenuItems = (items = []) =>
  [...items]
    .sort((firstItem, secondItem) => toOrderNumber(firstItem.order) - toOrderNumber(secondItem.order))
    .map((item) => ({
      ...item,
      children: sortMenuItems(item.children ?? []),
    }));

const fallbackPrimaryMenuItems = [
  {
    id: "frontend-accounts",
    title: "Accounts",
    path: APP_ROUTES.accounts,
    icon: "MoneyIcon",
    order: 210,
    children: [],
  },
  {
    id: "frontend-categories",
    title: "Categories",
    path: APP_ROUTES.categories,
    icon: "CategoryManagementIcon",
    order: 220,
    children: [],
  },
  {
    id: "frontend-transactions",
    title: "Transactions",
    path: APP_ROUTES.transactions,
    icon: "TransactionsIcon",
    order: 230,
    children: [],
  },
  {
    id: "frontend-transfers",
    title: "Transfers",
    path: APP_ROUTES.transfers,
    icon: "TransactionsIcon",
    order: 240,
    children: [],
  },
  {
    id: "frontend-recurring-expenses",
    title: "Recurring Expenses",
    path: APP_ROUTES.recurringExpenses,
    icon: "RecurringExpenseIcon",
    order: 250,
    children: [],
  },
];

const fallbackReportMenuItems = [
  {
    id: "frontend-account-balance-report",
    title: "Account Balance",
    path: APP_ROUTES.accountBalance,
    icon: "ReportManagementIcon",
    order: 1000,
    children: [],
  },
  {
    id: "frontend-account-history-report",
    title: "Account History",
    path: APP_ROUTES.accountHistory,
    icon: "ReportManagementIcon",
    order: 1001,
    children: [],
  },
  {
    id: "frontend-financial-report",
    title: "Financial Report",
    path: APP_ROUTES.financialReport,
    icon: "ReportManagementIcon",
    order: 1002,
    children: [],
  },
  {
    id: "frontend-customer-value-report",
    title: "Customer Value Report",
    path: APP_ROUTES.customerValueReport,
    icon: "ReportManagementIcon",
    order: 1003,
    children: [],
  },
  {
    id: "frontend-overall-sales-report",
    title: "Overall Sales",
    path: APP_ROUTES.overallSales,
    icon: "ReportManagementIcon",
    order: 1004,
    children: [],
  },
  {
    id: "frontend-route-wise-sales-report",
    title: "Route Wise Sales",
    path: APP_ROUTES.routeWiseSales,
    icon: "ReportManagementIcon",
    order: 1005,
    children: [],
  },
  {
    id: "frontend-ticket-status-report",
    title: "Ticket Status Analysis",
    path: APP_ROUTES.ticketStatusReport,
    icon: "ReportManagementIcon",
    order: 1006,
    children: [],
  },
  {
    id: "frontend-high-cancellation-packages-report",
    title: "High Cancellation Packages",
    path: APP_ROUTES.highCancellationPackages,
    icon: "ReportManagementIcon",
    order: 1007,
    children: [],
  },
];

const findReportMenuItem = (items = []) =>
  items.find((item) => /report/i.test(item.title ?? "") || item.icon === "ReportManagementIcon");

const menuContainsRoute = (items = [], route) =>
  items.some((item) => getSupportedRoute(item.path) === route || menuContainsRoute(item.children ?? [], route));

const withFallbackReportMenuItems = ({ mainMenuItems = [], bottomMenuItems = [] }) => {
  const missingPrimaryMenuItems = fallbackPrimaryMenuItems.filter(
    (item) => !menuContainsRoute([...mainMenuItems, ...bottomMenuItems], item.path),
  );
  const nextMainMenuItems = sortMenuItems([...mainMenuItems, ...missingPrimaryMenuItems]);
  const nextBottomMenuItems = sortMenuItems(bottomMenuItems);
  const missingReportItems = fallbackReportMenuItems.filter(
    (item) => !menuContainsRoute([...nextMainMenuItems, ...nextBottomMenuItems], item.path),
  );

  if (!missingReportItems.length) {
    return {
      mainMenuItems: nextMainMenuItems,
      bottomMenuItems: nextBottomMenuItems,
    };
  }

  const reportMenuItem = findReportMenuItem(nextMainMenuItems) ?? findReportMenuItem(nextBottomMenuItems);

  if (!reportMenuItem) {
    return {
      mainMenuItems: nextMainMenuItems,
      bottomMenuItems: sortMenuItems([...nextBottomMenuItems, ...missingReportItems]),
    };
  }

  const addMissingReports = (items = []) =>
    items.map((item) => {
      if (item.id !== reportMenuItem.id) {
        return {
          ...item,
          children: addMissingReports(item.children ?? []),
        };
      }

      return {
        ...item,
        children: sortMenuItems([...(item.children ?? []), ...missingReportItems]),
      };
    });

  return {
    mainMenuItems: sortMenuItems(addMissingReports(nextMainMenuItems)),
    bottomMenuItems: sortMenuItems(addMissingReports(nextBottomMenuItems)),
  };
};

export const normalizeMenuResponse = (payload) => {
  const menuData = payload?.data;

  return withFallbackReportMenuItems({
    mainMenuItems: sortMenuItems(menuData?.MAIN_MENU_ITEMS ?? []),
    bottomMenuItems: sortMenuItems(menuData?.BOTTOM_MENU_ITEMS ?? []),
  });
};

export const normalizeStoredMenuState = (payload) => {
  if (!payload) {
    return { mainMenuItems: [], bottomMenuItems: [] };
  }

  if (Array.isArray(payload)) {
    return withFallbackReportMenuItems({ mainMenuItems: sortMenuItems(payload), bottomMenuItems: [] });
  }

  if (payload.mainMenuItems || payload.bottomMenuItems) {
    return withFallbackReportMenuItems({
      mainMenuItems: sortMenuItems(payload.mainMenuItems ?? []),
      bottomMenuItems: sortMenuItems(payload.bottomMenuItems ?? []),
    });
  }

  if (payload.data?.MAIN_MENU_ITEMS || payload.data?.BOTTOM_MENU_ITEMS) {
    return normalizeMenuResponse(payload);
  }

  return { mainMenuItems: [], bottomMenuItems: [] };
};

export const hasChildren = (item) => Array.isArray(item?.children) && item.children.length > 0;

export const getSupportedRoute = (path) => {
  if (
    path === "/admin/visa/applications" ||
    path === "/visa/applications" ||
    path === "admin/visa/applications" ||
    path === "visa/applications" ||
    path === "/admin/visa/applications/:id" ||
    path?.startsWith("/admin/visa/applications/")
  ) {
    return APP_ROUTES.visaApplications;
  }

  if (
    path === "/admin/visa/types" ||
    path === "/visa/types" ||
    path === "admin/visa/types" ||
    path === "visa/types" ||
    path === "/admin/visa/types/add" ||
    path === "/admin/visa/types/update/:id" ||
    path?.startsWith("/admin/visa/types/update/")
  ) {
    return APP_ROUTES.visaTypes;
  }

  if (
    path === "/admin/visa/countries" ||
    path === "/visa/countries" ||
    path === "admin/visa/countries" ||
    path === "visa/countries" ||
    path === "/admin/visa/countries/add" ||
    path === "/admin/visa/countries/update/:id" ||
    path?.startsWith("/admin/visa/countries/update/")
  ) {
    return APP_ROUTES.visaCountries;
  }

  if (
    path === "/admin/blog-list" ||
    path === "/blog-list" ||
    path === "admin/blog-list" ||
    path === "blog-list" ||
    path === "/admin/blogs" ||
    path === "/blogs" ||
    path === "/admin/blog/add" ||
    path === "/admin/blog/update/:id" ||
    path?.startsWith("/admin/blog/update/")
  ) {
    return APP_ROUTES.blogs;
  }

  if (
    path === "/admin/menu-items" ||
    path === "/menu-items" ||
    path === "admin/menu-items" ||
    path === "menu-items" ||
    path === "/admin/menu-items/add" ||
    path === "/admin/menu-items/update/:id" ||
    path?.startsWith("/admin/menu-items/update/")
  ) {
    return APP_ROUTES.menuItems;
  }

  if (
    path === "/admin/users" ||
    path === "/users" ||
    path === "admin/users" ||
    path === "users"
  ) {
    return APP_ROUTES.users;
  }

  if (
    path === "/admin/accounts" ||
    path === "/accounts" ||
    path === "admin/accounts" ||
    path === "accounts"
  ) {
    return APP_ROUTES.accounts;
  }

  if (
    path === "/admin/categories" ||
    path === "/categories" ||
    path === "admin/categories" ||
    path === "categories"
  ) {
    return APP_ROUTES.categories;
  }

  if (
    path === "/admin/hotel" ||
    path === "/hotel" ||
    path === "admin/hotel" ||
    path === "hotel" ||
    path === "/admin/hotel/add" ||
    path === "/admin/hotel/update/:id" ||
    path?.startsWith("/admin/hotel/update/")
  ) {
    return APP_ROUTES.hotels;
  }

  if (
    path === "/admin/online-payment-configure" ||
    path === "/online-payment-configure" ||
    path === "admin/online-payment-configure" ||
    path === "online-payment-configure" ||
    path === "/admin/online-payment-configure/add" ||
    path === "/admin/online-payment-configure/update/:id" ||
    path?.startsWith("/admin/online-payment-configure/update/") ||
    path === "/admin/online-configure" ||
    path === "/online-configure" ||
    path === "admin/online-configure" ||
    path === "online-configure"
  ) {
    return APP_ROUTES.onlinePaymentConfig;
  }

  if (path === "/admin/account/daily-balance" || path === "/account/daily-balance") {
    return APP_ROUTES.dailyBalance;
  }

  if (
    path === "/admin/customerValueReport" ||
    path === "/customerValueReport" ||
    path === "admin/customerValueReport" ||
    path === "customerValueReport" ||
    path === "/admin/customerValue"
  ) {
    return APP_ROUTES.customerValueReport;
  }

  if (
    path === "/admin/financialReport" ||
    path === "/financialReport" ||
    path === "admin/financialReport" ||
    path === "financialReport" ||
    path === "/admin/financial_report"
  ) {
    return APP_ROUTES.financialReport;
  }

  if (
    path === "/admin/account/balance" ||
    path === "/account/balance" ||
    path === "admin/account/balance" ||
    path === "account/balance"
  ) {
    return APP_ROUTES.accountBalance;
  }

  if (
    path === "/admin/account/history" ||
    path === "/account/history" ||
    path === "admin/account/history" ||
    path === "account/history"
  ) {
    return APP_ROUTES.accountHistory;
  }

  if (path === "/admin/account/overall-sales" || path === "/account/overall-sales") {
    return APP_ROUTES.overallSales;
  }

  if (path === "/admin/account/route-wise-sales" || path === "/account/route-wise-sales") {
    return APP_ROUTES.routeWiseSales;
  }

  if (path === "/admin/account/ticket-status-report" || path === "/account/ticket-status-report") {
    return APP_ROUTES.ticketStatusReport;
  }

  if (path === "/admin/high-cancellation-packages" || path === "/high-cancellation-packages") {
    return APP_ROUTES.highCancellationPackages;
  }

  if (path === "/admin/refunds" || path === "/admin/refund" || path === "/refunds") {
    return APP_ROUTES.refunds;
  }

  if (
    path === "/admin/recurring-expenses" ||
    path === "/recurring-expenses" ||
    path === "admin/recurring-expenses" ||
    path === "recurring-expenses"
  ) {
    return APP_ROUTES.recurringExpenses;
  }

  if (
    path === "/admin/transfers" ||
    path === "/transfers" ||
    path === "admin/transfers" ||
    path === "transfers"
  ) {
    return APP_ROUTES.transfers;
  }

  if (
    path === "/admin/transactions" ||
    path === "/transactions" ||
    path === "admin/transactions" ||
    path === "transactions" ||
    path === "/admin/transaction" ||
    path === "/transaction"
  ) {
    return APP_ROUTES.transactions;
  }

  if (path === "/admin/vehicletrackingreport" || path === "/vehicletrackingreport") {
    return APP_ROUTES.vehicleTrackingReport;
  }

  if (path === "/admin/low-occupancy-report" || path === "/low-occupancy-report") {
    return APP_ROUTES.lowOccupancyReport;
  }

  if (path === "/admin/low-performing-packages" || path === "/low-performing-packages") {
    return APP_ROUTES.lowPerformingPackages;
  }

  if (path === "/admin/monitoring" || path === "/monitoring") {
    return APP_ROUTES.monitoring;
  }

  if (path === "/admin/tripPerformance" || path === "/tripPerformance") {
    return APP_ROUTES.tripPerformance;
  }

  if (path === "/admin/vehiclewiseseatreport" || path === "/vehiclewiseseatreport") {
    return APP_ROUTES.vehicleWiseSeatReport;
  }

  if (path === "/admin/packages" || path === "/packages") {
    return APP_ROUTES.packages;
  }

  if (path === "/admin/menu-items" || path === "/menu-items") {
    return APP_ROUTES.menuItems;
  }

  if (path === "/admin/hotel" || path === "/hotel") {
    return APP_ROUTES.hotels;
  }

  if (path === "/admin/tickets" || path === "/tickets") {
    return APP_ROUTES.tickets;
  }

  if (path === "/admin/monthRunningBalance" || path === "/monthRunningBalance") {
    return APP_ROUTES.monthRunningBalance;
  }

  if (path === "/admin/dashboard" || path === "/" || path === "/dashboard") {
    return APP_ROUTES.dashboard;
  }

  if (path === "/admin/routes" || path === "/routes") {
    return APP_ROUTES.routes;
  }

  if (path === "/admin/vehicles" || path === "/admin/vehicle" || path === "/vehicles") {
    return APP_ROUTES.vehicles;
  }

  if (path === "/admin/seats" || path === "/admin/seat" || path === "/seats") {
    return APP_ROUTES.seats;
  }

  if (path === "/admin/trips" || path === "/admin/trip" || path === "/trips") {
    return APP_ROUTES.trips;
  }

  return null;
};
