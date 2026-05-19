import type { Theme } from "@mui/material/styles";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { amber, blue, green, orange, purple, red } from "@mui/material/colors";

type StatusChipPaletteEntry = {
  bgcolor: string;
  color: string;
  /** Hex for design-reference tables (Font column). */
  colorHex: string;
};

function chipColors({ bgcolor, color }: Pick<StatusChipPaletteEntry, "bgcolor" | "color">) {
  return { bgcolor, color };
}

/** Unified status chip palette (50 background / 600 foreground). */
export const STATUS_CHIP_PALETTE = {
  draft: {
    bgcolor: "#f5f5f5",
    color: "oklch(27.8% 0.033 256.848)",
    colorHex: "#1f2937",
  },
  pending: {
    bgcolor: amber[50],
    color: orange[800],
    colorHex: orange[800],
  },
  onHold: {
    bgcolor: purple[50],
    color: "#4A148C",
    colorHex: "#4A148C",
  },
  readyToPack: {
    bgcolor: green[50],
    color: "oklch(44.8% 0.119 151.328)",
    colorHex: "#166534",
  },
  packed: {
    bgcolor: green["A100"],
    color: green[900],
    colorHex: green[900],
  },
  shipped: {
    bgcolor: blue[50],
    color: blue[900],
    colorHex: blue[900],
  },
  cancelled: {
    bgcolor: red[50],
    color: red[600],
    colorHex: red[600],
  },
} as const satisfies Record<string, StatusChipPaletteEntry>;

/** Packing screen shipment status (Figma Statuses / node 1159:2644 variants). */
export type PackingOrderUiStatus =
  | "readyToPack"
  | "packed"
  | "cancelled"
  | "pending"
  | "onHold"
  /** After Pack API failure (Figma fallback flow / 1762:35805) — chip matches Pending styling. */
  | "packApiFailed";

export const PACKING_ORDER_UI_STATUSES: PackingOrderUiStatus[] = [
  "readyToPack",
  "packed",
  "cancelled",
  "pending",
  "onHold",
  "packApiFailed",
];

export function isPackingStatusBlockingActions(status: PackingOrderUiStatus): boolean {
  return status === "pending" || status === "cancelled" || status === "onHold";
}

export function getPackingStatusChipConfig(status: PackingOrderUiStatus, _theme?: Theme) {
  switch (status) {
    case "readyToPack":
      return {
        label: "Ready to Pack",
        Icon: LocalMallOutlinedIcon,
        iconSize: 16,
        ...chipColors(STATUS_CHIP_PALETTE.readyToPack),
        border: false,
        borderColor: "transparent",
      } as const;
    case "packed":
      return {
        label: "Packed",
        Icon: TaskAltIcon,
        iconSize: 18,
        ...chipColors(STATUS_CHIP_PALETTE.packed),
        border: false,
        borderColor: "transparent",
      } as const;
    case "cancelled":
      return {
        label: "Cancelled",
        Icon: CancelOutlinedIcon,
        iconSize: 18,
        ...chipColors(STATUS_CHIP_PALETTE.cancelled),
        border: false,
        borderColor: "transparent",
      } as const;
    case "pending":
      return {
        label: "Pending",
        Icon: PendingOutlinedIcon,
        iconSize: 20,
        ...chipColors(STATUS_CHIP_PALETTE.pending),
        border: false,
        borderColor: "transparent",
      } as const;
    case "onHold":
      return {
        label: "On Hold",
        Icon: PauseCircleOutlineIcon,
        iconSize: 18,
        ...chipColors(STATUS_CHIP_PALETTE.onHold),
        border: false,
        borderColor: "transparent",
      } as const;
    case "packApiFailed":
      return {
        label: "Pending",
        Icon: PendingOutlinedIcon,
        iconSize: 20,
        ...chipColors(STATUS_CHIP_PALETTE.pending),
        border: false,
        borderColor: "transparent",
      } as const;
  }
}
