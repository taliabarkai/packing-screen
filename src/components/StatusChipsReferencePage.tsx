import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { Box, Chip, Container, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useTheme, type Theme } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import { useMemo } from "react";
import {
  getPackingStatusChipConfig,
  STATUS_CHIP_PALETTE,
  type PackingOrderUiStatus,
} from "../packing/statusChipConfig";

type StatusChipDisplayConfig = {
  label: string;
  Icon: SvgIconComponent;
  iconSize: number;
  bgcolor: string;
  color: string;
  colorHex: string;
  border: boolean;
  borderColor: string;
};

type StatusChipReferenceRow = {
  key: string;
  statusLabel: string;
  config: StatusChipDisplayConfig;
};

/** Reference-only chips (not used on the packing screen). */
const REFERENCE_ONLY_BY_KEY = {
  draft: {
    key: "draft",
    statusLabel: "Draft",
    config: {
      label: "Draft",
      Icon: DescriptionOutlinedIcon,
      iconSize: 18,
      ...STATUS_CHIP_PALETTE.draft,
      border: false,
      borderColor: "transparent",
    },
  },
  shipped: {
    key: "shipped",
    statusLabel: "Shipped",
    config: {
      label: "Shipped",
      Icon: LocalShippingOutlinedIcon,
      iconSize: 18,
      ...STATUS_CHIP_PALETTE.shipped,
      border: false,
      borderColor: "transparent",
    },
  },
} as const satisfies Record<string, StatusChipReferenceRow>;

type ReferencePackingStatus = Exclude<PackingOrderUiStatus, "packApiFailed">;

const PACKING_REFERENCE_LABELS: Record<ReferencePackingStatus, string> = {
  pending: "Pending",
  onHold: "On Hold",
  readyToPack: "Ready to Pack",
  packed: "Packed",
  cancelled: "Cancelled",
};

/** Display order for the status chips reference table. */
const REFERENCE_CHIP_ORDER: Array<
  | { kind: "reference"; key: keyof typeof REFERENCE_ONLY_BY_KEY }
  | { kind: "packing"; status: ReferencePackingStatus }
> = [
  { kind: "reference", key: "draft" },
  { kind: "packing", status: "pending" },
  { kind: "packing", status: "onHold" },
  { kind: "packing", status: "readyToPack" },
  { kind: "packing", status: "packed" },
  { kind: "reference", key: "shipped" },
  { kind: "packing", status: "cancelled" },
];

type StatusChipColorConfig = Pick<
  StatusChipDisplayConfig,
  "label" | "bgcolor" | "color" | "colorHex" | "border" | "borderColor"
>;

function statusChipRowSx(config: StatusChipDisplayConfig) {
  return {
    bgcolor: config.bgcolor,
    color: config.color,
    fontWeight: 500,
    pl: "12px",
    pr: "16px",
    gap: "12px",
    pt: "8px",
    pb: "8px",
    height: "fit-content",
    "& .MuiChip-label": { pl: "1px", pr: "1px", fontSize: 16, letterSpacing: "0.15px" },
    borderRadius: 999,
    border: config.border ? "1px solid" : "none",
    borderColor: config.borderColor,
    "& .MuiChip-icon": {
      ml: 0.5,
      fontSize: config.iconSize,
      width: config.iconSize,
      height: config.iconSize,
    },
    "& .MuiChip-deleteIcon": {
      mr: 0.5,
      ml: 0.5,
      fontSize: 20,
    },
  } as const;
}

/** Compact chips for other platforms — no icon, 12px label, same palette. */
function statusChipCompactRowSx(config: StatusChipColorConfig) {
  return {
    bgcolor: config.bgcolor,
    color: config.color,
    fontWeight: 500,
    height: "auto",
    minHeight: 0,
    px: "8px",
    py: "2px",
    "& .MuiChip-label": {
      px: 0,
      py: 0,
      fontSize: 12,
      lineHeight: 1.5,
      letterSpacing: "0.15px",
    },
    borderRadius: 999,
    border: config.border ? "1px solid" : "none",
    borderColor: config.borderColor,
  } as const;
}

function buildReferenceRows(theme: Theme): StatusChipReferenceRow[] {
  return REFERENCE_CHIP_ORDER.map((entry) => {
    if (entry.kind === "reference") {
      return REFERENCE_ONLY_BY_KEY[entry.key];
    }
    return {
      key: entry.status,
      statusLabel: PACKING_REFERENCE_LABELS[entry.status],
      config: {
        ...getPackingStatusChipConfig(entry.status, theme),
        colorHex: STATUS_CHIP_PALETTE[entry.status].colorHex,
      },
    };
  });
}

function StatusChipCompactTableRow({
  statusLabel,
  config,
}: {
  statusLabel: string;
  config: StatusChipColorConfig;
}) {
  const monospace = { fontFamily: "ui-monospace, monospace", fontSize: 13 };

  return (
    <TableRow>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Typography variant="body2" fontWeight={600}>
          {statusLabel}
        </Typography>
      </TableCell>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Chip label={config.label} sx={statusChipCompactRowSx(config)} />
      </TableCell>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Typography variant="body2" sx={monospace}>
          {config.bgcolor}
        </Typography>
      </TableCell>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Typography variant="body2" sx={monospace}>
          {config.colorHex}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

function StatusChipTableRow({ statusLabel, config }: { statusLabel: string; config: StatusChipDisplayConfig }) {
  const Icon = config.Icon;
  const monospace = { fontFamily: "ui-monospace, monospace", fontSize: 13 };

  return (
    <TableRow>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Typography variant="body2" fontWeight={600}>
          {statusLabel}
        </Typography>
      </TableCell>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Chip
          icon={
            <Icon
              sx={{
                color: `${config.color} !important`,
                fontSize: config.iconSize,
                width: config.iconSize,
                height: config.iconSize,
              }}
            />
          }
          label={config.label}
          sx={statusChipRowSx(config)}
        />
      </TableCell>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Typography variant="body2" sx={monospace}>
          {config.bgcolor}
        </Typography>
      </TableCell>
      <TableCell sx={{ verticalAlign: "middle" }}>
        <Typography variant="body2" sx={monospace}>
          {config.colorHex}
        </Typography>
        {config.border ? (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Border:{" "}
            <Typography component="span" variant="caption" sx={monospace}>
              {config.borderColor}
            </Typography>
          </Typography>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

export function StatusChipsReferencePage() {
  const theme = useTheme();

  const referenceRows = useMemo(() => buildReferenceRows(theme), [theme]);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h5" component="h1" sx={{ color: "primary.dark", fontWeight: 600 }}>
              Status chips — design reference
            </Typography>
            <Link href="#/" underline="hover" sx={{ alignSelf: "flex-start", fontSize: 14 }}>
              ← Back to Packing screen
            </Link>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.dark" }}>
              With icon
            </Typography>
            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 1 }}>
              <Table size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: "22%" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: "28%" }}>Preview</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: "25%" }}>Background</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: "25%" }}>Font</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referenceRows.map((row) => (
                    <StatusChipTableRow key={row.key} statusLabel={row.statusLabel} config={row.config} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.dark" }}>
              Without icon (other platforms)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              12px label · compact padding · same colors as above
            </Typography>
            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 1 }}>
              <Table size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: "22%" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: "28%" }}>Preview</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: "25%" }}>Background</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: "25%" }}>Font</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referenceRows.map((row) => (
                    <StatusChipCompactTableRow
                      key={`compact-${row.key}`}
                      statusLabel={row.statusLabel}
                      config={row.config}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
