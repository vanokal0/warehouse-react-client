import {
  FilterPanelTrigger,
  ToolbarButton,
  ColumnsPanelTrigger,
  Toolbar,
} from "@mui/x-data-grid";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Badge,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import React from "react";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

export function CustomModernToolbar({
  onExportCsv,
  onExportPDF,
}: {
  onExportCsv: () => void;
  onExportPDF: () => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <Toolbar>
      <Tooltip title="Колонки">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>
      <Tooltip title="Фільтри">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default">
              <Badge
                badgeContent={state.filterCount}
                color="primary"
                variant="dot"
              >
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>
      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 0.5 }}
      />
      <IconButton onClick={handleClick}>
        <FileDownloadIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
            onExportCsv();
          }}
        >
          Завантажити у форматі CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onExportPDF();
          }}
        >
          Завантажити у форматі PDF
        </MenuItem>
        {/* можна додати PDF, JSON, XLSX тощо */}
      </Menu>
    </Toolbar>
  );
}
