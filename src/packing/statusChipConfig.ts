import type { Theme } from "@mui/material/styles";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { orange } from "@mui/material/colors";

/** Packing screen shipment status (Figma Statuses / node 1159:2644 variants). */
export type PackingOrderUiStatus = "readyToPack" | "packed" | "cancelled" | "pending" | "onHold";

export const PACKING_ORDER_UI_STATUSES: PackingOrderUiStatus[] = [
  "readyToPack",
  "packed",
  "cancelled",
  "pending",
  "onHold",
];

export function isPackingStatusBlockingActions(status: PackingOrderUiStatus): boolean {
  return status === "pending" || status === "cancelled" || status === "onHold";
}

export function getPackingStatusChipConfig(status: PackingOrderUiStatus, theme: Theme) {
  const w = theme.palette.warning.main;
  switch (status) {
    case "readyToPack":
      return {
        label: "Ready to Pack",
        Icon: LocalMallOutlinedIcon,
        iconSize: 16,
        bgcolor: "#a7ffeb",
        color: "#004d40",
        border: false,
        borderColor: "transparent",
      } as const;
    case "packed":
      return {
        label: "Packed",
        Icon: TaskAltIcon,
        iconSize: 18,
        bgcolor: "#e8f5e9",
        color: "#1b5e20",
        border: false,
        borderColor: "transparent",
      } as const;
    case "cancelled":
      return {
        label: "Cancelled",
        Icon: CancelOutlinedIcon,
        iconSize: 18,
        bgcolor: "#ffebee",
        color: "#b71c1c",
        border: false,
        borderColor: "transparent",
      } as const;
    case "pending":
      return {
        label: "Pending",
        Icon: PendingOutlinedIcon,
        iconSize: 20,
        bgcolor: orange[50],
        color: w,
        border: false,
        borderColor: "transparent",
      } as const;
    case "onHold":
      return {
        label: "On Hold",
        Icon: PauseCircleOutlineIcon,
        iconSize: 18,
        bgcolor: "#f3e5f5",
        color: "#4a148c",
        border: false,
        borderColor: "transparent",
      } as const;
  }
}
