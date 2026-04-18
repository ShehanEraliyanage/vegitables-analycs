import { useMutation, useQueryClient } from 'react-query';
import Swal from 'sweetalert2';
import {
  FaChartBar,
  FaCalendarAlt,
  FaBolt,
  FaChartLine,
  FaRocket,
} from 'react-icons/fa';
import { apiService } from '../services/api';
import './SyncButton.css';

interface SyncButtonProps {
  hasData: boolean;
}

const SyncButton = ({ hasData }: SyncButtonProps) => {
  const queryClient = useQueryClient();

  const syncMutation = useMutation(
    () => apiService.triggerInitialSync(),
    {
      onSuccess: (data) => {
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Sync Completed!',
          html: `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="color: #6b7280; margin-bottom: 1rem;">
                ${data.message || 'Historical data has been successfully fetched.'}
              </p>
              <p style="color: #9ca3af; font-size: 0.9rem;">
                The dashboard will refresh automatically...
              </p>
            </div>
          `,
          confirmButtonColor: '#15803d',
          confirmButtonText: 'Great!',
          timer: 3000,
        });
        // Refetch data after sync
        setTimeout(() => {
          queryClient.invalidateQueries('products');
          queryClient.invalidateQueries('statistics');
          queryClient.invalidateQueries('analytics');
        }, 2000);
      },
      onError: (error: any) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Sync Failed',
          html: `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="color: #6b7280;">
                ${error.response?.data?.message || 'Failed to sync data. Please try again.'}
              </p>
            </div>
          `,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
        });
      },
    }
  );

  const handleSyncClick = () => {
    Swal.fire({
      title: 'Start Initial Data Sync?',
      html: `
        <div style="text-align: left; padding: 1rem 0;">
          <p style="margin-bottom: 1rem; color: #6b7280;">
            This will fetch historical price data from the API.
          </p>
          <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <p style="margin: 0.5rem 0; color: #374151;">
              <strong>Date Range:</strong> 2025-05-05 to 2025-11-17
            </p>
            <p style="margin: 0.5rem 0; color: #374151;">
              <strong>Estimated Time:</strong> 5-10 minutes
            </p>
          </div>
          <p style="color: #6b7280; font-size: 0.9rem;">
            <strong>Warning:</strong> This process cannot be interrupted once started.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#15803d',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Start Sync',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusConfirm: false,
      allowOutsideClick: false,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading dialog
        Swal.fire({
          title: 'Syncing Data...',
          html: `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="margin-top: 1rem; color: #6b7280;">
                Fetching historical data from the API.<br/>
                This may take several minutes. Please wait...
              </p>
            </div>
          `,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Start the sync
        syncMutation.mutate();
      }
    });
  };

  // Hide button if data already exists
  if (hasData) {
    return null;
  }

  return (
    <div className="sync-button-container">
      <div className="sync-info">
        <div className="sync-icon" aria-hidden>
          <FaChartBar />
        </div>
        <h3>No Data Available</h3>
        <p>Click the button below to fetch historical price data from the API.</p>
        <div className="sync-features">
          <div className="feature-item">
            <span className="feature-icon" aria-hidden>
              <FaCalendarAlt />
            </span>
            <span>Historical data from May to November 2025</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon" aria-hidden>
              <FaBolt />
            </span>
            <span>Automated daily sync at 2:00 PM</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon" aria-hidden>
              <FaChartLine />
            </span>
            <span>Comprehensive analytics & charts</span>
          </div>
        </div>
      </div>
      <button
        className="sync-button"
        onClick={handleSyncClick}
        disabled={syncMutation.isLoading}
      >
        {syncMutation.isLoading ? (
          <>
            <span className="spinner"></span>
            Syncing Data...
          </>
        ) : (
          <>
            <span className="button-icon" aria-hidden>
              <FaRocket />
            </span>
            Start Initial Data Sync
          </>
        )}
      </button>
    </div>
  );
};

export default SyncButton;

