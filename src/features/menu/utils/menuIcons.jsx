import {
  BarChart3,
  Bus,
  CalendarCheck,
  CircleDollarSign,
  FileText,
  GalleryVerticalEnd,
  Hotel,
  LayoutDashboard,
  Map,
  Package,
  ReceiptText,
  RefreshCcw,
  Route,
  Settings,
  ShieldCheck,
  Tags,
  Ticket,
  UserRound,
  Users,
} from "lucide-react";

const iconMap = {
  CategoryManagementIcon: Tags,
  ComplaintIcon: FileText,
  DashboardIcon: LayoutDashboard,
  GuideManagementIcon: UserRound,
  HotelCheckInIcon: Hotel,
  HotelManagementIcon: Hotel,
  MoneyIcon: CircleDollarSign,
  PackageManagementIcon: Package,
  RefundManagementIcon: RefreshCcw,
  RecurringExpenseIcon: CalendarCheck,
  ReportManagementIcon: BarChart3,
  RouteManagementIcon: Route,
  SeatManagementIcon: Ticket,
  TicketManagementIcon: Ticket,
  SqlMonitorIcon: ShieldCheck,
  TripManagementIcon: Map,
  UserManagementIcon: Users,
  VehicleManagementIcon: Bus,
  TransactionsIcon: ReceiptText,
  SettingsIcon: Settings,
};

export function MenuIcon({ name, size = 18 }) {
  const Icon = iconMap[name] ?? GalleryVerticalEnd;

  return <Icon size={size} />;
}
