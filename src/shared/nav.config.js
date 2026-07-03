import { Home, Boxes, Receipt, ShoppingCart, Settings, Calculator, Cog, TrendingUp, Plug, Mail, Users, BarChart3, Trophy, Tag, Package, FileText, Wallet, Bell, Percent, FileSpreadsheet, AlertTriangle, Store, Building2, Truck, CreditCard, Folder, BarChart2, ListTodo, Bot, Workflow } from "lucide-react";

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: Home, kind: "single" },
  {
    key: "leistung", label: "Leistung", icon: TrendingUp, kind: "group",
    children: [
      { key: "filialleistung", label: "Filialleistung", icon: BarChart3 },
      { key: "auszeichnungsdefinitionen", label: "Auszeichnungsdefinitionen", icon: Trophy },
    ],
  },
  {
    key: "lager", label: "Lagerverwaltung", icon: Boxes, kind: "group",
    children: [
      { key: "kategorien", label: "Kategorien", icon: Tag },
      { key: "artikel", label: "Artikel", icon: Package },
    ],
  },
  {
    key: "rechnung", label: "Rechnung & Zahlung", icon: Receipt, kind: "group",
    children: [
      { key: "rechnungen", label: "Rechnungen", icon: FileText },
      { key: "zahlungen", label: "Zahlungen", icon: Wallet },
      { key: "zahlungserinnerungen", label: "Zahlungserinnerungen", icon: Bell },
      { key: "provisionsrechnungen", label: "Provisionsrechnungen", icon: Percent },
      { key: "filial-mitgliedsbeitraege", label: "Filial-Mitgliedsbeiträge", icon: FileSpreadsheet },
    ],
  },
  {
    key: "bestellung", label: "Bestellungsverwaltung", icon: ShoppingCart, kind: "group",
    children: [
      { key: "bestellungen", label: "Bestellungen", icon: ShoppingCart },
      { key: "beschwerden", label: "Beschwerden", icon: AlertTriangle },
    ],
  },
  { key: "todos", label: "To Dos", icon: ListTodo, kind: "single" },
  { key: "ki_agent", label: "KI-Agent", icon: Bot, kind: "single" },
  { key: "workflows", label: "Workflows", icon: Workflow, kind: "single", isNew: true },
  { key: "wissensdatenbank", label: "Wissensdatenbank", icon: Folder, kind: "single" },
  { key: "mails", label: "Mails", icon: Mail, kind: "single" },
  { key: "integrationen", label: "Integrationen", icon: Plug, kind: "single", isNew: true },
  {
    key: "verwaltung", label: "Verwaltung", icon: Settings, kind: "group",
    children: [
      { key: "benutzer", label: "Benutzer", icon: Users },
      { key: "filialen", label: "Filialen", icon: Store },
      { key: "lieferanten", label: "Lieferanten", icon: Building2 },
      { key: "verteiler", label: "Verteiler", icon: Truck },
      { key: "kreditlimits", label: "Kreditlimits", icon: CreditCard },
      { key: "dokumente", label: "Dokumente", icon: Folder },
    ],
  },
  {
    key: "buchhaltung", label: "Buchhaltung", icon: Calculator, kind: "group",
    children: [
      { key: "finanzberichte", label: "Finanzberichte", icon: FileText },
      { key: "provisionsbericht", label: "Provisionsbericht", icon: BarChart2 },
    ],
  },
  { key: "system", label: "System", icon: Cog, kind: "group", children: [] },
];

export const ALL_LABELS = NAV.reduce((acc, item) => {
  acc[item.key] = item.label;
  (item.children || []).forEach((c) => (acc[c.key] = c.label));
  return acc;
}, {});
