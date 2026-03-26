import { Box, Chip, Container, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  getPackingStatusChipConfig,
  PACKING_ORDER_UI_STATUSES,
  type PackingOrderUiStatus,
} from "../packing/statusChipConfig";

function statusChipRowSx(config: ReturnType<typeof getPackingStatusChipConfig>) {
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

const STATUS_LABELS: Record<PackingOrderUiStatus, string> = {
  readyToPack: "Ready to pack",
  packed: "Packed",
  cancelled: "Cancelled",
  pending: "Pending (sent to fix)",
  onHold: "On hold",
};

export function StatusChipsReferencePage() {
  const theme = useTheme();

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
                {PACKING_ORDER_UI_STATUSES.map((status) => {
                  const config = getPackingStatusChipConfig(status, theme);
                  const Icon = config.Icon;
                  const monospace = { fontFamily: "ui-monospace, monospace", fontSize: 13 };

                  return (
                    <TableRow key={status}>
                      <TableCell sx={{ verticalAlign: "middle" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {STATUS_LABELS[status]}
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
                          {config.color}
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
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>
    </Box>
  );
}
