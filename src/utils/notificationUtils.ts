import { createNotification } from '../services/EnhancedNotificationService';
import { ReportData } from '../services/ReportService';

/**
 * Creates a test notification for a user
 * @param userId The user ID to send the notification to
 * @returns Promise that resolves when notification is created
 */
export const createTestNotification = async (userId: string): Promise<boolean> => {
  return await createNotification({
    user_id: userId,
    title: 'Test Notification',
    message: 'This is a test notification to verify the notification system is working correctly.',
    type: 'info',
    read: false
  });
};

/**
 * Creates a status update notification for a report
 * @param report The report that was updated
 * @param newStatus The new status of the report
 * @returns Promise that resolves when notification is created
 */
export const createStatusUpdateNotification = async (
  report: ReportData, 
  newStatus: string
): Promise<boolean> => {
  // Craft a notification based on the new status
  let title = '';
  let message = '';
  let type: 'info' | 'success' | 'warning' | 'error' = 'info';
  
  switch (newStatus) {
    case 'Reviewed':
      title = 'Report Reviewed';
      message = `Your report "${report.title}" has been reviewed by our team and is being processed.`;
      type = 'info';
      break;
    case 'Verified':
      title = 'Report Verified!';
      message = `Great news! Your report "${report.title}" has been verified and resolved successfully.`;
      type = 'success';
      break;
    default:
      title = 'Report Status Update';
      message = `The status of your report "${report.title}" has been updated to "${newStatus}".`;
      type = 'info';
  }
  
  // Create the notification
  return await createNotification({
    user_id: report.user_id,
    title,
    message,
    type,
    read: false,
    related_report_id: report.report_id
  });
};
