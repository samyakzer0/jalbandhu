import { ReportData } from '../services/ReportService';
import { 
  createNotification, 
  NotificationTemplate, 
  NotificationType,
  NotificationChannel
} from '../services/EnhancedNotificationService';

// Notification templates for different scenarios
interface NotificationTemplates {
  [key: string]: {
    title: string;
    message: (params: any) => string;
    type: NotificationType;
  }
}

// Status update notification templates
const statusTemplates: NotificationTemplates = {
  'Submitted': {
    title: 'Report Submitted',
    message: (report: ReportData) => `Your report "${report.title}" has been submitted successfully and is awaiting review.`,
    type: 'info'
  },
  'Reviewed': {
    title: 'Report Reviewed',
    message: (report: ReportData) => `Your report "${report.title}" has been reviewed.`,
    type: 'info'
  },
  'Verified': {
    title: 'Report Verified',
    message: (report: ReportData) => `Great news! Your report "${report.title}" has been verified.`,
    type: 'success'
  },
  'Rejected': {
    title: 'Report Rejected',
    message: (report: ReportData) => `Your report "${report.title}" could not be processed. Please check your submission details.`,
    type: 'error'
  }
};

// Create a status update notification with proper template
export const createStatusUpdateNotification = async (
  report: ReportData, 
  newStatus: string,
  channel: NotificationChannel = 'all'
): Promise<boolean> => {
  try {
    // Get the template for this status
    const template = statusTemplates[newStatus];
    if (!template) {
      // If no specific template exists, use a generic one
      return await createNotification({
        user_id: report.user_id,
        title: 'Report Status Update',
        message: `The status of your report "${report.title}" has been updated to "${newStatus}".`,
        type: 'info',
        read: false,
        related_report_id: report.report_id,
        channel
      });
    }
    
    // Create notification with the template
    return await createNotification({
      user_id: report.user_id,
      title: template.title,
      message: template.message(report),
      type: template.type,
      read: false,
      related_report_id: report.report_id,
      channel
    });
  } catch (error) {
    console.error('Error creating status update notification:', error);
    return false;
  }
};

// Create a comment notification
export const createCommentNotification = async (
  report: ReportData,
  commentedBy: string,
  comment: string,
  channel: NotificationChannel = 'all'
): Promise<boolean> => {
  try {
    return await createNotification({
      user_id: report.user_id,
      title: 'New Comment on Your Report',
      message: `${commentedBy} commented on your report "${report.title}": "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
      type: 'info',
      read: false,
      related_report_id: report.report_id,
      channel
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
    return false;
  }
};

// Create an urgent announcement
export const createUrgentAnnouncementNotification = async (
  userId: string,
  title: string,
  message: string,
  channel: NotificationChannel = 'all'
): Promise<boolean> => {
  try {
    return await createNotification({
      user_id: userId,
      title: `URGENT: ${title}`,
      message,
      type: 'warning',
      read: false,
      channel
    });
  } catch (error) {
    console.error('Error creating urgent announcement notification:', error);
    return false;
  }
};

// Create a community announcement notification
export const createCommunityAnnouncementNotification = async (
  userId: string,
  title: string,
  message: string,
  channel: NotificationChannel = 'all'
): Promise<boolean> => {
  try {
    return await createNotification({
      user_id: userId,
      title: `Community Announcement: ${title}`,
      message,
      type: 'info',
      read: false,
      channel
    });
  } catch (error) {
    console.error('Error creating community announcement notification:', error);
    return false;
  }
};

// Create a reminder notification
export const createReminderNotification = async (
  userId: string,
  title: string,
  message: string,
  channel: NotificationChannel = 'inApp'
): Promise<boolean> => {
  try {
    return await createNotification({
      user_id: userId,
      title: `Reminder: ${title}`,
      message,
      type: 'info',
      read: false,
      channel
    });
  } catch (error) {
    console.error('Error creating reminder notification:', error);
    return false;
  }
};

// Create a verification notification
export const createVerificationNotification = async (
  userId: string,
  verificationCode: string,
  channel: NotificationChannel = 'inApp'
): Promise<boolean> => {
  try {
    return await createNotification({
      user_id: userId,
      title: 'Verification Code',
      message: `Your verification code is: ${verificationCode}`,
      type: 'info',
      read: false,
      channel
    });
  } catch (error) {
    console.error('Error creating verification notification:', error);
    return false;
  }
};
