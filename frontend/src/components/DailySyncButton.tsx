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

  // Get missing dates
  const { data: missingDatesData, refetch: refetchMissingDates, error: missingDatesError, isLoading: isLoadingMissingDates } = useQuery(
    ['missingDates'],
    () => apiService.getMissingDates(),
    {
      refetchInterval: 60000, // Check every minute
      retry: 2, // Retry failed requests
      onError: (error) => {
        console.error('Failed to fetch missing dates:', error);
      },
    },
  );

  const dailySyncMutation = useMutation(
    () => apiService.triggerDailySync(),
    {
      onSuccess: (data) => {
        Swal.close();
        
        // Check if data was actually found
        if (data.dataFound === false) {
          // No data available - show warning
          Swal.fire({
            icon: 'info',
            title: 'No Data Available',
            html: `
              <div style="text-align: center; padding: 1rem 0;">
                <p style="color: #6b7280;">
                  No price data available for today. Please try again later.
                </p>
              </div>
            `,
            confirmButtonColor: '#667eea',
            confirmButtonText: 'OK',
            timer: 4000,
          });
        } else if (data.dataFound === true) {
          // Data found and synced - show success
          Swal.fire({
            icon: 'success',
            title: 'Daily Sync Completed!',
            html: `
              <div style="text-align: center; padding: 1rem 0;">
                <p style="color: #6b7280; margin-bottom: 1rem;">
                  ${data.message || 'Today\'s data has been successfully fetched.'}
                </p>
                ${data.count ? `<p style="color: #10b981; font-weight: 600; margin-top: 0.5rem;">
                  ${data.count} price entries synced
                </p>` : ''}
              </div>
            `,
            confirmButtonColor: '#667eea',
            confirmButtonText: 'Great!',
            timer: 3000,
          });
        } else {
          // Fallback for older API responses
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
        }
        
        // Refetch data and date check
        setTimeout(() => {
          queryClient.invalidateQueries('products');
          queryClient.invalidateQueries('statistics');
          queryClient.invalidateQueries('analytics');
          queryClient.invalidateQueries('today-prices');
          queryClient.invalidateQueries('latest-prices');
          queryClient.invalidateQueries('missingDates');
          refetchDateCheck();
          refetchMissingDates();
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
    const missingDates = missingDatesData?.missingDates || [];
    const hasMissingDates = missingDates.length > 0;
    
    let title = 'Sync Data?';
    let message = '';
    
    if (hasMissingDates) {
      title = `Sync ${missingDates.length} Missing Date(s)?`;
      message = `
        <div style="text-align: left; padding: 1rem 0;">
          <p style="margin-bottom: 1rem; color: #6b7280;">
            ${missingDates.length === 1 
              ? 'This will sync 1 missing date:' 
              : `This will sync ${missingDates.length} missing dates:`}
          </p>
          <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; max-height: 200px; overflow-y: auto;">
            ${missingDates.map(date => `
              <p style="margin: 0.25rem 0; color: #374151; font-family: monospace;">
                • ${date}${date === today ? ' <strong>(Today)</strong>' : ''}
              </p>
            `).join('')}
          </div>
          <p style="margin-top: 1rem; color: #6b7280; font-size: 0.9rem;">
            <strong>Estimated Time:</strong> ${missingDates.length * 1}-${missingDates.length * 2} minutes
          </p>
        </div>
      `;
    } else {
      message = `
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
      `;
    }

    Swal.fire({
      title,
      html: message,
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
          title: hasMissingDates ? `Syncing ${missingDates.length} Date(s)...` : 'Syncing Today\'s Data...',
          html: `
            <div style="text-align: center; padding: 1rem 0;">
              <p style="margin-top: 1rem; color: #6b7280;">
                ${hasMissingDates 
                  ? `Syncing ${missingDates.length} missing date(s) from the API.<br/>This may take a few minutes.`
                  : 'Fetching today\'s data from the API.<br/>Please wait...'}
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
  const missingDates = missingDatesData?.missingDates || [];
  const hasMissingDates = missingDates.length > 0;
  const latestSyncedDate = missingDatesData?.latestSyncedDate;
  
  // Debug logging
  if (missingDatesData) {
    console.log('Missing dates data:', missingDatesData);
  }
  if (missingDatesError) {
    console.error('Missing dates error:', missingDatesError);
  }

  return (
    <div className="daily-sync-container">
      <div className="daily-sync-info">
        <div className="daily-sync-icon">
          {isDataFetched && !hasMissingDates ? '✅' : '🔄'}
        </div>
        <div className="daily-sync-content">
          <h4>Daily Data Sync</h4>
          <p className="daily-sync-date">Today: {today}</p>
          {latestSyncedDate && (
            <p className="daily-sync-date" style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Last synced: {latestSyncedDate}
            </p>
          )}
          <p className="daily-sync-status">
            {isLoadingMissingDates ? (
              <span className="status-pending">
                🔄 Checking for missing dates...
              </span>
            ) : missingDatesError ? (
              <span className="status-pending" style={{ color: '#ef4444' }}>
                ⚠ Error checking missing dates
              </span>
            ) : isDataFetched && !hasMissingDates ? (
              <span className="status-success">
                ✓ All data up to date
              </span>
            ) : hasMissingDates ? (
              <span className="status-pending">
                ⚠ {missingDates.length} missing date(s) found
              </span>
            ) : (
              <span className="status-pending">
                ⚠ No data found for today
              </span>
            )}
          </p>
          {hasMissingDates && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
              <details style={{ cursor: 'pointer' }}>
                <summary style={{ color: '#667eea', fontWeight: 500 }}>
                  View missing dates ({missingDates.length})
                </summary>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f3f4f6', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                  {missingDates.map((date, idx) => (
                    <div key={idx} style={{ fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.25rem 0' }}>
                      {date}{date === today ? ' (Today)' : ''}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
      <button
        className={`daily-sync-button ${isDataFetched && !hasMissingDates ? 'disabled' : ''}`}
        onClick={handleDailySync}
        disabled={(isDataFetched && !hasMissingDates) || isLoading}
        title={
          hasMissingDates
            ? `Click to sync ${missingDates.length} missing date(s)`
            : isDataFetched
            ? 'All data is up to date'
            : 'Click to fetch today\'s data'
        }
      >
        {isLoading ? (
          <>
            <span className="spinner-small"></span>
            Syncing...
          </>
        ) : isDataFetched && !hasMissingDates ? (
          <>
            <span>✓</span>
            Up to Date
          </>
        ) : hasMissingDates ? (
          <>
            <span>🔄</span>
            Sync {missingDates.length} Date{missingDates.length > 1 ? 's' : ''}
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

