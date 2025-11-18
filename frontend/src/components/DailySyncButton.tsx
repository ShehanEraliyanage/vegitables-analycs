import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';
import './DailySyncButton.css';

const DailySyncButton = () => {
  const queryClient = useQueryClient();
  const [today, setToday] = useState<string>('');

  // Get today's date in Sri Lanka timezone
  useEffect(() => {
    const now = new Date();
    const slTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
    );
    const dateStr = slTime.toISOString().split('T')[0];
    setToday(dateStr);
  }, []);

  // Check if today's data exists
  const { data: dateCheck, refetch: refetchDateCheck } = useQuery(
    ['checkDate', today],
    () => apiService.checkDateExists(today),
    {
      enabled: !!today,
      refetchInterval: 30000, // Check every 30 seconds
    },
  );

  const dailySyncMutation = useMutation(
    () => apiService.triggerDailySync(),
    {
      onSuccess: (data) => {
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Daily Sync Completed!',
          html: `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="color: #6b7280; margin-bottom: 1rem;">
                ${data.message || 'Today\'s data has been successfully fetched.'}
              </p>
            </div>
          `,
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Great!',
          timer: 3000,
        });
        // Refetch data and date check
        setTimeout(() => {
          queryClient.invalidateQueries('products');
          queryClient.invalidateQueries('statistics');
          queryClient.invalidateQueries('analytics');
          refetchDateCheck();
        }, 1000);
      },
      onError: (error: any) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Daily Sync Failed',
          html: `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="color: #6b7280;">
                ${error.response?.data?.message || 'Failed to sync today\'s data. Please try again.'}
              </p>
            </div>
          `,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
        });
      },
    },
  );

  const handleDailySync = () => {
    Swal.fire({
      title: 'Sync Today\'s Data?',
      html: `
        <div style="text-align: left; padding: 1rem 0;">
          <p style="margin-bottom: 1rem; color: #6b7280;">
            This will fetch today's price data from the API.
          </p>
          <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <p style="margin: 0.5rem 0; color: #374151;">
              <strong>Date:</strong> ${today}
            </p>
            <p style="margin: 0.5rem 0; color: #374151;">
              <strong>Estimated Time:</strong> 1-2 minutes
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Sync Now',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading dialog
        Swal.fire({
          title: 'Syncing Today\'s Data...',
          html: `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="margin-top: 1rem; color: #6b7280;">
                Fetching today's data from the API.<br/>
                Please wait...
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
        dailySyncMutation.mutate();
      }
    });
  };

  const isDataFetched = dateCheck?.exists || false;
  const isLoading = dailySyncMutation.isLoading;

  return (
    <div className="daily-sync-container">
      <div className="daily-sync-info">
        <div className="daily-sync-icon">
          {isDataFetched ? '✅' : '🔄'}
        </div>
        <div className="daily-sync-content">
          <h4>Daily Data Sync</h4>
          <p className="daily-sync-date">Today: {today}</p>
          <p className="daily-sync-status">
            {isDataFetched ? (
              <span className="status-success">
                ✓ Data already fetched for today
              </span>
            ) : (
              <span className="status-pending">
                ⚠ No data found for today
              </span>
            )}
          </p>
        </div>
      </div>
      <button
        className={`daily-sync-button ${isDataFetched ? 'disabled' : ''}`}
        onClick={handleDailySync}
        disabled={isDataFetched || isLoading}
        title={
          isDataFetched
            ? 'Today\'s data has already been fetched'
            : 'Click to fetch today\'s data'
        }
      >
        {isLoading ? (
          <>
            <span className="spinner-small"></span>
            Syncing...
          </>
        ) : isDataFetched ? (
          <>
            <span>✓</span>
            Data Fetched
          </>
        ) : (
          <>
            <span>🔄</span>
            Sync Today's Data
          </>
        )}
      </button>
    </div>
  );
};

export default DailySyncButton;

