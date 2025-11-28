import { useState } from 'react';
import { FaDownload, FaFileCsv, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { apiService } from '../services/api';
import { showSuccessToast, showErrorToast } from './ToastNotification';
import './ExportButton.css';

interface ExportButtonProps {
  data?: any;
  filename?: string;
  startDate?: string;
  endDate?: string;
  productId?: number;
}

const ExportButton = ({ data, filename, startDate, endDate, productId }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      let exportData = data;
      
      // If no data provided, fetch it
      if (!exportData) {
        const response = await apiService.getPrices({
          startDate,
          endDate,
          productId,
        });
        exportData = response.data || [];
      }

      if (!exportData || exportData.length === 0) {
        showErrorToast('No data to export');
        return;
      }

      // Convert to CSV
      const headers = Object.keys(exportData[0]).join(',');
      const rows = exportData.map((row: any) => 
        Object.values(row).map(val => `"${val}"`).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showSuccessToast('Data exported to CSV successfully!');
    } catch (error) {
      showErrorToast('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Dynamic import of xlsx
      const XLSX = await import('xlsx');
      
      let exportData = data;
      
      if (!exportData) {
        const response = await apiService.getPrices({
          startDate,
          endDate,
          productId,
        });
        exportData = response.data || [];
      }

      if (!exportData || exportData.length === 0) {
        showErrorToast('No data to export');
        return;
      }

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Download
      XLSX.writeFile(wb, `${filename || 'export'}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showSuccessToast('Data exported to Excel successfully!');
    } catch (error) {
      showErrorToast('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // For PDF, we'll use window.print() for now
      // A proper implementation would use jsPDF or similar
      showErrorToast('PDF export coming soon!');
    } catch (error) {
      showErrorToast('Failed to export PDF');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="export-button-container">
      <button
        className="export-button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        aria-label="Export data"
      >
        <FaDownload />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </button>
      {showMenu && (
        <>
          <div className="export-overlay" onClick={() => setShowMenu(false)} />
          <div className="export-menu">
            <button onClick={exportToCSV} className="export-menu-item">
              <FaFileCsv />
              <span>Export as CSV</span>
            </button>
            <button onClick={exportToExcel} className="export-menu-item">
              <FaFileExcel />
              <span>Export as Excel</span>
            </button>
            <button onClick={exportToPDF} className="export-menu-item">
              <FaFilePdf />
              <span>Export as PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;

