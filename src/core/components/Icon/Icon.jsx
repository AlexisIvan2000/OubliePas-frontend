import {
  Add,
  Archive,
  ArchiveMinus,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  Calendar,
  CalendarTick,
  Category,
  ChartCircle,
  Clock,
  CloseCircle,
  Coin,
  Danger,
  Edit2,
  HambergerMenu,
  LogoutCurve,
  Minus,
  Moon,
  More,
  NotificationBing,
  PauseCircle,
  PlayCircle,
  ReceiptText,
  Repeat,
  SearchNormal1,
  Setting2,
  Sun1,
  ShieldTick,
  TickCircle,
  Trash,
  Wallet3,
} from "iconsax-react";

const ICONS = {
  dashboard: Category,
  subscriptions: Repeat,
  calendar: Calendar,
  invoices: ReceiptText,
  reminders: NotificationBing,
  settings: Setting2,
  verified: ShieldTick,
  breakdown: ChartCircle,
  currency: Coin,
  logout: LogoutCurve,
  add: Add,
  minus: Minus,
  edit: Edit2,
  delete: Trash,
  done: TickCircle,
  previous: ArrowLeft2,
  next: ArrowRight2,
  expand: ArrowDown2,
  light: Sun1,
  dark: Moon,
  wallet: Wallet3,
  clock: Clock,
  search: SearchNormal1,
  close: CloseCircle,
  menu: HambergerMenu,
  late: Danger,
  scheduled: CalendarTick,
  more: More,
  pause: PauseCircle,
  resume: PlayCircle,
  archive: Archive,
  restore: ArchiveMinus,
};

export function Icon({
  name,
  size = 20,
  variant = "Linear",
  color = "currentColor",
  className,
}) {
  const Glyph = ICONS[name];
  if (!Glyph) {
    return null;
  }

  return (
    <Glyph size={size} variant={variant} color={color} className={className} aria-hidden="true" />
  );
}
