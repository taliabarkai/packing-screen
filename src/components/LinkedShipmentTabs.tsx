import { Stack, Tab, Tabs, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export type LinkedShipmentTabItem = {
  key: string;
  shipmentId: string;
  /** Short factory code, shown after the shipment id in parentheses */
  factoryLabel: string;
};

type LinkedShipmentTabsProps = {
  tabs: LinkedShipmentTabItem[];
  value: number;
  onChange: (index: number) => void;
  ariaLabel: string;
  /** Prefix for `id` on each tab panel control */
  idPrefix: string;
};

/**
 * Segmented pill tabs for linked shipments (similar orders, split shipments).
 * Label: shipment id and factory code in one row, e.g. `SH-12345 (KG)`.
 */
export function LinkedShipmentTabs({ tabs, value, onChange, ariaLabel, idPrefix }: LinkedShipmentTabsProps) {
  const theme = useTheme();
  const safeValue = Math.min(Math.max(0, value), Math.max(0, tabs.length - 1));

  return (
    <Tabs
      value={safeValue}
      onChange={(_, v: number) => onChange(v)}
      aria-label={ariaLabel}
      textColor="inherit"
      TabIndicatorProps={{ sx: { display: "none" } }}
      sx={{
        flex: "0 1 auto",
        minWidth: 0,
        maxWidth: "100%",
        minHeight: "unset",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 100,
        bgcolor: "background.paper",
        p: 0.5,
        boxSizing: "border-box",
        "& .MuiTabs-flexContainer": {
          gap: 0.5,
        },
        "& .MuiTab-root": {
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: "0.15px",
          minHeight: 40,
          py: 0.875,
          px: 2,
          minWidth: "unset",
          maxWidth: "none",
          borderRadius: 100,
          color: "text.secondary",
          bgcolor: "transparent",
          transition: (t) =>
            t.transitions.create(["background-color", "color"], {
              duration: t.transitions.duration.short,
            }),
          "&.Mui-selected": {
            color: "#1976D2",
            fontWeight: 600,
            bgcolor: "#E3F2FD",
          },
          "&:not(.Mui-selected):hover": {
            bgcolor: alpha(theme.palette.common.black, 0.04),
          },
        },
        "& .MuiTabs-indicator": {
          display: "none",
        },
      }}
    >
      {tabs.map((t, i) => (
        <Tab
          key={t.key}
          id={`${idPrefix}-${i}`}
          value={i}
          label={
            <Stack
              component="span"
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.75}
              sx={{ py: 0.25, whiteSpace: "nowrap" }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "inherit",
                }}
              >
                {t.shipmentId}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  letterSpacing: "0.04em",
                  color: "inherit",
                  opacity: 0.9,
                }}
              >
                ({t.factoryLabel})
              </Typography>
            </Stack>
          }
        />
      ))}
    </Tabs>
  );
}
