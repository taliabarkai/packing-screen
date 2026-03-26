import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Alert,
  AlertTitle,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Collapse,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  type SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { lightBlue, orange, pink, purple, red } from "@mui/material/colors";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import NumbersIcon from "@mui/icons-material/Numbers";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SyncIcon from "@mui/icons-material/Sync";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

import { LinkedShipmentTabs, type LinkedShipmentTabItem } from "../components/LinkedShipmentTabs";
import { loadNewSplitShipmentIdFromApi } from "../api/loadNewSplitShipmentId";
import { loadTrackingNumberFromApi } from "../api/loadTrackingNumber";
import {
  getPackingStatusChipConfig,
  isPackingStatusBlockingActions,
  type PackingOrderUiStatus,
} from "../packing/statusChipConfig";
import oakAndLunaLogo from "../assets/oakandluna.svg";
import tenenGroupLogo from "../assets/tenengroup.svg";
import product1Img from "../assets/products/product-1.png";
import product2Img from "../assets/products/product-2.png";
import product3Img from "../assets/products/product-3.png";
import product4Img from "../assets/products/Product-4.png";
import product5Img from "../assets/products/Product-5.png";
import boxMediumImg from "../assets/products/box-medium.png";
import boxSmallImg from "../assets/products/box-small.png";

const MORE_ACTIONS_MENU_ITEMS_DEFAULT = [
  { id: "reprint-giftcard", label: "Reprint Giftcard", Icon: CardGiftcardOutlinedIcon },
  { id: "reprint-packing-label", label: "Reprint Packing Label", Icon: LocalPrintshopOutlinedIcon },
  { id: "join-shipment", label: "Join Shipment", Icon: MergeTypeIcon },
  { id: "split-shipment", label: "Split Shipment", Icon: CallSplitIcon },
] as const;

const MORE_ACTIONS_MENU_ITEMS_PACKED = [
  { id: "unpack-shipment", label: "Unpack Shipment", Icon: ShoppingBagOutlinedIcon },
  { id: "reprint-giftcard", label: "Reprint Giftcard", Icon: CardGiftcardOutlinedIcon },
  { id: "reprint-packing-label", label: "Reprint Packing Label", Icon: LocalPrintshopOutlinedIcon },
] as const;

const IMG = {
  item1: product1Img,
  boxMedium: boxMediumImg,
  item2: product2Img,
  boxSmall: boxSmallImg,
  item3: product3Img,
} as const;

type JoinTransferItem = {
  id: string;
  title: string;
  image: string;
  /** Items from the external shipment can move between columns. */
  movable: boolean;
};

/** Shared line copy for Product-4 asset (split secondary tab + join source column). */
const PRODUCT_4_LINE_TITLE = "Serena Bow Initial Necklace with Birthstone in Gold Vermiel";

const JOIN_SOURCE_SEED: JoinTransferItem[] = [
  {
    id: "join-ext-1",
    title: PRODUCT_4_LINE_TITLE,
    image: product4Img,
    movable: true,
  },
  {
    id: "join-ext-2",
    title: "Grace Interlocking Bracelet in Sterling Silver",
    image: product5Img,
    movable: true,
  },
];

const JOIN_CURRENT_SEED: JoinTransferItem[] = [
  {
    id: "pack-item-1",
    title: "Engraved Compass Necklace - Gold Vermeil",
    image: IMG.item1,
    movable: false,
  },
  {
    id: "pack-item-2",
    title: "Grace Interlocking Necklace with Diamond in 18K Gold Vermeil",
    image: IMG.item2,
    movable: false,
  },
  {
    id: "pack-item-3",
    title: "Premium Gift Kit",
    image: IMG.item3,
    movable: false,
  },
];

function joinLayoutKey(source: JoinTransferItem[], current: JoinTransferItem[]) {
  return `${source.map((i) => i.id).join(",")}|${current.map((i) => i.id).join(",")}`;
}

const elevationSx = {
  boxShadow:
    "0px 1px 3px 0px rgba(0,0,0,0.12), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px 0px rgba(0,0,0,0.2)",
};

const ORDER_SEARCH_PLACEHOLDER = "Scan barcode or search by order/shipment ID";

/** Prototype: full ready-to-pack UI — search `pack` or Next Order. */
const PROTOTYPE_PACK_ORDER_ID = "pack";
/** Prototype: pending queue — search `pending` (legacy alias: `fix`) or Next Order. */
const PROTOTYPE_PENDING_ORDER_ID = "pending";
/** Prototype: sorting station — search `sort`; full screen without pack checkbox / pack buttons (API tracks sorting). */
const PROTOTYPE_SORT_STATION_ORDER_ID = "sort";
/** Prototype: already packed shipment — search `packed` or Next Order. */
const PROTOTYPE_PACKED_ORDER_ID = "packed";
/** Prototype: cancelled shipment — search `cancelled` or Next Order. */
const PROTOTYPE_CANCELLED_ORDER_ID = "cancelled";
/** Prototype: on hold — search `hold` (Figma 1664:19401). */
const PROTOTYPE_ON_HOLD_ORDER_ID = "hold";
/** Prototype: similar orders (same address) — search `similar`; tabs to switch orders (Figma 2314:30804). */
const PROTOTYPE_SIMILAR_ORDERS_ORDER_ID = "similar";
/** Prototype: linked split shipments — search `split` or finish Split Shipment dialog; tabs for original + new. */
const PROTOTYPE_SPLIT_ORDER_ID = "split";

type SimilarOrderTab = {
  key: string;
  shipmentId: string;
  orderNumber: string;
  tabLabel: string;
  factoryLabel: string;
};

type SplitOrderTabRow = LinkedShipmentTabItem & { orderNumber: string };

/** Two prototype orders sharing the same destination (join via More actions). */
const SIMILAR_ORDER_TABS: SimilarOrderTab[] = [
  {
    key: "similar-a",
    shipmentId: "SH-12345",
    orderNumber: "5847219",
    tabLabel: "Order 5847219",
    factoryLabel: "KG",
  },
  {
    key: "similar-b",
    shipmentId: "SH-92834",
    orderNumber: "5847220",
    tabLabel: "Order 5847220",
    factoryLabel: "KG",
  },
];

/** Default linked shipments when opening the split prototype via search `split`. */
const SPLIT_ORDER_PROTOTYPE_TABS: SplitOrderTabRow[] = [
  {
    key: "split-proto-a",
    shipmentId: "SH-12345",
    factoryLabel: "KG",
    orderNumber: "5847219",
  },
  {
    key: "split-proto-b",
    shipmentId: "SH-92834",
    factoryLabel: "KG",
    orderNumber: "5847220",
  },
];

/** Secondary tab (SH-92834) in default `split` search: single line matching product-4 / join seed item. */
const SPLIT_PROTOTYPE_SECOND_TAB_ITEM: JoinTransferItem = {
  id: "split-proto-product-4",
  title: PRODUCT_4_LINE_TITLE,
  image: product4Img,
  movable: false,
};

/** Second similar-order tab (SH-92834): only the differing line vs tab 0. */
const SIMILAR_ORDER_SECOND_TAB_ITEM: JoinTransferItem = {
  id: "similar-order-product-4",
  title: PRODUCT_4_LINE_TITLE,
  image: product4Img,
  movable: false,
};

/** `SIMILAR_ORDER_TABS` index for the shipment currently being packed (default selected tab). */
const SIMILAR_ORDER_CURRENT_SHIPMENT_TAB_INDEX = 0;

/** Shown in pending alert + shipment pending modal “reason for fix” (prototype). */
const PROTOTYPE_PENDING_SENT_TO_FIX_BODY = "Chain was broken and one charm was missing";
/** Status card detail under “Order status details” for cancelled (Figma 1544:6488). */
const PROTOTYPE_CANCELLED_STATUS_BODY =
  "This shipment was cancelled. Do not pack or ship. Contact CSR if you need more information.";
/** On-hold status banner under Status row (Figma 2052:23611). */
const ON_HOLD_AWAITING_ITEM_BODY = "This shipment is awaiting 1 item from Nazareth.";
/** Next Order (prototype): sort → hold → pack → pending → similar → split → packed → cancelled → (loops to sort). */
const PROTOTYPE_NEXT_ORDER_CYCLE = [
  PROTOTYPE_SORT_STATION_ORDER_ID,
  PROTOTYPE_ON_HOLD_ORDER_ID,
  PROTOTYPE_PACK_ORDER_ID,
  PROTOTYPE_PENDING_ORDER_ID,
  PROTOTYPE_SIMILAR_ORDERS_ORDER_ID,
  PROTOTYPE_SPLIT_ORDER_ID,
  PROTOTYPE_PACKED_ORDER_ID,
  PROTOTYPE_CANCELLED_ORDER_ID,
] as const;

function isPrototypePendingOrderId(id: string | null): boolean {
  return id !== null && id.toLowerCase() === PROTOTYPE_PENDING_ORDER_ID;
}

function isSortingStationOrderId(id: string | null): boolean {
  return id !== null && id.toLowerCase() === PROTOTYPE_SORT_STATION_ORDER_ID;
}

function isPrototypeCancelledOrderId(id: string | null): boolean {
  return id !== null && id.toLowerCase() === PROTOTYPE_CANCELLED_ORDER_ID;
}

function isPrototypeOnHoldOrderId(id: string | null): boolean {
  return id !== null && id.toLowerCase() === PROTOTYPE_ON_HOLD_ORDER_ID;
}

function isPrototypeSimilarOrdersId(id: string | null): boolean {
  return id !== null && id.toLowerCase() === PROTOTYPE_SIMILAR_ORDERS_ORDER_ID;
}

function isPrototypeSplitOrdersId(id: string | null): boolean {
  return id !== null && id.toLowerCase() === PROTOTYPE_SPLIT_ORDER_ID;
}

function isPrototypePackedOrderId(id: string | null): boolean {
  return id !== null && id.toLowerCase() === PROTOTYPE_PACKED_ORDER_ID;
}

function getNextPrototypeCycleOrderId(current: string | null): string {
  const order = PROTOTYPE_NEXT_ORDER_CYCLE;
  if (!current) return order[0];
  const i = order.findIndex((id) => id.toLowerCase() === current.toLowerCase());
  if (i < 0) return order[0];
  return order[(i + 1) % order.length];
}

function normalizeOrderIdForLoad(raw: string): string {
  const t = raw.trim();
  const lower = t.toLowerCase();
  if (lower === PROTOTYPE_PACK_ORDER_ID) return PROTOTYPE_PACK_ORDER_ID;
  if (lower === PROTOTYPE_PENDING_ORDER_ID || lower === "fix") return PROTOTYPE_PENDING_ORDER_ID;
  if (lower === PROTOTYPE_SORT_STATION_ORDER_ID) return PROTOTYPE_SORT_STATION_ORDER_ID;
  if (lower === PROTOTYPE_PACKED_ORDER_ID) return PROTOTYPE_PACKED_ORDER_ID;
  if (lower === PROTOTYPE_CANCELLED_ORDER_ID) return PROTOTYPE_CANCELLED_ORDER_ID;
  if (lower === PROTOTYPE_ON_HOLD_ORDER_ID) return PROTOTYPE_ON_HOLD_ORDER_ID;
  if (lower === PROTOTYPE_SIMILAR_ORDERS_ORDER_ID) return PROTOTYPE_SIMILAR_ORDERS_ORDER_ID;
  if (lower === PROTOTYPE_SPLIT_ORDER_ID) return PROTOTYPE_SPLIT_ORDER_ID;
  return t;
}

function normalizeSplitNewShipmentIdForTab(id: string | null): string {
  if (id == null || !String(id).trim()) return "SH-92834";
  const t = String(id).trim();
  if (t.startsWith("SH-")) return t;
  if (/^\d+$/.test(t)) return `SH-${t}`;
  return t;
}

function prototypeSplitOriginalShipmentIdForTabs(currentShipmentId: string): string {
  const t = currentShipmentId.trim();
  if (!t || t === PROTOTYPE_PACK_ORDER_ID || t === PROTOTYPE_SORT_STATION_ORDER_ID) return "SH-12345";
  if (t.startsWith("SH-")) return t;
  return "SH-12345";
}

function isZeroOnlyShipmentQuery(id: string): boolean {
  return id.length > 0 && /^0+$/.test(id);
}

function EmptyStateHero() {
  return (
    <Box
      sx={{
        flex: "1 1 auto",
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: 0,
        py: 4,
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          bgcolor: "background.paper",
          gap: 4.25,
          textAlign: "center",
          px: 3,
          boxSizing: "border-box",
        }}
      >
        <DocumentScannerOutlinedIcon sx={{ fontSize: 64, color: "action.active" }} />
        <Stack spacing={1} alignItems="center" sx={{ color: "text.primary" }}>
          <Typography
            sx={{
              fontSize: 24.29,
              lineHeight: 1.235,
              letterSpacing: "0.1786px",
              fontWeight: 400,
            }}
          >
            Scan a barcode
          </Typography>
          <Typography
            sx={{
              fontSize: 17.14,
              lineHeight: 1.334,
              letterSpacing: "0.15px",
              fontWeight: 400,
              maxWidth: 320,
            }}
          >
            or enter an order/shipment ID
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function NoShipmentsFoundHero({ shippingId }: { shippingId: string }) {
  return (
    <Box
      sx={{
        flex: "1 1 auto",
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: 0,
        py: 4,
      }}
    >
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          bgcolor: "background.paper",
          gap: 4.25,
          textAlign: "center",
          px: 3,
          boxSizing: "border-box",
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: "action.active" }} />
        <Stack spacing={1} alignItems="center" sx={{ color: "text.primary", maxWidth: 340 }}>
          <Typography
            sx={{
              fontSize: 24.29,
              lineHeight: 1.235,
              letterSpacing: "0.1786px",
              fontWeight: 400,
            }}
          >
            No Shipments Found
          </Typography>
          <Typography
            sx={{
              fontSize: 17.14,
              lineHeight: 1.334,
              letterSpacing: "0.15px",
              fontWeight: 400,
              wordBreak: "break-all",
            }}
          >
            For shipping ID #{shippingId}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function DetailLabel({ children, sx }: { children: ReactNode; sx?: object }) {
  return (
    <Typography variant="body1" fontWeight={500} color="#212121" letterSpacing="0.15px" sx={sx}>
      {children}
    </Typography>
  );
}

function DetailValue({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body1" color="text.primary" letterSpacing="0.15px">
      {children}
    </Typography>
  );
}

function FieldBlock({
  label,
  children,
  minWidth,
  align = "left",
}: {
  label: string;
  children: ReactNode;
  minWidth?: number;
  align?: "left" | "right";
}) {
  return (
    <Stack
      spacing={0.5}
      sx={{
        minWidth: minWidth ?? "auto",
        alignItems: align === "right" ? "flex-end" : "flex-start",
        textAlign: align === "right" ? "right" : "left",
      }}
    >
      <DetailLabel sx={align === "right" ? { textAlign: "right", width: "100%" } : undefined}>{label}</DetailLabel>
      {children}
    </Stack>
  );
}

/** Action link row below shipment field value (unlock-edit mode). */
function ShipmentFieldActionLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      underline="hover"
      sx={{
        typography: "body1",
        fontWeight: 400,
        letterSpacing: "0.15px",
        cursor: "pointer",
        alignSelf: "flex-start",
        color: "primary.dark",
      }}
    >
      {children}
    </Link>
  );
}

function ShipmentFieldActionArea({
  visible,
  children,
}: {
  visible: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        overflow: "hidden",
        maxHeight: visible ? 28 : 0,
        opacity: visible ? 1 : 0,
        transition: "max-height 180ms ease, opacity 180ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </Box>
  );
}

function SectionOverline({ children }: { children: ReactNode }) {
  return (
    <Typography
      variant="caption"
      fontWeight={600}
      letterSpacing="1px"
      textTransform="uppercase"
      sx={{ fontSize: 12, lineHeight: "32px", color: "text.primary" }}
    >
      {children}
    </Typography>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ width: "100%" }}>
      <Typography variant="body1" color="text.secondary" sx={{ width: 120, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={500}
        color="text.primary"
        sx={{ flex: "1 1 0", minWidth: 0, wordBreak: "break-word" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

type ShipmentMessageChannel = "packing" | "csr";
type RemarksTabValue = "all" | ShipmentMessageChannel;
type ShipmentMessageSenderRole = "packer" | "csr";

type ShipmentMessage = {
  id: string;
  at: string;
  author: string;
  senderRole: ShipmentMessageSenderRole;
  channel: ShipmentMessageChannel;
  body: string;
  itemId: string | null;
  itemLabel: string;
};

/** Newest first; stable tie-break on id. Seed `at` values must stay ≤ real session time so new sends sort to top. */
function compareShipmentMessagesNewestFirst(a: ShipmentMessage, b: ShipmentMessage): number {
  const tb = new Date(b.at).getTime();
  const ta = new Date(a.at).getTime();
  if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
  if (tb !== ta) return tb - ta;
  return b.id.localeCompare(a.id);
}

/** Shipment-level “Apply to” scope and stored `itemLabel` for all-product remarks. */
const REMARK_ALL_PRODUCTS_LABEL = "All Products";

const REMARK_PRESET_OPTIONS: string[] = [
  "Done",
  "Order waiting for similar",
  "Similar Order- Sent Separately more than 3 days",
  "Sent Back to Supplier",
  "Sent free Gift per request",
  "Sent to fix",
  "Sent to fix - 2nd time",
  "Sent to Reorder",
  "Sent Return Envelope - KG",
  "Sent Return Envelope - RG",
  "Shipping method changed - approved by CSR",
  "Shipped Reorder",
  "Shipped Refund",
  "Sent back to supplier the original item",
  "Sent only chain [requested by CSR]",
  "Sent only Stones [requested by CSR]",
  "Request address confirmation",
  "Address confirmed",
  "Address not confirmed",
  "Arrived from FIX",
  "Reshipped",
  "Sent to fix the returned item",
];

const PACK_LINE_ITEM_META: { id: string; title: string; itemListLabel: string }[] = [
  {
    id: "pack-item-1",
    title: "Engraved Compass Necklace - Gold Vermeil",
    itemListLabel: "Engraved Compass Necklace · Gold Vermeil",
  },
  {
    id: "pack-item-2",
    title: "Grace Interlocking Necklace with Diamond in 18K Gold Vermeil",
    itemListLabel: "Grace Interlocking Necklace · 18K Gold Vermeil",
  },
  {
    id: "pack-item-3",
    title: "Premium Gift Kit",
    itemListLabel: "Premium Gift Kit",
  },
];

const PACK_LINE_ITEM_IMAGES: readonly string[] = [IMG.item1, IMG.item2, IMG.item3];

function buildSplitShipmentCurrentItems(): JoinTransferItem[] {
  return PACK_LINE_ITEM_META.map((row, i) => ({
    id: row.id,
    title: row.title.replace(/^\d+\s*-\s*/, "").trim(),
    image: PACK_LINE_ITEM_IMAGES[i] ?? IMG.item1,
    movable: true,
  }));
}

/**
 * Append catalog lines missing from `packItems` (e.g. after leaving on-hold).
 * `excludeIds`: line ids that must stay out of the main list (still at another facility).
 */
function mergeMissingPackLineItems(prev: JoinTransferItem[], excludeIds: ReadonlySet<string> = new Set()): JoinTransferItem[] {
  const base = buildSplitShipmentCurrentItems().map((x) => ({ ...x, movable: false }));
  const have = new Set(prev.map((p) => p.id));
  const missing = base.filter((b) => !have.has(b.id) && !excludeIds.has(b.id));
  return missing.length ? [...prev, ...missing] : prev;
}

/** Prototype on-hold: line items physically at another site until marked received (Figma 2052:23611 / 1744:42531). */
const PROTOTYPE_ON_HOLD_REMOTE_FACILITY_ITEM_IDS: readonly string[] = ["pack-item-1"];

/** Label for the location chip on “other facilities” item cards (keyed by line item id). */
const PROTOTYPE_REMOTE_FACILITY_LOCATION_BY_ITEM_ID: Record<string, string> = {
  "pack-item-1": "Nazareth",
  "pack-item-2": "Nazareth",
  "pack-item-3": "Nazareth",
};

/** Hungary factory demo (header toggle): line 2 appears under “other facilities” without receive checkbox. */
const HUNGARY_DEMO_OTHER_FACILITY_LINE_IDS: readonly string[] = ["pack-item-2"];

/** Simulated barcode → container row after “scan” (Figma 2345:27263 / Location3). */
const PROTOTYPE_CONTAINER_ASSIGN_CODE = "C.Y BOX 2606.KG";
const PROTOTYPE_CONTAINER_ASSIGN_LOCATION = "שלייפ כניסה";
/** Second prototype bin for on-hold line 2 (line 1 uses `PROTOTYPE_CONTAINER_ASSIGN_CODE`). */
const PROTOTYPE_CONTAINER_ASSIGN_CODE_ON_HOLD_LINE_2 = "C.Y BOX 2712.KG";
const PROTOTYPE_CONTAINER_ASSIGN_LOCATION_LINE_2 = "אזור איסוף";

type PrototypeContainerAssignDetail = { code: string; location: string };

/** On-hold prototype: lines that use the container control arrive already assigned (user may release with ✕). */
function buildOnHoldDefaultContainerAssignByItemId(): Record<string, PrototypeContainerAssignDetail> {
  return {
    "pack-item-1": { code: PROTOTYPE_CONTAINER_ASSIGN_CODE, location: PROTOTYPE_CONTAINER_ASSIGN_LOCATION },
    "pack-item-2": {
      code: PROTOTYPE_CONTAINER_ASSIGN_CODE_ON_HOLD_LINE_2,
      location: PROTOTYPE_CONTAINER_ASSIGN_LOCATION_LINE_2,
    },
  };
}

/** Remarks list timestamps (reference: 12/12/2026, 3:23 AM). */
function formatRemarkRowDisplayTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Product name only in remark chips (strips leading "1 — ", "2 - ", etc.). */
function remarkItemChipLabel(itemLabel: string): string {
  if (itemLabel === REMARK_ALL_PRODUCTS_LABEL) return itemLabel;
  return itemLabel.replace(/^\d+\s*[—–\-]\s*/u, "").trim();
}

/** Product line in remarks (middle dot → hyphen to match reference copy). */
function remarkProductDisplayLine(itemLabel: string): string {
  if (itemLabel === REMARK_ALL_PRODUCTS_LABEL) return itemLabel;
  return remarkItemChipLabel(itemLabel).replace(/\s*·\s*/g, " - ");
}

function buildInitialShipmentMessages(): ShipmentMessage[] {
  return [
    {
      id: "seed-1",
      at: "2024-12-23T16:16:00.000Z",
      author: "Francisco.z",
      senderRole: "packer",
      channel: "packing",
      body: "Ok to ship",
      itemId: "pack-item-1",
      itemLabel: PACK_LINE_ITEM_META[0].itemListLabel,
    },
    {
      id: "seed-2",
      at: "2024-12-15T14:30:00.000Z",
      author: "Alexander.D",
      senderRole: "packer",
      channel: "packing",
      body: 'PLS MAKE SURE INSCRIPTIONS ARE: Inscription #1: Always, Inscription #2: With You"',
      itemId: "pack-item-2",
      itemLabel: PACK_LINE_ITEM_META[1].itemListLabel,
    },
    {
      id: "seed-3",
      at: "2024-12-12T03:23:00.000Z",
      author: "Patricia.G",
      senderRole: "csr",
      channel: "csr",
      body:
        "Special requests: please make sure: Inscription #2: with 2 capital letters, sent picture before shipping.",
      itemId: "pack-item-1",
      itemLabel: PACK_LINE_ITEM_META[0].itemListLabel,
    },
    {
      id: "seed-5",
      at: "2024-12-08T11:00:00.000Z",
      author: "CSR Team",
      senderRole: "csr",
      channel: "csr",
      body: "Customer called — please double-check chain length before seal.",
      itemId: null,
      itemLabel: REMARK_ALL_PRODUCTS_LABEL,
    },
  ];
}

type ShippingRouteRow = { id: string; carrier: string; method: string; eta: string };

const SHIPPING_ROUTE_ROWS: ShippingRouteRow[] = [
  { id: "fedex-express", carrier: "FedEx", method: "Express", eta: "Dec 20, 2025" },
  { id: "usps-expedited", carrier: "USPS", method: "Expedited", eta: "Dec 12, 2025" },
  { id: "ups-standard", carrier: "UPS", method: "Standard", eta: "Dec 12, 2025" },
  { id: "fedex-expedited", carrier: "FedEx", method: "Expedited", eta: "Dec 18, 2025" },
  { id: "usps-standard", carrier: "USPS", method: "Standard", eta: "Dec 31, 2025" },
];

const INITIAL_CARRIER_ROUTE_ID = "fedex-express";

/** Header “Hungary” factory demo: carrier route shown in shipment details. */
const PROTOTYPE_HUNGARY_CARRIER_ROUTE_ID = "ups-standard";

/** Logos in `public/carriers/` (e.g. `ship-fedex.svg`). */
function toSlug(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function carrierLogoPublicUrl(carrierSlug: string) {
  const base = import.meta.env.BASE_URL;
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}carriers/ship-${carrierSlug}.svg`;
}

function findCarrierLogoSrc(route: ShippingRouteRow): string | null {
  return carrierLogoPublicUrl(toSlug(route.carrier));
}

function formatCarrierRouteDisplay(route: ShippingRouteRow) {
  return `${route.carrier} ${route.method}`;
}

function findShippingRoute(id: string): ShippingRouteRow | undefined {
  return SHIPPING_ROUTE_ROWS.find((r) => r.id === id);
}

function ShippingRouteColumnLabels({ route }: { route: ShippingRouteRow }) {
  const logoSrc = findCarrierLogoSrc(route);
  return (
    <Stack direction="row" spacing={4} flex={1} sx={{ minWidth: 0 }}>
      <Box sx={{ flex: "1 1 0%", minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ textTransform: "capitalize" }}>
          Carrier
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minHeight: 28 }}>
          {logoSrc ? (
            <Box
              component="img"
              src={logoSrc}
              alt={route.carrier}
              sx={{ height: 28, width: "auto", maxWidth: 88, objectFit: "contain", display: "block" }}
            />
          ) : (
            <Typography variant="body1" color="text.primary" letterSpacing="0.15px">
              {route.carrier}
            </Typography>
          )}
        </Stack>
      </Box>
      <Box sx={{ flex: "1 1 0%", minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ textTransform: "capitalize" }}>
          Method
        </Typography>
        <Typography variant="body1" color="text.primary" letterSpacing="0.15px">
          {route.method}
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 0%", minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          ETA
        </Typography>
        <Typography variant="body1" color="text.primary" letterSpacing="0.15px">
          {route.eta}
        </Typography>
      </Box>
    </Stack>
  );
}

type AddressForm = {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  email: string;
  phone: string;
};

const DEFAULT_ADDRESS_FORM: AddressForm = {
  name: "Clayton Click",
  street: "948 Highway St 54 E",
  city: "Covington",
  state: "New York",
  zipCode: "38193",
  country: "United States",
  email: "ClaytinClick@gmail.com",
  phone: "1-(516)-123-6954",
};

const ADDRESS_STATE_OPTIONS = [
  "New York",
  "California",
  "Texas",
  "Florida",
  "Washington",
  "Georgia",
  "Virginia",
  "New Jersey",
];

const ADDRESS_ZIP_OPTIONS = ["38193", "10001", "94102", "75201", "30301"];

function addressFormsEqual(a: AddressForm, b: AddressForm): boolean {
  return (
    a.name === b.name &&
    a.street === b.street &&
    a.city === b.city &&
    a.state === b.state &&
    a.zipCode === b.zipCode &&
    a.country === b.country &&
    a.email === b.email &&
    a.phone === b.phone
  );
}

function formatDestinationSummary(form: AddressForm) {
  return `${form.state}, ${form.country}`;
}

function UpdateAddressDialog({
  open,
  onClose,
  savedForm,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  savedForm: AddressForm;
  onSave: (form: AddressForm) => void;
}) {
  const [form, setForm] = useState<AddressForm>(savedForm);
  const [baseline, setBaseline] = useState<AddressForm>(savedForm);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (open) {
      const next = { ...savedForm };
      setForm(next);
      setBaseline(next);
      setValidated(false);
    }
  }, [open, savedForm]);

  const isDirty = useMemo(() => !addressFormsEqual(form, baseline), [form, baseline]);

  const patch = (field: keyof AddressForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setValidated(false);
  };

  const handleValidate = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const requiredOk =
      form.name.trim() &&
      form.street.trim() &&
      form.city.trim() &&
      form.state &&
      form.zipCode &&
      form.country.trim() &&
      form.phone.trim();
    if (!emailOk || !requiredOk) return;
    setValidated(true);
  };

  const handleSave = () => {
    if (!validated) return;
    onSave({ ...form });
    onClose();
  };

  const rowLabelSx = { width: 120, flexShrink: 0, fontWeight: 600, color: "text.primary" };

  const fieldSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1 },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span" fontWeight={600} color="text.primary">
          Update Address Details
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5, pb: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>Name</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => patch("name", e.target.value)}
              sx={fieldSx}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>Street</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.street}
              onChange={(e) => patch("street", e.target.value)}
              sx={fieldSx}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>City</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.city}
              onChange={(e) => patch("city", e.target.value)}
              sx={fieldSx}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>State</Typography>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <Select
                value={form.state}
                onChange={(e: SelectChangeEvent<string>) => patch("state", e.target.value)}
              >
                {ADDRESS_STATE_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>Zip Code</Typography>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <Select
                value={form.zipCode}
                onChange={(e: SelectChangeEvent<string>) => patch("zipCode", e.target.value)}
              >
                {ADDRESS_ZIP_OPTIONS.map((z) => (
                  <MenuItem key={z} value={z}>
                    {z}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>Country</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.country}
              onChange={(e) => patch("country", e.target.value)}
              sx={fieldSx}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>Email</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
              sx={fieldSx}
            />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={rowLabelSx}>Phone</Typography>
            <TextField
              fullWidth
              size="small"
              value={form.phone}
              onChange={(e) => patch("phone", e.target.value)}
              sx={fieldSx}
            />
          </Stack>
          {validated && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Address validated successfully. You can save your changes.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: "uppercase" }}>
          Cancel
        </Button>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            disabled={!isDirty || validated}
            onClick={handleValidate}
            sx={{
              textTransform: "uppercase",
              ...(!isDirty || validated
                ? {
                    bgcolor: "grey.400",
                    color: "grey.100",
                    "&.Mui-disabled": { bgcolor: "grey.400", color: "grey.200" },
                  }
                : {
                    bgcolor: "#ed6c02",
                    color: "#fff",
                    "&:hover": { bgcolor: "#e65100" },
                  }),
            }}
          >
            Validate
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!validated}
            onClick={handleSave}
            sx={{
              textTransform: "uppercase",
              ...(!validated
                ? {
                    bgcolor: "grey.400",
                    color: "grey.100",
                    "&.Mui-disabled": { bgcolor: "grey.400", color: "grey.200" },
                  }
                : {}),
            }}
          >
            Save
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

type OrderHistoryEntry = {
  id: string;
  at: string;
  source: string;
  detail: string;
};

const ORDER_HISTORY_LOG: OrderHistoryEntry[] = [
  {
    id: "1",
    source: "PERIODIC SYSTEM",
    at: "1/8/2026 12:00 AM",
    detail:
      "Nightly reconciliation completed. Order line items and fulfillment status were synchronized with the central catalog. No blocking issues detected for this shipment.",
  },
  {
    id: "2",
    source: "OCS",
    at: "1/7/2026 4:32 PM",
    detail:
      "Order confirmation service published status change: In production. All configured personalization checkpoints have been recorded for packing review.",
  },
  {
    id: "3",
    source: "WMS",
    at: "1/6/2026 9:15 AM",
    detail:
      "Warehouse management received pick list. Inventory reserved for SKU bundle associated with this order; carrier preference captured as FedEx Express for destination region.",
  },
  {
    id: "4",
    source: "OCS",
    at: "1/5/2026 2:48 PM",
    detail:
      "Customer service note attached: verify inscription casing and send photo approval prior to ship. Message routed to packing workflow.",
  },
  {
    id: "5",
    source: "PERIODIC SYSTEM",
    at: "1/4/2026 8:00 AM",
    detail: "Order created from OMS and assigned to site 27. Initial routing rules applied.",
  },
];

function OrderHistoryLogDialog({
  open,
  onClose,
  orderNumber,
}: {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          pr: 1,
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Order History Log
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Order #{orderNumber}
          </Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ mt: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5, pb: 2 }}>
        <Box sx={{ maxHeight: 440, overflow: "auto", pr: 0.5 }}>
          {ORDER_HISTORY_LOG.map((entry, index) => {
            const isLast = index === ORDER_HISTORY_LOG.length - 1;
            const timelineIndent = "22px";
            return (
              <Box key={entry.id}>
                {index > 0 ? (
                  <Box sx={{ height: 16, display: "flex", alignItems: "stretch" }}>
                    <Box
                      sx={{
                        width: 2,
                        height: "100%",
                        ml: timelineIndent,
                        bgcolor: "divider",
                        borderRadius: 0.5,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                ) : null}
                <Paper
                  variant="outlined"
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxSizing: "border-box",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        flexShrink: 0,
                        mt: 0.35,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        gap={1.5}
                        sx={{ mb: 1.25 }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          letterSpacing="0.06em"
                          sx={{ textTransform: "uppercase", lineHeight: 1.2 }}
                        >
                          {entry.source}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ flexShrink: 0, lineHeight: 1.2 }}
                        >
                          {entry.at}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.5 }}>
                        {entry.detail}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
                {!isLast ? (
                  <Box sx={{ height: 16, display: "flex", alignItems: "stretch" }}>
                    <Box
                      sx={{
                        width: 2,
                        height: "100%",
                        ml: timelineIndent,
                        bgcolor: "divider",
                        borderRadius: 0.5,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={onClose} sx={{ textTransform: "uppercase" }}>
          Close log
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const SEND_TO_FIX_PLACEHOLDER =
  "Please explain briefly why we need to send this for fixing.";

function SendToFixDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  const canSubmit = reason.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(reason.trim());
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      scroll="paper"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 540,
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          pr: 1,
          pb: 1,
          pt: 2.5,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} color="text.primary" component="span" sx={{ letterSpacing: "0.15px" }}>
          Send to fix
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ mt: -0.5, mr: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogContent
        sx={{
          pt: 3,
          pb: 1,
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          overflow: "hidden",
        }}
      >
        <Typography variant="body1" color="text.primary" sx={{ letterSpacing: "0.15px", flexShrink: 0 }}>
          Reason:
        </Typography>
        <TextField
          multiline
          minRows={4}
          fullWidth
          placeholder={SEND_TO_FIX_PLACEHOLDER}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          variant="outlined"
          inputProps={{ "aria-label": "Reason for send to fix" }}
          sx={{
            flexShrink: 0,
            alignSelf: "stretch",
            "& .MuiOutlinedInput-root": {
              alignItems: "flex-start",
              overflow: "auto",
              paddingTop: 1.5,
              paddingBottom: 1.5,
              boxSizing: "border-box",
            },
          }}
        />
      </DialogContent>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between", flexShrink: 0 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1, px: 2.75 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!canSubmit}
          onClick={handleSubmit}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1, px: 2.75 }}
        >
          Send to fix
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Design ref 2056:22696 — pending / sent-to-fix acknowledgement. */
const PENDING_MODAL_ICON_CIRCLE_BG = "#FEF3E7";
const PENDING_MODAL_REASON_BOX_BG = "#F5F5F5";

function ShipmentPendingDialog({
  open,
  reasonForFix,
  onOk,
  onCancel,
}: {
  open: boolean;
  reasonForFix: string;
  onOk: () => void;
  onCancel: () => void;
}) {
  const reasonDisplay = reasonForFix.trim() || "—";

  return (
    <Dialog
      data-node-id="2056:22696"
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") onCancel();
      }}
      maxWidth={false}
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: { bgcolor: "rgba(0,0,0,0.5)" },
        },
      }}
      PaperProps={{
        component: Paper,
        elevation: 0,
        sx: {
          width: "100%",
          maxWidth: 560,
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
          borderRadius: 1,
          overflow: "hidden",
          ...elevationSx,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pt: 2.5,
          pb: 2,
          px: 3,
          pr: 1,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "text.primary",
            fontWeight: 600,
            fontSize: 20,
            lineHeight: 1.6,
            letterSpacing: "0.15px",
          }}
        >
          Shipment Pending
        </Typography>
        <IconButton aria-label="Close" size="small" onClick={onCancel} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogContent
        sx={{
          pt: 3,
          pb: 3,
          px: 3,
          flexShrink: 0,
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          alignItems="center"
          spacing={2.5}
          sx={{ textAlign: "center", width: "100%", maxWidth: 440, mx: "auto" }}
        >
          {/* Figma 2126:26531 — pending glyph (Material Pending outlined) */}
          <Box
            aria-hidden
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: PENDING_MODAL_ICON_CIRCLE_BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PendingOutlinedIcon sx={{ fontSize: 36, color: "warning.main" }} />
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.15px",
              lineHeight: 1.5,
              maxWidth: 440,
            }}
          >
            This shipment is waiting for a fix.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.15px",
              lineHeight: 1.5,
              maxWidth: 440,
            }}
          >
            Check the item. Is the problem fixed? Click &apos;OK&apos; if it is ready to pack.
          </Typography>
          <Box
            sx={{
              width: "100%",
              maxWidth: 440,
              mt: 0.5,
              py: 1.5,
              px: 2,
              borderRadius: 1,
              bgcolor: PENDING_MODAL_REASON_BOX_BG,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              textAlign: "center",
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 22, color: "text.secondary", flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.5, letterSpacing: "0.15px" }}>
              <Box component="span" fontWeight={700}>
                Reason for fix:
              </Box>{" "}
              <Box component="span" fontWeight={400}>
                &ldquo;{reasonDisplay}&rdquo;
              </Box>
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          justifyContent: "space-between",
          flexShrink: 0,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          gap: 2,
        }}
      >
        <Button variant="text" color="primary" onClick={onCancel} sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onOk}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1, px: 2.5 }}
        >
          OK (FIX DONE)
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function joinShipmentDisplayRef(id: string) {
  const t = id.trim();
  if (t.startsWith("SH-")) return `#${t}`;
  if (t.toUpperCase().startsWith("SH")) return `#${t}`;
  return `#SH-${t}`;
}

function splitNewShipmentDisplayRef(id: string | null) {
  if (id == null || !id.trim()) return "—";
  const t = id.trim();
  if (t.startsWith("#")) return t;
  if (t.startsWith("SH-")) return `#${t}`;
  if (/^\d+$/.test(t)) return `#${t}`;
  return `#${t}`;
}

function JoinShipmentDialog({
  open,
  onClose,
  currentShipmentId,
  prefillSourceShipmentId = null,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  currentShipmentId: string;
  /** When set (e.g. similar-order pair), left column loads this shipment immediately. */
  prefillSourceShipmentId?: string | null;
  onConfirm?: (nextCurrentItems: JoinTransferItem[]) => void;
}) {
  const [sourceShipmentInput, setSourceShipmentInput] = useState("");
  const [loadedSourceId, setLoadedSourceId] = useState<string | null>(null);
  const [sourceItems, setSourceItems] = useState<JoinTransferItem[]>([]);
  const [currentItems, setCurrentItems] = useState<JoinTransferItem[]>([]);
  const [initialLayoutKey, setInitialLayoutKey] = useState("");

  useEffect(() => {
    if (!open) return;
    const prefill = prefillSourceShipmentId?.trim();
    if (prefill) {
      const nextSource = JOIN_SOURCE_SEED.map((x) => ({ ...x }));
      const nextCurrent = JOIN_CURRENT_SEED.map((x) => ({ ...x }));
      setLoadedSourceId(prefill);
      setSourceShipmentInput(prefill);
      setSourceItems(nextSource);
      setCurrentItems(nextCurrent);
      setInitialLayoutKey(joinLayoutKey(nextSource, nextCurrent));
      return;
    }
    setSourceShipmentInput("");
    setLoadedSourceId(null);
    setSourceItems([]);
    setCurrentItems(JOIN_CURRENT_SEED.map((x) => ({ ...x })));
    setInitialLayoutKey("");
  }, [open, prefillSourceShipmentId, currentShipmentId]);

  const layoutKey = joinLayoutKey(sourceItems, currentItems);
  const transferDirty =
    Boolean(loadedSourceId) && initialLayoutKey.length > 0 && layoutKey !== initialLayoutKey;

  const handleLoadSource = () => {
    const id = sourceShipmentInput.trim() || "5928503726";
    const nextSource = JOIN_SOURCE_SEED.map((x) => ({ ...x }));
    const nextCurrent = JOIN_CURRENT_SEED.map((x) => ({ ...x }));
    setLoadedSourceId(id);
    setSourceItems(nextSource);
    setCurrentItems(nextCurrent);
    setInitialLayoutKey(joinLayoutKey(nextSource, nextCurrent));
  };

  const handleClearLoadedSource = () => {
    setLoadedSourceId(null);
    setSourceItems([]);
    setSourceShipmentInput("");
    setCurrentItems(JOIN_CURRENT_SEED.map((x) => ({ ...x })));
    setInitialLayoutKey("");
  };

  const moveToCurrent = (id: string) => {
    let moved: JoinTransferItem | null = null;
    setSourceItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item?.movable) return prev;
      moved = item;
      return prev.filter((i) => i.id !== id);
    });
    if (moved) {
      const item = moved;
      setCurrentItems((c) => [...c, item]);
    }
  };

  const moveToSource = (id: string) => {
    let moved: JoinTransferItem | null = null;
    setCurrentItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item?.movable) return prev;
      moved = item;
      return prev.filter((i) => i.id !== id);
    });
    if (moved) {
      const item = moved;
      setSourceItems((s) => [...s, item]);
    }
  };

  const handleConfirm = () => {
    /* prototype: wire join API when available */
    onConfirm?.(currentItems);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      scroll="paper"
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.5)" } } }}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 960,
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
          pt: 2.5,
          pb: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} color="text.primary" sx={{ letterSpacing: "0.15px" }}>
          Join Shipment
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ mt: -0.5, mr: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogContent
        sx={{
          pt: 3,
          px: 3,
          pb: 2,
          flex: "1 1 auto",
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" spacing={0} sx={{ flex: 1, minHeight: 0, alignItems: "stretch" }}>
          <Stack sx={{ flex: "1 1 0%", minWidth: 0, pr: 2 }} spacing={2}>
            {!loadedSourceId ? (
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  minHeight: 320,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 3,
                  py: 4,
                  borderRadius: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 360, alignItems: "center" }}>
                  <Inventory2OutlinedIcon sx={{ fontSize: 32, color: "action.disabled" }} />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ letterSpacing: "0.15px", lineHeight: 1.5 }}
                  >
                    Please Scan or type in Shipment/Order ID to start
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Scan or type in order ID"
                    value={sourceShipmentInput}
                    onChange={(e) => setSourceShipmentInput(e.target.value)}
                    variant="outlined"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLoadSource();
                    }}
                  />
                </Stack>
              </Paper>
            ) : (
              <>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ letterSpacing: "0.15px" }}>
                    Shipment {joinShipmentDisplayRef(loadedSourceId)} ({sourceItems.length} items)
                  </Typography>
                  <IconButton aria-label="Clear shipment" size="small" onClick={handleClearLoadedSource}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack spacing={1.5} sx={{ overflow: "auto", pr: 0.5, flex: 1, minHeight: 0 }}>
                  {sourceItems.map((item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt=""
                        sx={{ width: 56, height: 56, borderRadius: 0.5, objectFit: "cover", flexShrink: 0 }}
                      />
                      <Typography variant="body2" fontWeight={500} sx={{ flex: "1 1 auto", minWidth: 0, lineHeight: 1.4 }}>
                        {item.title}
                      </Typography>
                      {item.movable ? (
                        <Button
                          size="small"
                          color="primary"
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                          onClick={() => moveToCurrent(item.id)}
                          sx={{
                            flexShrink: 0,
                            textTransform: "none",
                            fontWeight: 600,
                            letterSpacing: "0.3px",
                            minWidth: "auto",
                            px: 0.5,
                          }}
                        >
                          MOVE
                        </Button>
                      ) : null}
                    </Paper>
                  ))}
                  {sourceItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No items in this shipment.
                    </Typography>
                  ) : null}
                </Stack>
              </>
            )}
          </Stack>

          <Box
            sx={{
              width: 48,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              alignSelf: "stretch",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: "1px",
                bgcolor: "divider",
                transform: "translateX(-50%)",
              }}
            />
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", zIndex: 1, py: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "grey.200",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SwapHorizIcon sx={{ color: "text.secondary", fontSize: 22 }} />
              </Box>
            </Box>
          </Box>

          <Stack sx={{ flex: "1 1 0%", minWidth: 0, pl: 2 }} spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ letterSpacing: "0.15px" }}>
                Current Shipment
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {joinShipmentDisplayRef(currentShipmentId)}
              </Typography>
            </Stack>
            <Stack spacing={1.5} sx={{ overflow: "auto", pr: 0.5, flex: 1, minHeight: 0 }}>
              {currentItems.map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    alt=""
                    sx={{ width: 56, height: 56, borderRadius: 0.5, objectFit: "cover", flexShrink: 0 }}
                  />
                  <Typography variant="body2" fontWeight={500} sx={{ flex: "1 1 auto", minWidth: 0, lineHeight: 1.4 }}>
                    {item.title}
                  </Typography>
                  {item.movable ? (
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                      onClick={() => moveToSource(item.id)}
                      sx={{
                        flexShrink: 0,
                        textTransform: "none",
                        fontWeight: 600,
                        letterSpacing: "0.3px",
                        minWidth: "auto",
                        px: 0.5,
                      }}
                    >
                      MOVE
                    </Button>
                  ) : null}
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between", flexShrink: 0 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1, px: 2.75, borderColor: "grey.400", color: "text.primary" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!transferDirty}
          onClick={handleConfirm}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1, px: 2.75 }}
        >
          Confirm & Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SplitShipmentDialog({
  open,
  onClose,
  currentShipmentId,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  currentShipmentId: string;
  onConfirm?: (
    nextCurrentItems: JoinTransferItem[],
    nextNewItems: JoinTransferItem[],
    newShipmentId: string | null,
    sourceShipmentId: string,
  ) => void;
}) {
  const [currentItems, setCurrentItems] = useState<JoinTransferItem[]>([]);
  const [newItems, setNewItems] = useState<JoinTransferItem[]>([]);
  const [newShipmentId, setNewShipmentId] = useState<string | null>(null);
  const splitBaselineKeyRef = useRef("");

  useLayoutEffect(() => {
    if (!open) return;
    const seed = buildSplitShipmentCurrentItems().map((x) => ({ ...x }));
    splitBaselineKeyRef.current = joinLayoutKey(seed, []);
    setCurrentItems(seed);
    setNewItems([]);
    setNewShipmentId(null);
  }, [open, currentShipmentId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const id = await loadNewSplitShipmentIdFromApi(currentShipmentId);
        if (!cancelled) setNewShipmentId(id);
      } catch (e) {
        console.error(e);
        const fallback = String(Math.floor(100_000_000 + Math.random() * 900_000_000));
        if (!cancelled) setNewShipmentId(fallback);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, currentShipmentId]);

  const layoutKey = joinLayoutKey(currentItems, newItems);
  const transferDirty = Boolean(splitBaselineKeyRef.current) && layoutKey !== splitBaselineKeyRef.current;

  const moveToNew = (id: string) => {
    let moved: JoinTransferItem | null = null;
    setCurrentItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item?.movable) return prev;
      moved = item;
      return prev.filter((i) => i.id !== id);
    });
    if (moved) setNewItems((c) => [...c, moved!]);
  };

  const moveToCurrent = (id: string) => {
    let moved: JoinTransferItem | null = null;
    setNewItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item?.movable) return prev;
      moved = item;
      return prev.filter((i) => i.id !== id);
    });
    if (moved) setCurrentItems((s) => [...s, moved!]);
  };

  const handleConfirm = () => {
    /* prototype: wire split API when available */
    onConfirm?.(currentItems, newItems, newShipmentId, currentShipmentId);
    onClose();
  };

  const centerSwap = (
    <Box
      sx={{
        width: 48,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        alignSelf: "stretch",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: "1px",
          bgcolor: "divider",
          transform: "translateX(-50%)",
        }}
      />
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", zIndex: 1, py: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SwapHorizIcon sx={{ color: "text.secondary", fontSize: 22 }} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      scroll="paper"
      slotProps={{ backdrop: { sx: { bgcolor: "rgba(0,0,0,0.5)" } } }}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 960,
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
          pt: 2.5,
          pb: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} color="text.primary" sx={{ letterSpacing: "0.15px" }}>
          Split Shipment
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ mt: -0.5, mr: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogContent
        sx={{
          pt: 3,
          px: 3,
          pb: 2,
          flex: "1 1 auto",
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" spacing={0} sx={{ flex: 1, minHeight: 0, alignItems: "stretch" }}>
          <Stack sx={{ flex: "1 1 0%", minWidth: 0, pr: 2 }} spacing={2}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ letterSpacing: "0.15px" }}>
                Current Shipment ({currentItems.length} items)
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ flexShrink: 0 }}>
                {joinShipmentDisplayRef(currentShipmentId)}
              </Typography>
            </Stack>
            <Stack spacing={1.5} sx={{ overflow: "auto", pr: 0.5, flex: 1, minHeight: 0 }}>
              {currentItems.map((item) => (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={item.image}
                    alt=""
                    sx={{ width: 56, height: 56, borderRadius: 0.5, objectFit: "cover", flexShrink: 0 }}
                  />
                  <Typography variant="body2" fontWeight={500} sx={{ flex: "1 1 auto", minWidth: 0, lineHeight: 1.4 }}>
                    {item.title}
                  </Typography>
                  {item.movable ? (
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                      onClick={() => moveToNew(item.id)}
                      sx={{
                        flexShrink: 0,
                        textTransform: "none",
                        fontWeight: 600,
                        letterSpacing: "0.3px",
                        minWidth: "auto",
                        px: 1,
                      }}
                    >
                      MOVE
                    </Button>
                  ) : null}
                </Paper>
              ))}
              {currentItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No items left in this shipment.
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          {centerSwap}

          <Stack sx={{ flex: "1 1 0%", minWidth: 0, pl: 2 }} spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap">
              <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ letterSpacing: "0.15px" }}>
                New Shipment
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                {newShipmentId === null ? <CircularProgress size={18} thickness={5} /> : null}
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {splitNewShipmentDisplayRef(newShipmentId)}
                </Typography>
              </Stack>
            </Stack>
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                borderRadius: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              {newItems.length === 0 ? (
                <Stack
                  flex={1}
                  alignItems="center"
                  justifyContent="center"
                  spacing={1.5}
                  sx={{ px: 3, py: 6 }}
                >
                  <Inventory2OutlinedIcon sx={{ fontSize: 32, color: "action.disabled" }} />
                  <Typography variant="body1" color="text.secondary" sx={{ letterSpacing: "0.15px" }}>
                    Ready for Items
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={1.5} sx={{ overflow: "auto", p: 1.5, flex: 1, minHeight: 0 }}>
                  {newItems.map((item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt=""
                        sx={{ width: 56, height: 56, borderRadius: 0.5, objectFit: "cover", flexShrink: 0 }}
                      />
                      <Typography variant="body2" fontWeight={500} sx={{ flex: "1 1 auto", minWidth: 0, lineHeight: 1.4 }}>
                        {item.title}
                      </Typography>
                      {item.movable ? (
                        <Button
                          size="small"
                          color="primary"
                          variant="outlined"
                          startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                          onClick={() => moveToCurrent(item.id)}
                          sx={{
                            flexShrink: 0,
                            textTransform: "none",
                            fontWeight: 600,
                            letterSpacing: "0.3px",
                            minWidth: "auto",
                            px: 1,
                          }}
                        >
                          MOVE
                        </Button>
                      ) : null}
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Stack>
      </DialogContent>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between", flexShrink: 0 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1, px: 2.75, borderColor: "grey.400", color: "text.primary" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!transferDirty}
          onClick={handleConfirm}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px", py: 1, px: 2.75 }}
        >
          Confirm & Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const CREATE_REMARK_MESSAGE_PLACEHOLDER = "Please write your message here";

function ItemRemarksDialog({
  open,
  onClose,
  itemId,
  messages,
}: {
  open: boolean;
  onClose: () => void;
  itemId: string;
  messages: ShipmentMessage[];
}) {
  const filteredMessages = useMemo(() => {
    return messages
      .filter((m) => m.itemId === itemId)
      .sort(compareShipmentMessagesNewestFirst);
  }, [messages, itemId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 540,
          maxHeight: "calc(100% - 64px)",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          pr: 1,
          pb: 1,
          pt: 3,
          px: 3,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} color="text.primary" sx={{ letterSpacing: "0.15px" }}>
          Item Remarks
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ mr: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogContent
        sx={{
          px: 3,
          pt: 2,
          pb: 2,
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            flex: "1 1 auto",
            minHeight: 160,
            maxHeight: 360,
            overflow: "auto",
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          {filteredMessages.length > 0 ? (
            filteredMessages.map((m) => <MessageRow key={m.id} message={m} />)
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No remarks for this item yet.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "flex-end", flexShrink: 0 }}>
        <Button variant="contained" color="primary" onClick={onClose} sx={{ textTransform: "uppercase", letterSpacing: "0.46px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CreateRemarkDialog({
  open,
  onClose,
  defaultItemId,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  defaultItemId: string | null;
  onSend: (payload: { targetKey: string; remarkPreset: string; body: string }) => void;
}) {
  const [remarkPreset, setRemarkPreset] = useState("");
  const [applyScope, setApplyScope] = useState<string>("shipment");
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    if (open) {
      setRemarkPreset("");
      setApplyScope(defaultItemId ?? "shipment");
      setMessageBody("");
    }
  }, [open, defaultItemId]);

  const targetKey = defaultItemId ?? applyScope;

  const applyToLabel = (key: string) => {
    if (key === "shipment") return REMARK_ALL_PRODUCTS_LABEL;
    const meta = PACK_LINE_ITEM_META.find((x) => x.id === key);
    return meta?.itemListLabel ?? key;
  };

  const canSend = remarkPreset !== "";

  const handleSend = () => {
    if (!canSend) return;
    onSend({ targetKey, remarkPreset, body: messageBody.trim() });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: 540,
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          pr: 1,
          pb: 1,
          pt: 3,
          px: 3,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight={500} color="text.primary" component="span" sx={{ letterSpacing: "0.15px" }}>
          Packing Remarks
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ mt: -0.5, mr: -0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogContent
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Stack spacing={3} sx={{ flex: "1 1 auto", minHeight: 0 }}>
          {defaultItemId ? (
            <Typography variant="body2" color="text.secondary">
              Applies to: {applyToLabel(defaultItemId)}
            </Typography>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="create-remark-scope-label" shrink>
                Apply to
              </InputLabel>
              <Select
                labelId="create-remark-scope-label"
                id="create-remark-scope"
                label="Apply to"
                value={applyScope}
                onChange={(e: SelectChangeEvent<string>) => setApplyScope(e.target.value)}
              >
                <MenuItem value="shipment">{REMARK_ALL_PRODUCTS_LABEL}</MenuItem>
                {PACK_LINE_ITEM_META.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.itemListLabel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth>
            <InputLabel id="create-remark-preset-label" shrink>
              Select Remark
            </InputLabel>
            <Select
              labelId="create-remark-preset-label"
              id="create-remark-preset"
              label="Select Remark"
              value={remarkPreset}
              displayEmpty
              onChange={(e: SelectChangeEvent<string>) => setRemarkPreset(e.target.value)}
              renderValue={(v) =>
                v === "" ? (
                  <Typography component="span" variant="body1" color="text.disabled">
                    Select
                  </Typography>
                ) : (
                  v
                )
              }
              MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
            >
              <MenuItem value="" disabled>
                Select
              </MenuItem>
              {REMARK_PRESET_OPTIONS.map((label) => (
                <MenuItem key={label} value={label}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack spacing={1.5} sx={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Typography variant="body1" color="text.primary" sx={{ letterSpacing: "0.15px", flexShrink: 0 }}>
              Message (optional):
            </Typography>
            <TextField
              multiline
              fullWidth
              placeholder={CREATE_REMARK_MESSAGE_PLACEHOLDER}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              variant="outlined"
              inputProps={{ "aria-label": "Message text" }}
              sx={{
                flex: "1 1 auto",
                minHeight: 100,
                "& .MuiOutlinedInput-root": {
                  minHeight: 100,
                  height: "100%",
                  alignItems: "flex-start",
                  paddingTop: 1.25,
                  paddingBottom: 1.25,
                  boxSizing: "border-box",
                },
                "& textarea": {
                  minHeight: "72px !important",
                },
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <Divider sx={{ flexShrink: 0 }} />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between", flexShrink: 0 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: "uppercase", letterSpacing: "0.46px" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!canSend}
          onClick={handleSend}
          sx={{ textTransform: "uppercase", letterSpacing: "0.46px" }}
        >
          Send message
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CarrierShippingRouteDialog({
  open,
  onClose,
  activeRouteId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  activeRouteId: string;
  onSave: (routeId: string) => void;
}) {
  const [pendingRouteId, setPendingRouteId] = useState(activeRouteId);

  useEffect(() => {
    if (open) {
      setPendingRouteId(activeRouteId);
    }
  }, [open, activeRouteId]);

  const currentRoute = findShippingRoute(activeRouteId) ?? SHIPPING_ROUTE_ROWS[0];
  const availableRoutes = SHIPPING_ROUTE_ROWS.filter((r) => r.id !== activeRouteId);
  const currentRouteSelected = pendingRouteId === activeRouteId;

  const handleSave = () => {
    if (!pendingRouteId || pendingRouteId === activeRouteId) return;
    onSave(pendingRouteId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          minHeight: 500,
          maxHeight: "calc(100% - 64px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span" fontWeight={600} color="text.primary">
          Carrier Shipping Route
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
              Current Route
            </Typography>
            <Box
              sx={{
                border: "2px solid",
                borderColor: currentRouteSelected ? "primary.main" : "divider",
                borderRadius: 1,
                px: 2,
                py: 1,
                boxSizing: "border-box",
                bgcolor: currentRouteSelected
                  ? (theme) => alpha(theme.palette.primary.main, 0.12)
                  : "background.paper",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Radio
                  checked={currentRouteSelected}
                  size="small"
                  tabIndex={-1}
                  disableRipple
                  sx={{ p: 0.5, pointerEvents: "none" }}
                  icon={<RadioButtonUncheckedIcon sx={{ fontSize: 22, color: "action.active" }} />}
                  checkedIcon={
                    <CheckCircleIcon sx={{ fontSize: 22, color: "primary.main" }} />
                  }
                />
                <ShippingRouteColumnLabels route={currentRoute} />
              </Stack>
            </Box>
          </Box>
          <Box>
            <Typography fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
              Available Routes
            </Typography>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "background.paper",
              }}
            >
              <RadioGroup
                value={pendingRouteId === activeRouteId ? "" : pendingRouteId}
                onChange={(e) => setPendingRouteId(e.target.value)}
              >
                {availableRoutes.map((r, index) => {
                  const selected = pendingRouteId === r.id && pendingRouteId !== activeRouteId;
                  const isLast = index === availableRoutes.length - 1;
                  return (
                    <Box
                      key={r.id}
                      component="label"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: 2,
                        py: 1,
                        cursor: "pointer",
                        m: 0,
                        boxSizing: "border-box",
                        borderBottom: !isLast ? "1px solid" : "none",
                        borderColor: "divider",
                        ...(selected && {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                          boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.primary.main}`,
                        }),
                      }}
                    >
                      <Radio
                        value={r.id}
                        size="small"
                        sx={{ p: 0.5 }}
                        icon={<RadioButtonUncheckedIcon sx={{ fontSize: 22, color: "action.active" }} />}
                        checkedIcon={
                          <CheckCircleIcon sx={{ fontSize: 22, color: "primary.main" }} />
                        }
                      />
                      <ShippingRouteColumnLabels route={r} />
                    </Box>
                  );
                })}
              </RadioGroup>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: "uppercase" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={pendingRouteId === activeRouteId}
          onClick={handleSave}
          sx={{ textTransform: "uppercase" }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function OtherFacilityLocationChip({ label }: { label: string }) {
  return (
    <Chip
      icon={<PlaceOutlinedIcon sx={{ fontSize: "18px !important", color: "text.primary" }} />}
      label={label}
      size="small"
      sx={{
        position: "absolute",
        left: 16,
        top: 0,
        zIndex: 1,
        transform: "translateY(-50%)",
        height: 28,
        pl: 0.5,
        pr: 1,
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "0.15px",
        color: "text.primary",
        bgcolor: "grey.200",
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.common.black, 0.08),
        "& .MuiChip-icon": {
          ml: "6px",
          mr: "-2px",
          color: "text.primary",
        },
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
}

export default function ReadyToPack() {
  const theme = useTheme();
  const [orderInput, setOrderInput] = useState("");
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  /** After Split Shipment confirm, skip resetting `packItems` in the `loadedOrderId` effect (items already applied). */
  const skipPackItemsResetAfterSplitConfirmRef = useRef(false);
  /** Prototype: stack of order ids before opening pending (`fix`) via Next — Back restores the last one. */
  const [orderBrowseStack, setOrderBrowseStack] = useState<string[]>([]);
  const [notFoundQuery, setNotFoundQuery] = useState<string | null>(null);
  const [itemsReviewed, setItemsReviewed] = useState(false);
  const [shipmentDetailsEditUnlocked, setShipmentDetailsEditUnlocked] = useState(false);
  const [trackingManualMode, setTrackingManualMode] = useState(false);
  const [manualTrackingInput, setManualTrackingInput] = useState("");
  const [trackingLoadPending, setTrackingLoadPending] = useState(false);
  const [activeCarrierRouteId, setActiveCarrierRouteId] = useState(INITIAL_CARRIER_ROUTE_ID);
  const [carrierRouteDialogOpen, setCarrierRouteDialogOpen] = useState(false);
  const [savedShipmentAddress, setSavedShipmentAddress] = useState<AddressForm>({ ...DEFAULT_ADDRESS_FORM });
  const [destinationDisplay, setDestinationDisplay] = useState(() =>
    formatDestinationSummary(DEFAULT_ADDRESS_FORM),
  );
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [orderHistoryDialogOpen, setOrderHistoryDialogOpen] = useState(false);
  const [sendToFixDialogOpen, setSendToFixDialogOpen] = useState(false);
  const [joinShipmentDialogOpen, setJoinShipmentDialogOpen] = useState(false);
  const [splitShipmentDialogOpen, setSplitShipmentDialogOpen] = useState(false);
  const [packItems, setPackItems] = useState<JoinTransferItem[]>(() =>
    buildSplitShipmentCurrentItems().map((x) => ({ ...x, movable: false })),
  );
  const [shipmentMessages, setShipmentMessages] = useState<ShipmentMessage[]>(() => buildInitialShipmentMessages());
  const [remarksTab, setRemarksTab] = useState<RemarksTabValue>("all");
  const [createRemarkOpen, setCreateRemarkOpen] = useState(false);
  const [createRemarkDefaultItemId, setCreateRemarkDefaultItemId] = useState<string | null>(null);
  const [itemRemarksItemId, setItemRemarksItemId] = useState<string | null>(null);
  const [moreActionsMenuAnchor, setMoreActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [onHoldStatusMenuAnchor, setOnHoldStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [packingOrderUiStatus, setPackingOrderUiStatus] = useState<PackingOrderUiStatus>("readyToPack");
  const [sentToFixReason, setSentToFixReason] = useState<string | null>(null);
  /** After OK/Cancel, hide the pending notice until `loadedOrderId` changes again. */
  const [pendingShipmentDialogDismissed, setPendingShipmentDialogDismissed] = useState(false);
  /** Prototype similar orders: which tab is active (Figma 2314:30804). */
  const [similarOrdersTabIndex, setSimilarOrdersTabIndex] = useState(SIMILAR_ORDER_CURRENT_SHIPMENT_TAB_INDEX);
  /** Prototype split orders: which linked shipment tab is active (original vs new). */
  const [splitOrdersTabIndex, setSplitOrdersTabIndex] = useState(0);
  /** After Split Shipment dialog confirm: concrete original + new shipment ids for tabs; search `split` uses prototype rows. */
  const [splitLinkedPair, setSplitLinkedPair] = useState<{ original: string; split: string } | null>(null);
  /** Per-tab line items after a completed split dialog; null for search-only `split` prototype. */
  const [splitTabInventories, setSplitTabInventories] = useState<{
    original: JoinTransferItem[];
    newShipment: JoinTransferItem[];
  } | null>(null);
  /** On-hold only: item IDs at another facility until Kiriyat Gat marks received (Figma 1744:42531). */
  const [remoteFacilityItemIds, setRemoteFacilityItemIds] = useState<string[]>([]);
  /** Line items marked received from another facility — rendered at bottom in this order, not in fixed meta slots. */
  const [remoteReceivedPackOrder, setRemoteReceivedPackOrder] = useState<string[]>([]);
  const [otherFacilitiesSectionExpanded, setOtherFacilitiesSectionExpanded] = useState(true);
  /** Prototype: header profile toggles Hungary vs Kiryat Gat packing layout. */
  const [prototypeFactorySiteView, setPrototypeFactorySiteView] = useState<"kiryatGat" | "hungary">("kiryatGat");
  /** Figma 2345:27263 — per line item, container location after simulated scan. */
  const [containerAssignByItemId, setContainerAssignByItemId] = useState<
    Record<string, PrototypeContainerAssignDetail>
  >({});

  const orderPacked = packingOrderUiStatus === "packed";
  const isPackActionsBlocked = isPackingStatusBlockingActions(packingOrderUiStatus);
  const isSortingStationView = isSortingStationOrderId(loadedOrderId);
  const isSimilarOrdersView = isPrototypeSimilarOrdersId(loadedOrderId);
  const isSplitOrdersView = isPrototypeSplitOrdersId(loadedOrderId);
  /** On-hold + sorting: per-line container row (sorting = “Scan to Assign” until scanned; on-hold skips gift kit). */
  const showItemContainerAssignRow = packingOrderUiStatus === "onHold" || isSortingStationView;

  const splitOrderTabsResolved = useMemo((): SplitOrderTabRow[] => {
    if (!isSplitOrdersView) return [];
    const factory = prototypeFactorySiteView === "hungary" ? "HU" : "KG";
    if (splitLinkedPair) {
      return [
        {
          key: "split-linked-original",
          shipmentId: splitLinkedPair.original,
          factoryLabel: factory,
          orderNumber: "5847219",
        },
        {
          key: "split-linked-new",
          shipmentId: splitLinkedPair.split,
          factoryLabel: factory,
          orderNumber: "5847220",
        },
      ];
    }
    return SPLIT_ORDER_PROTOTYPE_TABS.map((r) => ({
      ...r,
      factoryLabel: factory,
    }));
  }, [isSplitOrdersView, splitLinkedPair, prototypeFactorySiteView]);

  const similarShipmentTabIndex = Math.min(
    similarOrdersTabIndex,
    SIMILAR_ORDER_TABS.length - 1,
  );
  const splitShipmentTabIndex = Math.min(
    splitOrdersTabIndex,
    Math.max(0, splitOrderTabsResolved.length - 1),
  );
  const similarOrderDetailIndex = isSimilarOrdersView ? similarShipmentTabIndex : 0;
  const activeSimilarOrder =
    isSimilarOrdersView && SIMILAR_ORDER_TABS[similarOrderDetailIndex]
      ? SIMILAR_ORDER_TABS[similarOrderDetailIndex]
      : SIMILAR_ORDER_TABS[0];
  const activeSplitOrder =
    isSplitOrdersView && splitOrderTabsResolved[splitShipmentTabIndex]
      ? splitOrderTabsResolved[splitShipmentTabIndex]
      : null;

  const displayedShipmentId = isSimilarOrdersView
    ? activeSimilarOrder.shipmentId
    : isSplitOrdersView && activeSplitOrder
      ? activeSplitOrder.shipmentId
      : "SH-12345";
  const displayedOrderNumberForDetails =
    isSimilarOrdersView && loadedOrderId
      ? activeSimilarOrder.orderNumber
      : isSplitOrdersView && loadedOrderId && activeSplitOrder
        ? activeSplitOrder.orderNumber
        : loadedOrderId;
  const joinDialogShipmentId =
    isSimilarOrdersView && loadedOrderId
      ? activeSimilarOrder.shipmentId
      : isSplitOrdersView && loadedOrderId && activeSplitOrder
        ? activeSplitOrder.shipmentId
        : loadedOrderId ?? "";

  /** Similar orders: tab 0 full list, tab 1 only the differing product. Split: dialog inventories or default prototype second tab. */
  const packItemsResolved = useMemo(() => {
    if (isSimilarOrdersView && similarShipmentTabIndex === 1) {
      return [SIMILAR_ORDER_SECOND_TAB_ITEM];
    }
    if (isSplitOrdersView && !splitTabInventories && splitShipmentTabIndex === 1) {
      return [SPLIT_PROTOTYPE_SECOND_TAB_ITEM];
    }
    if (!isSplitOrdersView || !splitTabInventories) return packItems;
    return splitShipmentTabIndex === 0 ? splitTabInventories.original : splitTabInventories.newShipment;
  }, [
    isSimilarOrdersView,
    similarShipmentTabIndex,
    isSplitOrdersView,
    splitTabInventories,
    splitShipmentTabIndex,
    packItems,
  ]);

  const packItemCount = packItemsResolved.length;
  const visiblePackItemIds = useMemo(() => new Set(packItemsResolved.map((i) => i.id)), [packItemsResolved]);
  const showPackLine = (lineId: string) =>
    visiblePackItemIds.has(lineId) && !remoteReceivedPackOrder.includes(lineId);
  const showPackLine0 = showPackLine(PACK_LINE_ITEM_META[0].id);
  const showPackLine1 = showPackLine(PACK_LINE_ITEM_META[1].id);
  const showPackLine2 = showPackLine(PACK_LINE_ITEM_META[2].id);
  const visibleRemoteReceivedIdsOrdered = useMemo(
    () => remoteReceivedPackOrder.filter((rid) => visiblePackItemIds.has(rid)),
    [remoteReceivedPackOrder, visiblePackItemIds],
  );
  const extraPackItems = useMemo(
    () => packItemsResolved.filter((i) => !PACK_LINE_ITEM_META.some((meta) => meta.id === i.id)),
    [packItemsResolved],
  );

  const hungaryFactoryDemoActive =
    prototypeFactorySiteView === "hungary" &&
    !isSimilarOrdersView &&
    !isSplitOrdersView &&
    !isSortingStationView &&
    packingOrderUiStatus !== "onHold" &&
    packingOrderUiStatus !== "cancelled" &&
    packingOrderUiStatus !== "pending";

  const remoteFacilityIdsForUi = hungaryFactoryDemoActive
    ? [...HUNGARY_DEMO_OTHER_FACILITY_LINE_IDS]
    : remoteFacilityItemIds;

  const showOtherFacilitiesSection =
    !isSimilarOrdersView &&
    !isSplitOrdersView &&
    remoteFacilityIdsForUi.length > 0 &&
    (packingOrderUiStatus === "onHold" ||
      hungaryFactoryDemoActive ||
      (packingOrderUiStatus === "readyToPack" && isPrototypeOnHoldOrderId(loadedOrderId)));

  const showPackLine0Ui = hungaryFactoryDemoActive
    ? visiblePackItemIds.has(PACK_LINE_ITEM_META[0].id) &&
      !remoteReceivedPackOrder.includes(PACK_LINE_ITEM_META[0].id)
    : showPackLine0;
  const showPackLine1Ui = hungaryFactoryDemoActive ? false : showPackLine1;
  const showPackLine2Ui = hungaryFactoryDemoActive ? false : showPackLine2;
  const anyPrimaryPackLineVisibleUi = showPackLine0Ui || showPackLine1Ui || showPackLine2Ui;
  const extraPackItemsUi = hungaryFactoryDemoActive ? [] : extraPackItems;
  const packItemCountUi = hungaryFactoryDemoActive ? 1 : packItemCount;
  const visibleRemoteReceivedIdsOrderedUi = hungaryFactoryDemoActive ? [] : visibleRemoteReceivedIdsOrdered;

  const handleTogglePrototypeFactorySite = () => {
    setPrototypeFactorySiteView((v) => {
      if (v === "kiryatGat") {
        setOtherFacilitiesSectionExpanded(false);
        setActiveCarrierRouteId(PROTOTYPE_HUNGARY_CARRIER_ROUTE_ID);
        return "hungary";
      }
      if (packingOrderUiStatus === "onHold") {
        setOtherFacilitiesSectionExpanded(true);
      }
      setActiveCarrierRouteId(INITIAL_CARRIER_ROUTE_ID);
      return "kiryatGat";
    });
  };

  /** Other similar-order tab: prefill join dialog source column when opening from the pair UI. */
  const joinPrefillSourceShipmentId = useMemo(() => {
    if (!isSimilarOrdersView || SIMILAR_ORDER_TABS.length < 2) return null;
    const otherIndex = similarShipmentTabIndex === 0 ? 1 : 0;
    return SIMILAR_ORDER_TABS[otherIndex].shipmentId;
  }, [isSimilarOrdersView, similarShipmentTabIndex]);
  const activeRoute = findShippingRoute(activeCarrierRouteId) ?? SHIPPING_ROUTE_ROWS[0];
  const activeCarrierLogoSrc = findCarrierLogoSrc(activeRoute);
  /** Non-primary tab on split or similar-order pair: preview only — no pack column or reviewed checkbox (tab 0 packs). */
  const isLinkedOrderNonPrimaryTab =
    (isSplitOrdersView && splitShipmentTabIndex !== 0) ||
    (isSimilarOrdersView && similarShipmentTabIndex !== 0);
  /** Hide pack checkbox + pack / send-to-fix / more-actions (sorting station is view-only for pack flow). */
  const hidePackActionsUi =
    isPackActionsBlocked || isSortingStationView || isLinkedOrderNonPrimaryTab;
  const packingStatusChip = getPackingStatusChipConfig(packingOrderUiStatus, theme);
  const StatusChipIcon = packingStatusChip.Icon;
  const readyToPackStatusChip = getPackingStatusChipConfig("readyToPack", theme);
  const ReadyToPackStatusIcon = readyToPackStatusChip.Icon;
  const onHoldStatusMenuOpen = Boolean(onHoldStatusMenuAnchor);

  const moreActionsMenuItems = orderPacked ? MORE_ACTIONS_MENU_ITEMS_PACKED : MORE_ACTIONS_MENU_ITEMS_DEFAULT;

  const filteredRemarksMessages = useMemo(() => {
    return shipmentMessages
      .filter((m) => remarksTab === "all" || m.channel === remarksTab)
      .sort(compareShipmentMessagesNewestFirst);
  }, [shipmentMessages, remarksTab]);

  const remarkCountByItemId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of shipmentMessages) {
      if (m.itemId) map[m.itemId] = (map[m.itemId] ?? 0) + 1;
    }
    return map;
  }, [shipmentMessages]);

  const isEmptyState = loadedOrderId === null;
  const isInitialScanScreen = isEmptyState && notFoundQuery === null;

  const showShipmentPendingDialog =
    isPrototypePendingOrderId(loadedOrderId) && !pendingShipmentDialogDismissed;

  useEffect(() => {
    setPendingShipmentDialogDismissed(false);
  }, [loadedOrderId]);

  useEffect(() => {
    setItemsReviewed(false);
    const isFixQueue = isPrototypePendingOrderId(loadedOrderId);
    const isCancelledProto = isPrototypeCancelledOrderId(loadedOrderId);
    const isOnHoldProto = isPrototypeOnHoldOrderId(loadedOrderId);
    const isPackedProto = isPrototypePackedOrderId(loadedOrderId);
    if (isCancelledProto) {
      setPackingOrderUiStatus("cancelled");
      setSentToFixReason(null);
    } else if (isFixQueue) {
      setPackingOrderUiStatus("pending");
      setSentToFixReason(PROTOTYPE_PENDING_SENT_TO_FIX_BODY);
    } else if (isOnHoldProto) {
      setPackingOrderUiStatus("onHold");
      setSentToFixReason(null);
    } else if (isPackedProto) {
      setPackingOrderUiStatus("packed");
      setSentToFixReason(null);
      setItemsReviewed(true);
    } else {
      setPackingOrderUiStatus("readyToPack");
      setSentToFixReason(null);
    }
    setShipmentDetailsEditUnlocked(false);
    setTrackingManualMode(false);
    setManualTrackingInput("");
    setTrackingLoadPending(false);
    setActiveCarrierRouteId(INITIAL_CARRIER_ROUTE_ID);
    setCarrierRouteDialogOpen(false);
    setSavedShipmentAddress({ ...DEFAULT_ADDRESS_FORM });
    setDestinationDisplay(formatDestinationSummary(DEFAULT_ADDRESS_FORM));
    setAddressDialogOpen(false);
    setOrderHistoryDialogOpen(false);
    setSendToFixDialogOpen(false);
    setJoinShipmentDialogOpen(false);
    setSplitShipmentDialogOpen(false);
    setShipmentMessages(buildInitialShipmentMessages());
    setRemarksTab("all");
    setCreateRemarkOpen(false);
    setCreateRemarkDefaultItemId(null);
    setItemRemarksItemId(null);
    setMoreActionsMenuAnchor(null);
    setOnHoldStatusMenuAnchor(null);
    setSimilarOrdersTabIndex(SIMILAR_ORDER_CURRENT_SHIPMENT_TAB_INDEX);
    setSplitOrdersTabIndex(0);
    if (!isPrototypeSplitOrdersId(loadedOrderId)) {
      setSplitLinkedPair(null);
      setSplitTabInventories(null);
    }
    setPrototypeFactorySiteView("kiryatGat");
    const base = buildSplitShipmentCurrentItems().map((x) => ({ ...x, movable: false }));
    if (isOnHoldProto) {
      setRemoteFacilityItemIds([...PROTOTYPE_ON_HOLD_REMOTE_FACILITY_ITEM_IDS]);
      setPackItems(base.filter((i) => !PROTOTYPE_ON_HOLD_REMOTE_FACILITY_ITEM_IDS.includes(i.id)));
      setRemoteReceivedPackOrder([]);
      setOtherFacilitiesSectionExpanded(true);
    } else {
      setRemoteFacilityItemIds([]);
      setRemoteReceivedPackOrder([]);
      if (skipPackItemsResetAfterSplitConfirmRef.current) {
        skipPackItemsResetAfterSplitConfirmRef.current = false;
      } else {
        setPackItems(base);
      }
    }
    if (isOnHoldProto) {
      setContainerAssignByItemId(buildOnHoldDefaultContainerAssignByItemId());
    } else {
      setContainerAssignByItemId({});
    }
  }, [loadedOrderId]);

  const handleContainerAssignSimulate = (assignItemId: string) => {
    setContainerAssignByItemId((prev) => ({
      ...prev,
      [assignItemId]: { code: PROTOTYPE_CONTAINER_ASSIGN_CODE, location: PROTOTYPE_CONTAINER_ASSIGN_LOCATION },
    }));
  };

  const handleContainerAssignClear = (assignItemId: string) => {
    setContainerAssignByItemId((prev) => {
      const next = { ...prev };
      delete next[assignItemId];
      return next;
    });
  };

  const handleRemoteFacilityItemReceived = (itemId: string) => {
    const full = buildSplitShipmentCurrentItems().find((i) => i.id === itemId);
    if (!full) return;
    setPackItems((prev) => {
      if (prev.some((i) => i.id === itemId)) return prev;
      return [...prev, { ...full, movable: false }];
    });
    setRemoteReceivedPackOrder((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    setRemoteFacilityItemIds((prev) => prev.filter((id) => id !== itemId));
  };

  const handleRemoteFacilityReceivedChange = (itemId: string, checked: boolean) => {
    if (!PROTOTYPE_ON_HOLD_REMOTE_FACILITY_ITEM_IDS.includes(itemId)) return;
    if (checked) {
      handleRemoteFacilityItemReceived(itemId);
      return;
    }
    setRemoteReceivedPackOrder((prev) => prev.filter((id) => id !== itemId));
    const returnToOtherFacilities =
      packingOrderUiStatus === "onHold" ||
      (packingOrderUiStatus === "readyToPack" && isPrototypeOnHoldOrderId(loadedOrderId));
    if (returnToOtherFacilities) {
      setPackItems((prev) => prev.filter((p) => p.id !== itemId));
      setRemoteFacilityItemIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    }
  };

  const remoteFacilityItemReceivedControl = (itemId: string): ReactNode => {
    if (prototypeFactorySiteView === "hungary") return null;
    if (!isPrototypeOnHoldOrderId(loadedOrderId)) return null;
    if (!PROTOTYPE_ON_HOLD_REMOTE_FACILITY_ITEM_IDS.includes(itemId)) return null;
    return (
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            color="info"
            checked={remoteReceivedPackOrder.includes(itemId)}
            onChange={(_, checked) => handleRemoteFacilityReceivedChange(itemId, checked)}
            sx={{ py: 0.5 }}
          />
        }
        label={
          <Typography variant="body1" sx={{ fontSize: 16, letterSpacing: "0.15px" }}>
            Item Received
          </Typography>
        }
        sx={{ m: 0, mr: 0, gap: 0.5, alignItems: "center" }}
      />
    );
  };

  const openCreateRemarkDialog = (defaultItemId: string | null) => {
    setCreateRemarkDefaultItemId(defaultItemId);
    setCreateRemarkOpen(true);
  };

  const openItemRemarksDialog = (itemId: string) => {
    setItemRemarksItemId(itemId);
  };

  const handleCreateRemarkSend = ({
    targetKey,
    remarkPreset,
    body,
  }: {
    targetKey: string;
    remarkPreset: string;
    body: string;
  }) => {
    const now = new Date().toISOString();
    const itemLabel =
      targetKey === "shipment"
        ? REMARK_ALL_PRODUCTS_LABEL
        : (PACK_LINE_ITEM_META.find((x) => x.id === targetKey)?.itemListLabel ?? "Item");
    const messageBodyText = body.trim() ? `${remarkPreset}\n\n${body.trim()}` : remarkPreset;
    setShipmentMessages((prev) => [
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `msg-${Date.now()}`,
        at: now,
        author: "You",
        senderRole: "packer",
        channel: "packing",
        body: messageBodyText,
        itemId: targetKey === "shipment" ? null : targetKey,
        itemLabel,
      },
      ...prev,
    ]);
  };

  const handleLoadTrackingNumber = async () => {
    if (!loadedOrderId) return;
    setTrackingLoadPending(true);
    try {
      const id = await loadTrackingNumberFromApi(loadedOrderId);
      setManualTrackingInput(id);
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoadPending(false);
    }
  };

  const handleLoadOrder = () => {
    const id = normalizeOrderIdForLoad(orderInput);
    if (!id) {
      setLoadedOrderId(null);
      setNotFoundQuery(null);
      setOrderBrowseStack([]);
      return;
    }
    if (isZeroOnlyShipmentQuery(id)) {
      setLoadedOrderId(null);
      setNotFoundQuery(id);
      setOrderBrowseStack([]);
      return;
    }
    setNotFoundQuery(null);
    setOrderBrowseStack([]);
    setLoadedOrderId(id);
    if (id === PROTOTYPE_SPLIT_ORDER_ID) {
      setSplitLinkedPair(null);
      setSplitTabInventories(null);
    }
  };

  const handleNextOrder = () => {
    setNotFoundQuery(null);
    if (loadedOrderId) {
      setOrderBrowseStack((s) => [...s, loadedOrderId]);
    }
    const nextId = getNextPrototypeCycleOrderId(loadedOrderId);
    setOrderInput(nextId);
    setLoadedOrderId(nextId);
  };

  const handlePreviousOrder = () => {
    if (orderBrowseStack.length === 0) return;
    const prev = orderBrowseStack[orderBrowseStack.length - 1];
    setOrderBrowseStack((s) => s.slice(0, -1));
    setOrderInput(prev);
    setLoadedOrderId(prev);
  };

  const handleShipmentPendingOk = () => {
    setPendingShipmentDialogDismissed(true);
    setPackingOrderUiStatus("readyToPack");
    setSentToFixReason(null);
  };

  const handleShipmentPendingCancel = () => {
    setPendingShipmentDialogDismissed(true);
    if (orderBrowseStack.length > 0) {
      handlePreviousOrder();
    } else {
      setLoadedOrderId(null);
      setOrderInput("");
      setNotFoundQuery(null);
      setOrderBrowseStack([]);
    }
  };

  return (
    <Box
      data-node-id="2001:19492"
      sx={{
        minHeight: "100vh",
        bgcolor: "#f9f9fb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <AppBar
        position="relative"
        color="inherit"
        elevation={0}
        sx={{
          ...elevationSx,
          bgcolor: "background.paper",
          height: 90,
          zIndex: 2,
          justifyContent: "center",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            px: 3,
            minHeight: 64,
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              component="img"
              src={tenenGroupLogo}
              alt="Tenen Group"
              sx={{ height: 36, width: "auto", maxWidth: 234, display: "block" }}
            />
          </Stack>

          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              pr: 2,
              py: 0.5,
              bgcolor: "background.paper",
              width: 600,
            }}
          >
            <TextField
              variant="standard"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLoadOrder();
                }
              }}
              placeholder={isInitialScanScreen ? ORDER_SEARCH_PLACEHOLDER : undefined}
              autoFocus={isInitialScanScreen}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <NumbersIcon sx={{ fontSize: 24, color: "text.secondary", mr: 0.5 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Search">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Search"
                        onClick={handleLoadOrder}
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                sx: { px: 2, py: 1, width: "100%", minWidth: 450 },
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiInputBase-input": { py: 0.5 },
                "& .MuiInputBase-input::placeholder": {
                  opacity: 1,
                  color: "action.disabled",
                },
              }}
            />
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "divider" }} />
            <Stack direction="row" spacing={1} sx={{ pl: 1 }}>
              <Tooltip title="View Order Details">
                <Box component="span" sx={{ display: "inline-flex" }}>
                  <IconButton size="small" aria-label="View Order Details" disabled={isEmptyState}>
                    <ListAltIcon />
                  </IconButton>
                </Box>
              </Tooltip>
              <Tooltip title="Back order">
                <Box component="span" sx={{ display: "inline-flex" }}>
                  <IconButton
                    size="small"
                    aria-label="Back order"
                    disabled={orderBrowseStack.length === 0}
                    onClick={handlePreviousOrder}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Box>
              </Tooltip>
              <Tooltip title="Next Order">
                <Box component="span" sx={{ display: "inline-flex" }}>
                  <IconButton size="small" aria-label="Next Order" onClick={handleNextOrder}>
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              </Tooltip>
            </Stack>
          </Paper>

          <Stack direction="row" alignItems="center" spacing={3} sx={{ flex: 1, justifyContent: "flex-end" }}>
            <Tooltip title="Go to Order Manager">
              <IconButton
                size="medium"
                aria-label="Go to Order Manager"
                onClick={() => {
                  window.location.hash = "#/components/status-chips";
                }}
              >
                <AssignmentOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ height: 40, borderColor: "divider" }} />
            <ButtonBase
              onClick={handleTogglePrototypeFactorySite}
              sx={{
                borderRadius: 1,
                px: 0.5,
                py: 0.25,
                textAlign: "left",
                color: "inherit",
              }}
              aria-label={
                prototypeFactorySiteView === "hungary"
                  ? "Switch to Kiryat Gat factory view"
                  : "Switch to Hungary factory view"
              }
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#90a4ae", fontSize: 12 }}>JD</Avatar>
                <Stack sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} textAlign="left">
                    {prototypeFactorySiteView === "hungary" ? "James" : "John"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" textAlign="left">
                    {prototypeFactorySiteView === "hungary" ? "Hungary" : "Kiryat Gat"}
                  </Typography>
                </Stack>
              </Stack>
            </ButtonBase>
          </Stack>
        </Toolbar>
      </AppBar>

      {loadedOrderId ? (
      <Box
        sx={{
          alignSelf: "stretch",
          width: "100%",
          maxWidth: 1600,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: 3,
          pb: 6,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "stretch",
        }}
      >
        <Paper
          elevation={1}
          sx={{
            width: "100%",
            maxWidth: "100%",
            alignSelf: "stretch",
            boxSizing: "border-box",
            p: 3,
            borderRadius: 1,
            ...elevationSx,
          }}
        >
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="h6" sx={{ color: "primary.dark" }}>
                  Shipment Details
                </Typography>
                <Tooltip title={shipmentDetailsEditUnlocked ? "Lock edit" : "Unlock Edit"}>
                  <IconButton
                    size="small"
                    aria-label={shipmentDetailsEditUnlocked ? "Lock shipment details edit" : "Unlock shipment details edit"}
                    aria-pressed={shipmentDetailsEditUnlocked}
                    onClick={() => setShipmentDetailsEditUnlocked((open) => !open)}
                  >
                    {shipmentDetailsEditUnlocked ? (
                      <LockOpenOutlinedIcon fontSize="small" />
                    ) : (
                      <LockOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box
                component="img"
                src={oakAndLunaLogo}
                alt="Oak & Luna"
                sx={{ height: 28, width: "auto", display: "block" }}
              />
            </Stack>

            <Stack
              direction="row"
              alignItems="stretch"
              useFlexGap
              spacing={2}
              sx={{
                width: "100%",
                minWidth: 0,
                overflowX: "auto",
                flexWrap: "nowrap",
                justifyContent: "space-between",
                pb: 0.5,
              }}
            >
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Shipment ID">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DetailValue>{displayedShipmentId}</DetailValue>
                      {shipmentDetailsEditUnlocked ? (
                        <Tooltip title="Merukazim">
                          <NorthEastIcon sx={{ color: "text.secondary", fontSize: 20, flexShrink: 0 }} />
                        </Tooltip>
                      ) : null}
                    </Stack>
                  </FieldBlock>
              </Box>
              <Box
                sx={{
                  flex: "0 0 auto",
                  alignSelf: "flex-start",
                  minWidth: 0,
                  maxWidth: "100%",
                  ...(trackingManualMode ? { minWidth: { xs: 220, sm: 280 } } : {}),
                }}
              >
                  <FieldBlock label="Tracking ID">
                    {trackingManualMode ? (
                      <Stack spacing={0.5} sx={{ alignItems: "flex-start", minWidth: 0, maxWidth: "100%" }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            pb: 0.25,
                            minHeight: 36,
                            width: "fit-content",
                            maxWidth: "100%",
                            minWidth: 0,
                          }}
                        >
                          <Tooltip title="Load">
                            <Box component="span" sx={{ display: "inline-flex", flexShrink: 0 }}>
                              <IconButton
                                size="small"
                                aria-label="Load tracking number from API"
                                disabled={trackingLoadPending || !loadedOrderId}
                                onClick={() => {
                                  void handleLoadTrackingNumber();
                                }}
                                sx={{ color: "primary.main" }}
                              >
                                <SyncIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Tooltip>
                          <InputBase
                            placeholder="Enter/Load ID"
                            value={manualTrackingInput}
                            onChange={(e) => setManualTrackingInput(e.target.value)}
                            inputProps={{ "aria-label": "Manual tracking ID" }}
                            sx={{
                              typography: "body1",
                              letterSpacing: "0.15px",
                              flex: "0 1 auto",
                              minWidth: 0,
                              maxWidth: "100%",
                              "& input": {
                                minWidth: `${Math.max(14, manualTrackingInput.length, 12)}ch`,
                                width: "auto",
                                fieldSizing: "content",
                              },
                              "& input::placeholder": { opacity: 1, color: "action.disabled" },
                            }}
                          />
                        </Stack>
                        <Link
                          component="button"
                          type="button"
                          underline="hover"
                          onClick={() => {
                            setTrackingManualMode(false);
                            setManualTrackingInput("");
                          }}
                          sx={{
                            typography: "body1",
                            fontWeight: 400,
                            letterSpacing: "0.15px",
                            cursor: "pointer",
                            alignSelf: "flex-start",
                            border: "none",
                            background: "none",
                            padding: 0,
                            font: "inherit",
                            color: "primary.main",
                            textAlign: "left",
                          }}
                        >
                          Remove Manual ID
                        </Link>
                      </Stack>
                    ) : (
                      <Stack spacing={0.5} sx={{ alignItems: "flex-start", minWidth: 0, maxWidth: "100%" }}>
                        <DetailValue>None</DetailValue>
                        <ShipmentFieldActionArea visible={shipmentDetailsEditUnlocked}>
                          <ShipmentFieldActionLink onClick={() => setTrackingManualMode(true)}>
                            Add Manual ID
                          </ShipmentFieldActionLink>
                        </ShipmentFieldActionArea>
                      </Stack>
                    )}
                  </FieldBlock>
              </Box>
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Carrier Route">
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 28 }}>
                        {activeCarrierLogoSrc ? (
                          <Box
                            component="img"
                            src={activeCarrierLogoSrc}
                            alt={activeRoute.carrier}
                            sx={{ height: 28, width: "auto", maxWidth: 96, objectFit: "contain", display: "block" }}
                          />
                        ) : (
                          <DetailValue>{formatCarrierRouteDisplay(activeRoute)}</DetailValue>
                        )}
                      </Stack>
                      <ShipmentFieldActionArea visible={shipmentDetailsEditUnlocked}>
                        <ShipmentFieldActionLink onClick={() => setCarrierRouteDialogOpen(true)}>
                          Edit Shipping Route
                        </ShipmentFieldActionLink>
                      </ShipmentFieldActionArea>
                    </Stack>
                  </FieldBlock>
              </Box>
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Destination">
                    <Stack spacing={0.5}>
                      <DetailValue>{destinationDisplay}</DetailValue>
                      <ShipmentFieldActionArea visible={shipmentDetailsEditUnlocked}>
                        <ShipmentFieldActionLink onClick={() => setAddressDialogOpen(true)}>
                          Update Address
                        </ShipmentFieldActionLink>
                      </ShipmentFieldActionArea>
                    </Stack>
                  </FieldBlock>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: "divider",
                  alignSelf: "stretch",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Order Number">
                    <Stack spacing={0.5}>
                      <DetailValue>{displayedOrderNumberForDetails ?? ""}</DetailValue>
                      <ShipmentFieldActionArea visible={shipmentDetailsEditUnlocked}>
                        <ShipmentFieldActionLink onClick={() => setOrderHistoryDialogOpen(true)}>
                          View History
                        </ShipmentFieldActionLink>
                      </ShipmentFieldActionArea>
                    </Stack>
                  </FieldBlock>
              </Box>
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Order Date">
                    <DetailValue>12/12/2024</DetailValue>
                  </FieldBlock>
              </Box>
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Due Date">
                    <DetailValue>12/23/2024</DetailValue>
                  </FieldBlock>
              </Box>
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Site ID">
                    <DetailValue>27</DetailValue>
                  </FieldBlock>
              </Box>
              <Box sx={{ flex: "0 0 auto", alignSelf: "flex-start", minWidth: 0 }}>
                  <FieldBlock label="Event">
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        bgcolor: pink[50],
                        color: pink.A700,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1,
                        typography: "body1",
                        fontWeight: 500,
                        letterSpacing: "0.15px",
                      }}
                    >
                      51-20E
                    </Box>
                  </FieldBlock>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          alignItems="stretch"
          justifyContent="center"
          sx={{ width: "100%", maxWidth: 1600 }}
        >
          <Stack spacing={3} sx={{ flex: "1 1 0%", minWidth: 0, width: "100%" }}>
          <Paper
            elevation={1}
            sx={{
              minWidth: 0,
              width: "100%",
              p: 3,
              boxSizing: "border-box",
              borderRadius: 1,
              ...elevationSx,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              useFlexGap
              spacing={2}
              sx={{ mb: 0, width: "100%", minWidth: 0 }}
            >
              <Typography variant="h6" sx={{ color: "primary.dark", flexShrink: 0 }}>
                Items to Pack ({packItemCountUi})
              </Typography>
              {isSimilarOrdersView || isSplitOrdersView ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    flexShrink: 0,
                    minWidth: 0,
                    maxWidth: "100%",
                    justifyContent: { xs: "flex-end", sm: "flex-start" },
                    flex: { xs: "1 1 100%", sm: "0 0 auto" },
                  }}
                >
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      fontSize: 15,
                      letterSpacing: "0.15px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Shipment:
                  </Typography>
                  {isSimilarOrdersView ? (
                    <LinkedShipmentTabs
                      tabs={SIMILAR_ORDER_TABS.map((t) => ({
                        key: t.key,
                        shipmentId: t.shipmentId,
                        factoryLabel: t.factoryLabel,
                      }))}
                      value={similarShipmentTabIndex}
                      onChange={setSimilarOrdersTabIndex}
                      ariaLabel="Similar shipments"
                      idPrefix="similar-order-tab"
                    />
                  ) : (
                    <LinkedShipmentTabs
                      tabs={splitOrderTabsResolved.map((t) => ({
                        key: t.key,
                        shipmentId: t.shipmentId,
                        factoryLabel: t.factoryLabel,
                      }))}
                      value={splitShipmentTabIndex}
                      onChange={setSplitOrdersTabIndex}
                      ariaLabel="Split shipments"
                      idPrefix="split-order-tab"
                    />
                  )}
                </Stack>
              ) : null}
            </Stack>
            <Divider sx={{ my: 3 }} />

            {showPackLine0Ui ? (
              <ItemBlock
                showHoldAssignDefault={showItemContainerAssignRow}
                containerAssignByItemId={containerAssignByItemId}
                onContainerAssignSimulate={handleContainerAssignSimulate}
                onContainerAssignClear={handleContainerAssignClear}
                title={PACK_LINE_ITEM_META[0].title}
                image={IMG.item1}
                imageRadius={1}
                itemId={PACK_LINE_ITEM_META[0].id}
                itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[0].id] ?? 0}
                onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[0].id)}
                titleRowEnd={remoteFacilityItemReceivedControl(PACK_LINE_ITEM_META[0].id) ?? undefined}
                details={
                  <>
                    <SectionOverline>Details</SectionOverline>
                    <DetailRow label="Inscription #1:" value="Jane" />
                    <DetailRow label="Inscription #2:" value="Kelsey" />
                    <DetailRow label="Inscription #3:" value="Tiffany" />
                    <DetailRow label="Material:" value="18K Rose Gold Vermeil" />
                    <DetailRow label="Diamond:" value="Without Diamond" />
                    <DetailRow label="Size:" value={'18" - 22"'} />
                  </>
                }
                packaging={
                  <>
                    <SectionOverline>packaging type</SectionOverline>
                    <Stack direction="row" spacing={3}>
                      <Typography variant="body1" color="text.secondary" sx={{ width: 41 }}>
                        Box:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        Medium
                      </Typography>
                    </Stack>
                    <Box
                      component="img"
                      src={IMG.boxMedium}
                      alt=""
                      sx={{ width: 140, height: 140, borderRadius: 0.5, objectFit: "cover" }}
                    />
                  </>
                }
              />
            ) : null}

            {showPackLine1Ui ? (
              <Fragment>
                {showPackLine0Ui ? <Divider sx={{ my: 3 }} /> : null}
                <ItemBlock
                  showHoldAssignDefault={showItemContainerAssignRow}
                  containerAssignByItemId={containerAssignByItemId}
                  onContainerAssignSimulate={handleContainerAssignSimulate}
                  onContainerAssignClear={handleContainerAssignClear}
                  title={PACK_LINE_ITEM_META[1].title}
                  image={IMG.item2}
                  imageOverlay
                  itemId={PACK_LINE_ITEM_META[1].id}
                  itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[1].id] ?? 0}
                  onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[1].id)}
                  details={
                    <>
                      <SectionOverline>Details</SectionOverline>
                      <DetailRow label="Material:" value="18K Gold Vermeil" />
                      <DetailRow label="Diamond:" value="With Diamond" />
                      <DetailRow label="Inscription #1:" value="Stacy" />
                      <DetailRow label="Inscription #2:" value="John" />
                      <DetailRow label="Carat Weight:" value=".25 ct" />
                      <DetailRow label="Chain Length:" value={'18" - 22"'} />
                    </>
                  }
                  packaging={
                    <>
                      <SectionOverline>packaging type</SectionOverline>
                      <Stack direction="row" spacing={1.5}>
                        <Typography variant="body1" color="text.secondary" sx={{ width: 41 }}>
                          Box:
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          Small
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          width: 140,
                          height: 140,
                          borderRadius: 0.5,
                          overflow: "hidden",
                          position: "relative",
                          bgcolor: "#eeeff1",
                        }}
                      >
                        <Box
                          component="img"
                          src={IMG.boxSmall}
                          alt=""
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </>
                  }
                />
              </Fragment>
            ) : null}

            {showPackLine2Ui ? (
              <Fragment>
                {(showPackLine0Ui || showPackLine1Ui) ? <Divider sx={{ my: 3 }} /> : null}
                <ItemBlock
                  showHoldAssignDefault={showItemContainerAssignRow}
                  containerAssignByItemId={containerAssignByItemId}
                  onContainerAssignSimulate={handleContainerAssignSimulate}
                  onContainerAssignClear={handleContainerAssignClear}
                  title={PACK_LINE_ITEM_META[2].title}
                  image={IMG.item3}
                  imageOverlay
                  itemId={PACK_LINE_ITEM_META[2].id}
                  itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[2].id] ?? 0}
                  onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[2].id)}
                  details={
                    <>
                      <SectionOverline>Details</SectionOverline>
                      <DetailRow label="Name:" value="Stephanie" />
                      <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ width: "100%" }}>
                        <Typography variant="body1" color="text.secondary" sx={{ width: 120, flexShrink: 0 }}>
                          Gift Note:
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          color="text.primary"
                          sx={{ flex: "1 1 0", minWidth: 0, wordBreak: "break-word" }}
                        >
                          To my beloved wife, every piece of jewelry tells a story, and this one is a reminder of our
                          beautiful journey together. I love you more than words can express. Forever yours.
                        </Typography>
                      </Stack>
                    </>
                  }
                  packaging={null}
                />
              </Fragment>
            ) : null}

            {extraPackItemsUi.map((item, extraIdx) => (
              <Box key={item.id}>
                {(anyPrimaryPackLineVisibleUi || extraIdx > 0) ? <Divider sx={{ my: 3 }} /> : null}
                <ItemBlock
                  showHoldAssignDefault={showItemContainerAssignRow}
                  containerAssignByItemId={containerAssignByItemId}
                  onContainerAssignSimulate={handleContainerAssignSimulate}
                  onContainerAssignClear={handleContainerAssignClear}
                  title={item.title}
                  image={item.image}
                  itemId={item.id}
                  itemRemarkCount={remarkCountByItemId[item.id] ?? 0}
                  onItemRemarksClick={() => openItemRemarksDialog(item.id)}
                  details={
                    <>
                      <SectionOverline>Details</SectionOverline>
                      {item.id === "split-proto-product-4" ||
                      item.id === "similar-order-product-4" ||
                      item.id === "join-ext-1" ? (
                        <>
                          <DetailRow label="Material:" value="18K Gold Vermeil" />
                          <DetailRow label="Initial:" value="L" />
                          <DetailRow label="Birthstone:" value="Clear Crystal" />
                          <DetailRow label="Chain Length:" value={'18" - 22"'} />
                        </>
                      ) : (
                        <DetailRow label="Source:" value="Joined shipment" />
                      )}
                    </>
                  }
                  packaging={null}
                />
              </Box>
            ))}

            {visibleRemoteReceivedIdsOrderedUi.map((rid, remoteIdx) => {
              const showRemoteLeadDivider =
                anyPrimaryPackLineVisibleUi || extraPackItemsUi.length > 0 || remoteIdx > 0;
              if (rid === PACK_LINE_ITEM_META[0].id) {
                const remoteReceivedItemCheckbox = remoteFacilityItemReceivedControl(rid);
                return (
                  <Box key={`remote-received-${rid}`}>
                    {showRemoteLeadDivider ? <Divider sx={{ my: 3 }} /> : null}
                    <ItemBlock
                      showHoldAssignDefault={showItemContainerAssignRow}
                      remoteFacilityTitleRow={remoteReceivedItemCheckbox != null}
                      containerAssignByItemId={containerAssignByItemId}
                      onContainerAssignSimulate={handleContainerAssignSimulate}
                      onContainerAssignClear={handleContainerAssignClear}
                      title={PACK_LINE_ITEM_META[0].title}
                      image={IMG.item1}
                      imageRadius={1}
                      itemId={PACK_LINE_ITEM_META[0].id}
                      itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[0].id] ?? 0}
                      onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[0].id)}
                      titleRowEnd={remoteReceivedItemCheckbox ?? undefined}
                      details={
                        <>
                          <SectionOverline>Details</SectionOverline>
                          <DetailRow label="Inscription #1:" value="Jane" />
                          <DetailRow label="Inscription #2:" value="Kelsey" />
                          <DetailRow label="Inscription #3:" value="Tiffany" />
                          <DetailRow label="Material:" value="18K Rose Gold Vermeil" />
                          <DetailRow label="Diamond:" value="Without Diamond" />
                          <DetailRow label="Size:" value={'18" - 22"'} />
                        </>
                      }
                      packaging={
                        <>
                          <SectionOverline>packaging type</SectionOverline>
                          <Stack direction="row" spacing={3}>
                            <Typography variant="body1" color="text.secondary" sx={{ width: 41 }}>
                              Box:
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              Medium
                            </Typography>
                          </Stack>
                          <Box
                            component="img"
                            src={IMG.boxMedium}
                            alt=""
                            sx={{ width: 140, height: 140, borderRadius: 0.5, objectFit: "cover" }}
                          />
                        </>
                      }
                    />
                  </Box>
                );
              }
              if (rid === PACK_LINE_ITEM_META[1].id) {
                return (
                  <Box key={`remote-received-${rid}`}>
                    {showRemoteLeadDivider ? <Divider sx={{ my: 3 }} /> : null}
                    <ItemBlock
                      showHoldAssignDefault={showItemContainerAssignRow}
                      containerAssignByItemId={containerAssignByItemId}
                      onContainerAssignSimulate={handleContainerAssignSimulate}
                      onContainerAssignClear={handleContainerAssignClear}
                      title={PACK_LINE_ITEM_META[1].title}
                      image={IMG.item2}
                      imageOverlay
                      itemId={PACK_LINE_ITEM_META[1].id}
                      itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[1].id] ?? 0}
                      onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[1].id)}
                      details={
                        <>
                          <SectionOverline>Details</SectionOverline>
                          <DetailRow label="Material:" value="18K Gold Vermeil" />
                          <DetailRow label="Diamond:" value="With Diamond" />
                          <DetailRow label="Inscription #1:" value="Stacy" />
                          <DetailRow label="Inscription #2:" value="John" />
                          <DetailRow label="Carat Weight:" value=".25 ct" />
                          <DetailRow label="Chain Length:" value={'18" - 22"'} />
                        </>
                      }
                      packaging={
                        <>
                          <SectionOverline>packaging type</SectionOverline>
                          <Stack direction="row" spacing={1.5}>
                            <Typography variant="body1" color="text.secondary" sx={{ width: 41 }}>
                              Box:
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              Small
                            </Typography>
                          </Stack>
                          <Box
                            sx={{
                              width: 140,
                              height: 140,
                              borderRadius: 0.5,
                              overflow: "hidden",
                              position: "relative",
                              bgcolor: "#eeeff1",
                            }}
                          >
                            <Box
                              component="img"
                              src={IMG.boxSmall}
                              alt=""
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        </>
                      }
                    />
                  </Box>
                );
              }
              if (rid === PACK_LINE_ITEM_META[2].id) {
                return (
                  <Box key={`remote-received-${rid}`}>
                    {showRemoteLeadDivider ? <Divider sx={{ my: 3 }} /> : null}
                    <ItemBlock
                      showHoldAssignDefault={showItemContainerAssignRow}
                      containerAssignByItemId={containerAssignByItemId}
                      onContainerAssignSimulate={handleContainerAssignSimulate}
                      onContainerAssignClear={handleContainerAssignClear}
                      title={PACK_LINE_ITEM_META[2].title}
                      image={IMG.item3}
                      imageOverlay
                      itemId={PACK_LINE_ITEM_META[2].id}
                      itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[2].id] ?? 0}
                      onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[2].id)}
                      details={
                        <>
                          <SectionOverline>Details</SectionOverline>
                          <DetailRow label="Name:" value="Stephanie" />
                          <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ width: "100%" }}>
                            <Typography variant="body1" color="text.secondary" sx={{ width: 120, flexShrink: 0 }}>
                              Gift Note:
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={500}
                              color="text.primary"
                              sx={{ flex: "1 1 0", minWidth: 0, wordBreak: "break-word" }}
                            >
                              To my beloved wife, every piece of jewelry tells a story, and this one is a reminder of
                              our beautiful journey together. I love you more than words can express. Forever yours.
                            </Typography>
                          </Stack>
                        </>
                      }
                      packaging={null}
                    />
                  </Box>
                );
              }
              return null;
            })}

            {!isSortingStationView &&
            packingOrderUiStatus !== "cancelled" &&
            packingOrderUiStatus !== "onHold" &&
            !isLinkedOrderNonPrimaryTab ? (
              <>
                <Divider sx={{ my: 3 }} />
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-start"
                  sx={{ width: "100%", textAlign: "left", p: "8px", boxSizing: "border-box" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={itemsReviewed}
                        onChange={(_, checked) => setItemsReviewed(checked)}
                        disabled={packingOrderUiStatus !== "readyToPack"}
                        color="primary"
                        size="medium"
                        sx={{ py: 0.5, pl: 0, pr: 0.5 }}
                      />
                    }
                    label={
                      <Typography variant="h6" sx={{ color: "primary.dark", fontSize: 20, fontWeight: 500 }}>
                        I reviewed and packed {packItemCountUi} items
                      </Typography>
                    }
                    sx={{
                      m: 0,
                      mr: "auto",
                      alignItems: "center",
                      userSelect: "none",
                      gap: "8px",
                      "& .MuiFormControlLabel-label": { marginLeft: 0 },
                    }}
                  />
                </Stack>
              </>
            ) : null}
          </Paper>

            {showOtherFacilitiesSection ? (
              <Paper
                elevation={1}
                data-node-id="2052:23611;1744:42418"
                sx={{
                  minWidth: 0,
                  width: "100%",
                  p: 3,
                  boxSizing: "border-box",
                  borderRadius: 1,
                  ...elevationSx,
                }}
              >
                <Stack
                  spacing={2}
                  sx={{
                    height: "fit-content",
                    "& > .MuiButtonBase-root ~ .MuiCollapse-root": { mt: 0 },
                  }}
                >
                  <ButtonBase
                    focusRipple
                    onClick={() => setOtherFacilitiesSectionExpanded((open) => !open)}
                    aria-expanded={otherFacilitiesSectionExpanded}
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 2,
                      py: 0,
                      px: 0,
                      borderRadius: 1,
                      textAlign: "left",
                    }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        color: "primary.dark",
                        fontSize: 24,
                        transform: otherFacilitiesSectionExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: (theme) =>
                          theme.transitions.create("transform", { duration: theme.transitions.duration.shorter }),
                      }}
                    />
                    <Typography variant="h6" sx={{ color: "primary.dark", fontWeight: 500 }}>
                      Items in Other Facilities ({remoteFacilityIdsForUi.length})
                    </Typography>
                  </ButtonBase>
                  <Collapse in={otherFacilitiesSectionExpanded}>
                    <Stack spacing={3} sx={{ pt: "32px" }}>
                      {remoteFacilityIdsForUi.map((remoteLineId) => (
                        <Box
                          key={remoteLineId}
                          sx={{
                            position: "relative",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            px: 3,
                            py: 4,
                            boxSizing: "border-box",
                          }}
                        >
                          <OtherFacilityLocationChip
                            label={
                              PROTOTYPE_REMOTE_FACILITY_LOCATION_BY_ITEM_ID[remoteLineId] ?? "Other facility"
                            }
                          />
                          {remoteLineId === PACK_LINE_ITEM_META[0].id ? (
                            <ItemBlock
                              showHoldAssignDefault={false}
                              remoteFacilityTitleRow
                              containerAssignByItemId={containerAssignByItemId}
                              onContainerAssignSimulate={handleContainerAssignSimulate}
                              onContainerAssignClear={handleContainerAssignClear}
                              title={PACK_LINE_ITEM_META[0].title}
                              image={IMG.item1}
                              imageRadius={1}
                              itemId={PACK_LINE_ITEM_META[0].id}
                              itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[0].id] ?? 0}
                              onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[0].id)}
                              titleRowEnd={
                                remoteFacilityItemReceivedControl(PACK_LINE_ITEM_META[0].id) ?? undefined
                              }
                              details={
                                <>
                                  <SectionOverline>Details</SectionOverline>
                                  <DetailRow label="Inscription #1:" value="Jane" />
                                  <DetailRow label="Inscription #2:" value="Kelsey" />
                                  <DetailRow label="Inscription #3:" value="Tiffany" />
                                  <DetailRow label="Material:" value="18K Rose Gold Vermeil" />
                                  <DetailRow label="Diamond:" value="Without Diamond" />
                                  <DetailRow label="Size:" value={'18" - 22"'} />
                                </>
                              }
                              packaging={
                                <>
                                  <SectionOverline>packaging type</SectionOverline>
                                  <Stack direction="row" spacing={3}>
                                    <Typography variant="body1" color="text.secondary" sx={{ width: 41 }}>
                                      Box:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      Medium
                                    </Typography>
                                  </Stack>
                                  <Box
                                    component="img"
                                    src={IMG.boxMedium}
                                    alt=""
                                    sx={{ width: 140, height: 140, borderRadius: 0.5, objectFit: "cover" }}
                                  />
                                </>
                              }
                            />
                          ) : null}
                          {remoteLineId === PACK_LINE_ITEM_META[1].id ? (
                            <ItemBlock
                              showHoldAssignDefault={false}
                              containerAssignByItemId={containerAssignByItemId}
                              onContainerAssignSimulate={handleContainerAssignSimulate}
                              onContainerAssignClear={handleContainerAssignClear}
                              title={PACK_LINE_ITEM_META[1].title}
                              image={IMG.item2}
                              imageOverlay
                              itemId={PACK_LINE_ITEM_META[1].id}
                              itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[1].id] ?? 0}
                              onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[1].id)}
                              titleRowEnd={
                                remoteFacilityItemReceivedControl(PACK_LINE_ITEM_META[1].id) ?? undefined
                              }
                              details={
                                <>
                                  <SectionOverline>Details</SectionOverline>
                                  <DetailRow label="Material:" value="18K Gold Vermeil" />
                                  <DetailRow label="Diamond:" value="With Diamond" />
                                  <DetailRow label="Inscription #1:" value="Stacy" />
                                  <DetailRow label="Inscription #2:" value="John" />
                                  <DetailRow label="Carat Weight:" value=".25 ct" />
                                  <DetailRow label="Chain Length:" value={'18" - 22"'} />
                                </>
                              }
                              packaging={
                                <>
                                  <SectionOverline>packaging type</SectionOverline>
                                  <Stack direction="row" spacing={1.5}>
                                    <Typography variant="body1" color="text.secondary" sx={{ width: 41 }}>
                                      Box:
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                      Small
                                    </Typography>
                                  </Stack>
                                  <Box
                                    sx={{
                                      width: 140,
                                      height: 140,
                                      borderRadius: 0.5,
                                      overflow: "hidden",
                                      position: "relative",
                                      bgcolor: "#eeeff1",
                                    }}
                                  >
                                    <Box
                                      component="img"
                                      src={IMG.boxSmall}
                                      alt=""
                                      sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </Box>
                                </>
                              }
                            />
                          ) : null}
                          {remoteLineId === PACK_LINE_ITEM_META[2].id ? (
                            <ItemBlock
                              showHoldAssignDefault={false}
                              remoteFacilityTitleRow
                              containerAssignByItemId={containerAssignByItemId}
                              onContainerAssignSimulate={handleContainerAssignSimulate}
                              onContainerAssignClear={handleContainerAssignClear}
                              title={PACK_LINE_ITEM_META[2].title}
                              image={IMG.item3}
                              imageOverlay
                              itemId={PACK_LINE_ITEM_META[2].id}
                              itemRemarkCount={remarkCountByItemId[PACK_LINE_ITEM_META[2].id] ?? 0}
                              onItemRemarksClick={() => openItemRemarksDialog(PACK_LINE_ITEM_META[2].id)}
                              titleRowEnd={
                                remoteFacilityItemReceivedControl(PACK_LINE_ITEM_META[2].id) ?? undefined
                              }
                              details={
                                <>
                                  <SectionOverline>Details</SectionOverline>
                                  <DetailRow label="Name:" value="Stephanie" />
                                  <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ width: "100%" }}>
                                    <Typography variant="body1" color="text.secondary" sx={{ width: 120, flexShrink: 0 }}>
                                      Gift Note:
                                    </Typography>
                                    <Typography
                                      variant="body1"
                                      fontWeight={500}
                                      color="text.primary"
                                      sx={{ flex: "1 1 0", minWidth: 0, wordBreak: "break-word" }}
                                    >
                                      To my beloved wife, every piece of jewelry tells a story, and this one is a
                                      reminder of our beautiful journey together. I love you more than words can express.
                                      Forever yours.
                                    </Typography>
                                  </Stack>
                                </>
                              }
                              packaging={null}
                            />
                          ) : null}
                        </Box>
                      ))}
                    </Stack>
                  </Collapse>
                </Stack>
              </Paper>
            ) : null}
          </Stack>

          <Box
            sx={{
              display: "grid",
              alignContent: "start",
              rowGap: "24px",
              columnGap: "24px",
              width: "100%",
              maxWidth: { xs: "100%", lg: 495 },
              flexShrink: 0,
              minWidth: 0,
              alignSelf: { lg: "flex-start" },
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 1fr) minmax(0, 1fr)",
                lg: "minmax(0, 1fr)",
              },
              gridTemplateAreas: hidePackActionsUi
                ? {
                    xs: '"status" "remarks"',
                    md: '"remarks status" "remarks ."',
                    lg: '"status" "remarks"',
                  }
                : {
                    xs: '"status" "remarks" "pack"',
                    md: '"remarks status" "remarks pack"',
                    lg: '"status" "remarks" "pack"',
                  },
            }}
          >
            <Paper
              elevation={1}
              sx={{
                gridArea: "status",
                p: 3,
                borderRadius: 1,
                ...elevationSx,
                minWidth: 0,
                alignSelf: "start",
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" sx={{ color: "primary.dark" }}>
                    Status
                  </Typography>
                  <Chip
                    icon={
                      <StatusChipIcon
                        sx={{
                          color: `${packingStatusChip.color} !important`,
                          fontSize: packingStatusChip.iconSize,
                          width: packingStatusChip.iconSize,
                          height: packingStatusChip.iconSize,
                        }}
                      />
                    }
                    label={packingStatusChip.label}
                    onClick={
                      packingOrderUiStatus === "onHold"
                        ? (e) => setOnHoldStatusMenuAnchor(e.currentTarget)
                        : undefined
                    }
                    onDelete={
                      packingOrderUiStatus === "onHold"
                        ? (e) => setOnHoldStatusMenuAnchor(e.currentTarget as HTMLElement)
                        : undefined
                    }
                    deleteIcon={
                      packingOrderUiStatus === "onHold" ? (
                        <ExpandMoreIcon sx={{ color: `${packingStatusChip.color} !important` }} />
                      ) : undefined
                    }
                    sx={{
                      bgcolor: packingStatusChip.bgcolor,
                      color: packingStatusChip.color,
                      fontWeight: 500,
                      pl: "12px",
                      pr: "16px",
                      gap: "12px",
                      pt: "8px",
                      pb: "8px",
                      height: "fit-content",
                      "& .MuiChip-label": { pl: "1px", pr: "1px", fontSize: 16, letterSpacing: "0.15px" },
                      borderRadius: 999,
                      border: packingStatusChip.border ? "1px solid" : "none",
                      borderColor: packingStatusChip.borderColor,
                      "& .MuiChip-icon": {
                        ml: 0.5,
                        fontSize: packingStatusChip.iconSize,
                        width: packingStatusChip.iconSize,
                        height: packingStatusChip.iconSize,
                      },
                      "& .MuiChip-deleteIcon": {
                        mr: 0.5,
                        ml: 0.5,
                        fontSize: 20,
                      },
                      cursor: packingOrderUiStatus === "onHold" ? "pointer" : "default",
                      ...(packingOrderUiStatus === "onHold"
                        ? {
                            "&.MuiChip-clickable:hover": {
                              bgcolor: purple[100],
                            },
                            "&.MuiChip-clickable:focus": {
                              bgcolor: purple[100],
                            },
                          }
                        : {}),
                    }}
                  />
                  <Menu
                    anchorEl={onHoldStatusMenuAnchor}
                    open={onHoldStatusMenuOpen}
                    onClose={() => setOnHoldStatusMenuAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                      sx: {
                        mt: 0.5,
                        minWidth: 190,
                        borderRadius: 1,
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setPackingOrderUiStatus("readyToPack");
                        setOnHoldStatusMenuAnchor(null);
                        if (isPrototypeOnHoldOrderId(loadedOrderId)) {
                          const stayingRemote = remoteFacilityItemIds.filter((id) =>
                            PROTOTYPE_ON_HOLD_REMOTE_FACILITY_ITEM_IDS.includes(id),
                          );
                          setRemoteFacilityItemIds(stayingRemote);
                          const excludeFromMainPack = new Set(stayingRemote);
                          setPackItems((prev) => mergeMissingPackLineItems(prev, excludeFromMainPack));
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <ReadyToPackStatusIcon
                          sx={{
                            color: `${readyToPackStatusChip.color} !important`,
                            fontSize: readyToPackStatusChip.iconSize,
                            width: readyToPackStatusChip.iconSize,
                            height: readyToPackStatusChip.iconSize,
                          }}
                        />
                      </ListItemIcon>
                      Ready to Pack
                    </MenuItem>
                  </Menu>
                </Stack>
                {packingOrderUiStatus === "onHold" ? (
                  <Alert
                    data-node-id="2052:23611"
                    severity="info"
                    variant="standard"
                    icon={<InfoOutlinedIcon sx={{ fontSize: 22, color: "#4a148c" }} />}
                    sx={{
                      alignItems: "flex-start",
                      py: 0.75,
                      px: 2,
                      borderRadius: 1,
                      border: "none",
                      boxShadow: "none",
                      bgcolor: "#f3e5f5",
                      color: "#4a148c",
                      "& .MuiAlert-icon": {
                        color: "#4a148c",
                        alignSelf: "flex-start",
                        mr: 1.5,
                        py: 0.875,
                        opacity: 1,
                      },
                      "& .MuiAlert-message": {
                        width: "100%",
                        pt: 1,
                        pb: 1,
                        color: "#4a148c",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: 1.43,
                        letterSpacing: "0.15px",
                        color: "#4a148c",
                      }}
                    >
                      {ON_HOLD_AWAITING_ITEM_BODY}
                    </Typography>
                  </Alert>
                ) : null}
                {isSimilarOrdersView ? (
                    <Alert
                      severity="info"
                      variant="standard"
                      icon={<InfoOutlinedIcon />}
                      sx={{
                        alignItems: "center",
                        py: 0.75,
                        px: 2,
                        borderRadius: 1,
                        border: "none",
                        boxShadow: "none",
                        bgcolor: lightBlue[50],
                        color: lightBlue[900],
                        "& .MuiAlert-icon": {
                          color: lightBlue[900],
                          alignSelf: "center",
                          mr: 1.5,
                          py: 0.25,
                          opacity: 1,
                        },
                        "& .MuiAlert-message": {
                          width: "100%",
                          pt: 1,
                          pb: 1,
                          color: lightBlue[900],
                          display: "flex",
                          alignItems: "center",
                          minWidth: 0,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ width: "100%", minWidth: 0 }}
                      >
                        <AlertTitle
                          sx={{ mb: 0, mt: 0, flex: "1 1 auto", minWidth: 0, pr: 1, lineHeight: 1.43 }}
                        >
                          Similar order found.
                        </AlertTitle>
                        <Link
                          component="button"
                          type="button"
                          underline="hover"
                          onClick={() => setJoinShipmentDialogOpen(true)}
                          sx={{
                            color: "primary.dark",
                            fontSize: 16,
                            fontWeight: 400,
                            flexShrink: 0,
                          }}
                        >
                          Join Shipment
                        </Link>
                      </Stack>
                    </Alert>
                ) : null}
                {packingOrderUiStatus === "pending" && sentToFixReason ? (
                    <Alert
                      severity="warning"
                      variant="standard"
                      icon={<InfoOutlinedIcon />}
                      sx={{
                        alignItems: "flex-start",
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        border: "none",
                        boxShadow: "none",
                        bgcolor: orange[50],
                        color: "#663C00",
                        "& .MuiAlert-icon": { color: "warning.main" },
                        "& .MuiAlert-message": { width: "100%", pt: 0.125, color: "#663C00" },
                      }}
                    >
                      <AlertTitle
                        sx={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "#663C00",
                          mb: 0.5,
                          letterSpacing: "0.15px",
                        }}
                      >
                        Order status details
                      </AlertTitle>
                      <Typography
                        variant="body2"
                        sx={{
                          letterSpacing: "0.15px",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.5,
                          color: "#663C00",
                        }}
                      >
                        {sentToFixReason}
                      </Typography>
                    </Alert>
                ) : null}
                {packingOrderUiStatus === "cancelled" ? (
                    <Alert
                      severity="error"
                      variant="standard"
                      icon={<CancelOutlinedIcon />}
                      sx={{
                        alignItems: "flex-start",
                        py: 1.5,
                        px: 2,
                        borderRadius: 1,
                        border: "none",
                        boxShadow: "none",
                        bgcolor: red[50],
                        color: "#5F2120",
                        "& .MuiAlert-icon": { color: "error.main" },
                        "& .MuiAlert-message": { width: "100%", pt: 1, color: "#5F2120" },
                      }}
                    >
                      <AlertTitle
                        sx={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "#5F2120",
                          mb: 0.5,
                          letterSpacing: "0.15px",
                        }}
                      >
                        Order status details
                      </AlertTitle>
                      <Typography
                        variant="body2"
                        sx={{
                          letterSpacing: "0.15px",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.5,
                          color: "#5F2120",
                        }}
                      >
                        {PROTOTYPE_CANCELLED_STATUS_BODY}
                      </Typography>
                    </Alert>
                ) : null}
              </Stack>
            </Paper>

            <Paper
              elevation={1}
              sx={{
                gridArea: "remarks",
                p: 3,
                borderRadius: 1,
                ...elevationSx,
                position: "relative",
                minWidth: 0,
                alignSelf: "start",
                boxSizing: "border-box",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 2, width: "100%", minWidth: 0 }}
              >
                <Typography variant="h6" sx={{ color: "primary.dark", minWidth: 0 }}>
                  Remarks
                </Typography>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  sx={{ color: "primary.dark", fontSize: 16, fontWeight: 400, flexShrink: 0 }}
                  onClick={() => openCreateRemarkDialog(null)}
                >
                  Send Message
                </Link>
              </Stack>
              <Tabs
                value={remarksTab}
                onChange={(_, v: RemarksTabValue) => setRemarksTab(v)}
                sx={{
                  minHeight: 40,
                  mb: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  "& .MuiTab-root": { textTransform: "none", fontWeight: 500, minHeight: 40 },
                }}
              >
                <Tab label="All" value="all" />
                <Tab label="Packers" value="packing" />
                <Tab label="CSR" value="csr" />
              </Tabs>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  maxHeight: 220,
                  overflow: "auto",
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                {filteredRemarksMessages.map((m) => (
                  <MessageRow key={m.id} message={m} />
                ))}
              </Box>
            </Paper>

            {!hidePackActionsUi && (
              <Paper
                elevation={1}
                sx={{
                  gridArea: "pack",
                  p: 3,
                  borderRadius: 1,
                  ...elevationSx,
                  minWidth: 0,
                  alignSelf: "start",
                }}
              >
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={
                      !itemsReviewed ||
                      packingOrderUiStatus !== "readyToPack" ||
                      (trackingManualMode && manualTrackingInput.trim() === "")
                    }
                    onClick={() => {
                      if (
                        itemsReviewed &&
                        packingOrderUiStatus === "readyToPack" &&
                        (!trackingManualMode || manualTrackingInput.trim() !== "")
                      ) {
                        setPackingOrderUiStatus("packed");
                      }
                    }}
                    startIcon={
                      <ShoppingBagOutlinedIcon
                        sx={
                          trackingManualMode &&
                          itemsReviewed &&
                          packingOrderUiStatus === "readyToPack" &&
                          manualTrackingInput.trim() !== ""
                            ? { color: "#fff !important" }
                            : undefined
                        }
                      />
                    }
                    sx={{
                      minHeight: 56,
                      height: 56,
                      py: 0,
                      boxSizing: "border-box",
                      fontSize: 18,
                      fontWeight: 500,
                      letterSpacing: "0.46px",
                      textTransform: "uppercase",
                      ...(trackingManualMode &&
                        packingOrderUiStatus === "readyToPack" &&
                        manualTrackingInput.trim() !== "" && {
                          "&:not(.Mui-disabled)": {
                            bgcolor: "#ed6c02",
                            color: "#fff",
                            "&:hover": { bgcolor: "#e65100" },
                          },
                        }),
                    }}
                  >
                    {trackingManualMode
                      ? `manual pack ${packItemCountUi} items`
                      : `pack ${packItemCountUi} items`}
                  </Button>
                  {(!hungaryFactoryDemoActive || orderPacked) ? (
                  <Stack direction="row" spacing={1}>
                    {!orderPacked && !hungaryFactoryDemoActive ? (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<HandymanOutlinedIcon />}
                        onClick={() => setSendToFixDialogOpen(true)}
                        sx={{
                          minHeight: 56,
                          height: 56,
                          py: 0,
                          boxSizing: "border-box",
                          fontSize: 18,
                          fontWeight: 500,
                          letterSpacing: "0.46px",
                          textTransform: "uppercase",
                          borderColor: "primary.main",
                          color: "primary.main",
                        }}
                      >
                        send to fix
                      </Button>
                    ) : null}
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      id="more-actions-button"
                      aria-controls={moreActionsMenuAnchor ? "more-actions-menu" : undefined}
                      aria-expanded={moreActionsMenuAnchor ? "true" : "false"}
                      aria-haspopup="true"
                      endIcon={<ExpandMoreIcon />}
                      onClick={(e) => setMoreActionsMenuAnchor(e.currentTarget)}
                      sx={{
                        minHeight: 56,
                        height: 56,
                        py: 0,
                        boxSizing: "border-box",
                        fontSize: 18,
                        fontWeight: 500,
                        letterSpacing: "0.46px",
                        textTransform: "uppercase",
                        borderColor: "primary.main",
                        color: "primary.main",
                      }}
                    >
                      more actions
                    </Button>
                    <Menu
                      id="more-actions-menu"
                      anchorEl={moreActionsMenuAnchor}
                      open={Boolean(moreActionsMenuAnchor)}
                      onClose={() => setMoreActionsMenuAnchor(null)}
                      anchorOrigin={
                        orderPacked
                          ? { vertical: "top", horizontal: "right" }
                          : { vertical: "bottom", horizontal: "right" }
                      }
                      transformOrigin={
                        orderPacked
                          ? { vertical: "bottom", horizontal: "right" }
                          : { vertical: "top", horizontal: "right" }
                      }
                      slotProps={{
                        paper: {
                          elevation: 8,
                          sx: {
                            minWidth: 276,
                            ...(orderPacked ? { mb: 0.5 } : { mt: 0.5 }),
                            borderRadius: 1,
                            py: 1,
                            boxSizing: "border-box",
                          },
                        },
                      }}
                    >
                      {moreActionsMenuItems.map(({ id, label, Icon }) => (
                        <MenuItem
                          key={id}
                          onClick={() => {
                            setMoreActionsMenuAnchor(null);
                            if (id === "unpack-shipment") {
                              setPackingOrderUiStatus("readyToPack");
                              setItemsReviewed(false);
                            }
                            if (id === "join-shipment") setJoinShipmentDialogOpen(true);
                            if (id === "split-shipment") setSplitShipmentDialogOpen(true);
                          }}
                          sx={{
                            py: 0.75,
                            px: 2,
                            typography: "body1",
                            letterSpacing: "0.15px",
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Icon sx={{ fontSize: 20, color: "action.active" }} />
                          </ListItemIcon>
                          {label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Stack>
                  ) : null}
                </Stack>
              </Paper>
            )}
          </Box>
        </Stack>
      </Box>
      ) : notFoundQuery ? (
        <NoShipmentsFoundHero shippingId={notFoundQuery} />
      ) : (
        <EmptyStateHero />
      )}
      <CarrierShippingRouteDialog
        open={carrierRouteDialogOpen}
        onClose={() => setCarrierRouteDialogOpen(false)}
        activeRouteId={activeCarrierRouteId}
        onSave={(id) => setActiveCarrierRouteId(id)}
      />
      <UpdateAddressDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        savedForm={savedShipmentAddress}
        onSave={(form) => {
          setSavedShipmentAddress(form);
          setDestinationDisplay(formatDestinationSummary(form));
        }}
      />
      {loadedOrderId && (
        <OrderHistoryLogDialog
          open={orderHistoryDialogOpen}
          onClose={() => setOrderHistoryDialogOpen(false)}
          orderNumber={displayedOrderNumberForDetails ?? loadedOrderId ?? ""}
        />
      )}
      {loadedOrderId && (
        <ShipmentPendingDialog
          open={showShipmentPendingDialog}
          reasonForFix={sentToFixReason ?? ""}
          onOk={handleShipmentPendingOk}
          onCancel={handleShipmentPendingCancel}
        />
      )}
      {loadedOrderId && (
        <SendToFixDialog
          open={sendToFixDialogOpen}
          onClose={() => setSendToFixDialogOpen(false)}
          onSubmit={(reason) => {
            setPackingOrderUiStatus("pending");
            setSentToFixReason(reason);
            setMoreActionsMenuAnchor(null);
          }}
        />
      )}
      {loadedOrderId && (
        <JoinShipmentDialog
          open={joinShipmentDialogOpen}
          onClose={() => setJoinShipmentDialogOpen(false)}
          currentShipmentId={joinDialogShipmentId}
          prefillSourceShipmentId={joinPrefillSourceShipmentId}
          onConfirm={(nextCurrentItems) => {
            setPackItems(nextCurrentItems.map((x) => ({ ...x, movable: false })));
            setItemsReviewed(false);
          }}
        />
      )}
      {loadedOrderId && (
        <SplitShipmentDialog
          open={splitShipmentDialogOpen}
          onClose={() => setSplitShipmentDialogOpen(false)}
          currentShipmentId={joinDialogShipmentId}
          onConfirm={(nextCurrentItems, nextNewItems, newShipmentId, sourceShipmentId) => {
            skipPackItemsResetAfterSplitConfirmRef.current = true;
            const originalRows = nextCurrentItems.map((x) => ({ ...x, movable: false }));
            const newRows = nextNewItems.map((x) => ({ ...x, movable: false }));
            setPackItems(originalRows);
            setSplitTabInventories({ original: originalRows, newShipment: newRows });
            setItemsReviewed(false);
            setSplitLinkedPair({
              original: prototypeSplitOriginalShipmentIdForTabs(sourceShipmentId),
              split: normalizeSplitNewShipmentIdForTab(newShipmentId),
            });
            setSplitOrdersTabIndex(0);
            setLoadedOrderId(PROTOTYPE_SPLIT_ORDER_ID);
          }}
        />
      )}
      {loadedOrderId && itemRemarksItemId ? (
        <ItemRemarksDialog
          open
          onClose={() => setItemRemarksItemId(null)}
          itemId={itemRemarksItemId}
          messages={shipmentMessages}
        />
      ) : null}
      {loadedOrderId && (
        <CreateRemarkDialog
          open={createRemarkOpen}
          onClose={() => {
            setCreateRemarkOpen(false);
            setCreateRemarkDefaultItemId(null);
          }}
          defaultItemId={createRemarkDefaultItemId}
          onSend={handleCreateRemarkSend}
        />
      )}
    </Box>
  );
}

/** Figma 1664:18638 default + 2345:27263 assigned (Location3): scan / container + location + clear. */
function ItemHoldAssignContainer({
  assigned,
  onSimulateScan,
  onClear,
}: {
  assigned: PrototypeContainerAssignDetail | null;
  onSimulateScan: () => void;
  onClear: () => void;
}) {
  const labelColumn = (
    <Box
      sx={{
        bgcolor: "grey.200",
        px: 2,
        py: 0.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        alignSelf: "stretch",
      }}
    >
      <Typography
        sx={{
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1.5,
          letterSpacing: "0.15px",
          color: "grey.900",
          whiteSpace: "nowrap",
        }}
      >
        Container
      </Typography>
    </Box>
  );

  if (assigned != null) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          width: "fit-content",
          maxWidth: "100%",
          minHeight: 40,
          borderRadius: "4px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        {labelColumn}
        <Box
          sx={{
            flex: "0 0 auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            pl: 2,
            pr: 1,
            py: 0.5,
            boxSizing: "border-box",
          }}
        >
          <Tooltip title="Assigned to this container. Use ✕ to release the item." enterDelay={400}>
            <ButtonBase
              focusRipple
              aria-label={`Container ${assigned.code}. ${assigned.location}.`}
              onClick={(e) => {
                e.currentTarget.focus();
              }}
              sx={{
                flex: "0 1 auto",
                minWidth: 0,
                maxWidth: "100%",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-start",
                px: 0,
                py: 0.5,
                gap: 0.5,
                borderRadius: 0,
                textAlign: "left",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, maxWidth: "100%" }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 12, color: "text.primary", flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    letterSpacing: "0.15px",
                    color: "text.primary",
                    fontWeight: 400,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {assigned.code}
                </Typography>
              </Stack>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: 18, alignSelf: "center", borderColor: "divider", mx: 0.25 }}
              />
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, maxWidth: "100%" }}>
                <PushPinOutlinedIcon sx={{ fontSize: 12, color: "text.primary", flexShrink: 0 }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    lineHeight: 1.5,
                    letterSpacing: "0.15px",
                    color: "text.primary",
                    fontWeight: 500,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                  dir="auto"
                >
                  {assigned.location}
                </Typography>
              </Stack>
            </ButtonBase>
          </Tooltip>
          <IconButton
            size="small"
            aria-label="Release item from container"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            sx={{ flexShrink: 0, p: 0.5, ml: 0.25 }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onSimulateScan}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSimulateScan();
        }
      }}
      aria-label="Container assignment. Click to simulate scan."
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        width: "fit-content",
        maxWidth: "100%",
        minHeight: 40,
        borderRadius: "4px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        overflow: "hidden",
        textAlign: "left",
        cursor: "pointer",
        "&:focus-visible": { outline: (theme) => `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      }}
    >
      {labelColumn}
      <Box
        sx={{
          flex: "0 0 auto",
          px: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignSelf: "stretch",
          boxSizing: "border-box",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            py: 0.75,
            boxSizing: "border-box",
          }}
        >
          <DocumentScannerOutlinedIcon sx={{ fontSize: 20, color: "text.disabled", flexShrink: 0 }} />
          <Typography
            component="span"
            sx={{
              fontSize: 14,
              lineHeight: "24px",
              letterSpacing: "0.15px",
              color: "text.disabled",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Scan to Assign
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

function ItemBlock({
  title,
  image,
  imageRadius,
  imageOverlay,
  details,
  packaging,
  itemId,
  itemRemarkCount = 0,
  onItemRemarksClick,
  titleRowEnd,
  showHoldAssignDefault = false,
  remoteFacilityTitleRow = false,
  containerAssignByItemId = {},
  onContainerAssignSimulate = () => {},
  onContainerAssignClear = () => {},
}: {
  title: string;
  image: string;
  imageRadius?: number;
  imageOverlay?: boolean;
  details: ReactNode;
  packaging: ReactNode | null;
  itemId?: string;
  itemRemarkCount?: number;
  onItemRemarksClick?: () => void;
  /** e.g. “Item received” control (Figma 2052:23611). */
  titleRowEnd?: ReactNode;
  /** Figma 1664:18640 — show hold / container assign control (on-hold shipment). */
  showHoldAssignDefault?: boolean;
  /** Other-facilities row: no container assign; remarks after title; `titleRowEnd` (e.g. Item Received) aligned to the row end. */
  remoteFacilityTitleRow?: boolean;
  /** Prototype scan → container row (Figma 2345:27263), keyed by `itemId`. */
  containerAssignByItemId?: Record<string, PrototypeContainerAssignDetail>;
  onContainerAssignSimulate?: (itemId: string) => void;
  onContainerAssignClear?: (itemId: string) => void;
}) {
  const canOpenRemarks = itemRemarkCount > 0;
  const premiumGiftKitItemId = PACK_LINE_ITEM_META[2].id;
  const showItemRemarksControl =
    itemId != null &&
    onItemRemarksClick != null &&
    (itemRemarkCount > 0 || itemId !== premiumGiftKitItemId);

  /** Gift packaging lines (e.g. Premium Gift Kit) are never assigned to containers. */
  const shouldShowHoldAssign =
    Boolean(showHoldAssignDefault) && itemId !== premiumGiftKitItemId && !remoteFacilityTitleRow;

  const titleRowAlignCenter =
    shouldShowHoldAssign || remoteFacilityTitleRow || (Boolean(showHoldAssignDefault) && itemId === premiumGiftKitItemId);

  const remarksControl =
    showItemRemarksControl ? (
      <Tooltip title={`Item remarks (${itemRemarkCount})`}>
        <Box component="span" sx={{ flexShrink: 0, alignSelf: "flex-start" }}>
          <IconButton
            aria-label={`Item remarks (${itemRemarkCount})`}
            disabled={!canOpenRemarks}
            onClick={(e) => {
              e.stopPropagation();
              if (!canOpenRemarks) return;
              onItemRemarksClick();
            }}
            size="small"
            sx={{
              flexShrink: 0,
              alignSelf: "flex-start",
              mt: -0.25,
              bgcolor: "background.paper",
              boxShadow: "none",
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            <Badge
              color="primary"
              variant="dot"
              invisible={itemRemarkCount === 0}
              sx={{
                "& .MuiBadge-badge": {
                  minWidth: 6,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  padding: 0,
                  fontSize: 0,
                  lineHeight: 0,
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(1, 87, 155, 1)",
                  boxShadow: (theme) => `0 0 0 1px ${theme.palette.background.paper}`,
                },
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>
    ) : null;

  return (
    <Stack spacing={2} sx={{ width: "100%", alignSelf: "stretch" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: titleRowAlignCenter ? "center" : "flex-start",
          width: "100%",
          gap: 1,
          rowGap: 1,
        }}
      >
        <Box
          sx={{
            flex: "0 1 auto",
            minWidth: 0,
            maxWidth: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: titleRowAlignCenter ? "center" : "flex-start",
            gap: 1,
            columnGap: 1,
            rowGap: 0.5,
            pr: shouldShowHoldAssign || remoteFacilityTitleRow ? 0 : 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: titleRowAlignCenter ? "center" : "flex-start",
              columnGap: "16px",
              rowGap: 0.5,
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                flex: "0 1 auto",
                minWidth: 0,
                maxWidth: "100%",
                width: "fit-content",
                display: "block",
                wordBreak: "break-word",
              }}
            >
              {title}
            </Typography>
            {remarksControl}
          </Box>
          {!remoteFacilityTitleRow && shouldShowHoldAssign && titleRowEnd != null ? (
            <Box sx={{ flexShrink: 0 }}>{titleRowEnd}</Box>
          ) : !remoteFacilityTitleRow &&
            !shouldShowHoldAssign &&
            !(showHoldAssignDefault && itemId === premiumGiftKitItemId) &&
            titleRowEnd != null ? (
            <Box sx={{ flexShrink: 0 }}>{titleRowEnd}</Box>
          ) : null}
        </Box>
        {remoteFacilityTitleRow && titleRowEnd != null ? (
          <Box
            sx={{
              flexShrink: 0,
              ml: { xs: 0, sm: "auto" },
              alignSelf: "center",
            }}
          >
            {titleRowEnd}
          </Box>
        ) : null}
        {shouldShowHoldAssign ? (
          <Box
            sx={{
              flexShrink: 0,
              ml: { xs: 0, sm: "auto" },
              width: "fit-content",
              maxWidth: "100%",
              alignSelf: "center",
            }}
          >
            {itemId != null ? (
              <ItemHoldAssignContainer
                assigned={containerAssignByItemId[itemId] ?? null}
                onSimulateScan={() => onContainerAssignSimulate(itemId)}
                onClear={() => onContainerAssignClear(itemId)}
              />
            ) : null}
          </Box>
        ) : null}
      </Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 3, md: 4 }}
        alignItems="flex-start"
        sx={{ width: "100%" }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: 200 },
            maxWidth: 200,
            aspectRatio: "1",
            height: { xs: "auto", sm: 200 },
            flexShrink: 0,
            borderRadius: imageRadius ?? 1.5,
            overflow: "hidden",
            position: "relative",
            alignSelf: { xs: "center", md: "flex-start" },
          }}
        >
          <Box
            component="img"
            src={image}
            alt=""
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              ...(imageOverlay && {
                filter: "brightness(0.97)",
              }),
            }}
          />
          {imageOverlay && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "#f8f8f8",
                mixBlendMode: "multiply",
                pointerEvents: "none",
              }}
            />
          )}
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          flex={1}
          alignItems="flex-start"
          sx={{
            width: { xs: "100%", md: "auto" },
            minWidth: 0,
            gap: 0,
          }}
        >
          <Stack
            spacing={0.5}
            sx={{
              flex: packaging ? { md: "2 1 0%" } : "1 1 auto",
              minWidth: 0,
              width: { xs: "100%", md: "auto" },
              boxSizing: "border-box",
              pr: { md: packaging ? 3 : 0 },
              borderRight: { md: packaging ? "1px solid" : "none" },
              borderColor: { md: "divider" },
              pb: packaging ? { xs: 2, md: 0 } : 0,
              borderBottom: packaging ? { xs: "1px solid", md: "none" } : "none",
            }}
          >
            {details}
          </Stack>
          {packaging && (
            <Stack
              spacing={0.5}
              sx={{
                flex: { md: "1 1 0%" },
                minWidth: { md: 160 },
                maxWidth: { md: 280 },
                width: { xs: "100%", md: "auto" },
                boxSizing: "border-box",
                pl: { md: 3 },
                pt: { xs: 0, md: 0 },
              }}
            >
              {packaging}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

function MessageRow({ message }: { message: ShipmentMessage }) {
  const time = formatRemarkRowDisplayTime(message.at);
  const productSecondaryLine =
    message.itemLabel === REMARK_ALL_PRODUCTS_LABEL ? null : `Item: ${remarkProductDisplayLine(message.itemLabel)}`;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 1, width: "100%", minWidth: 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ minWidth: 0, gap: 0.75 }}>
          <Typography variant="body2" color="text.primary" fontWeight={600} sx={{ minWidth: 0 }}>
            {message.author}
          </Typography>
          {message.senderRole === "csr" ? (
            <Chip
              size="small"
              label="CSR"
              variant="filled"
              sx={{
                height: 22,
                bgcolor: purple[50],
                color: purple[900],
                fontWeight: 500,
                border: "none",
                "& .MuiChip-label": { px: 1, fontSize: 12 },
              }}
            />
          ) : null}
          {message.senderRole === "packer" ? (
            <Chip
              size="small"
              label="Packers"
              variant="filled"
              sx={{
                height: 22,
                bgcolor: "#e3f2fd",
                color: "#1565c0",
                fontWeight: 500,
                border: "none",
                "& .MuiChip-label": { px: 1, fontSize: 12 },
              }}
            />
          ) : null}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, textAlign: "right", lineHeight: 1.3 }}>
          {time}
        </Typography>
      </Stack>
      {productSecondaryLine ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            fontSize: 13,
            lineHeight: 1.43,
            letterSpacing: "0.15px",
          }}
        >
          {productSecondaryLine}
        </Typography>
      ) : null}
      <Typography variant="body2" color="text.primary" sx={{ width: "100%", wordBreak: "break-word", overflowWrap: "anywhere" }}>
        {message.body}
      </Typography>
    </Box>
  );
}
