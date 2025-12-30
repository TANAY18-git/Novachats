import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

// Format message timestamp
export const formatMessageTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return format(d, 'HH:mm');
};

// Format chat list timestamp
export const formatChatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);

    if (isToday(d)) {
        return format(d, 'HH:mm');
    } else if (isYesterday(d)) {
        return 'Yesterday';
    } else if (isThisWeek(d)) {
        return format(d, 'EEEE');
    } else {
        return format(d, 'dd/MM/yyyy');
    }
};

// Format last seen
export const formatLastSeen = (date) => {
    if (!date) return 'a long time ago';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Format date for message grouping
export const formatMessageDate = (date) => {
    if (!date) return '';
    const d = new Date(date);

    if (isToday(d)) {
        return 'Today';
    } else if (isYesterday(d)) {
        return 'Yesterday';
    } else {
        return format(d, 'MMMM d, yyyy');
    }
};

// Check if should show date separator
export const shouldShowDateSeparator = (currentDate, previousDate) => {
    if (!previousDate) return true;

    const current = new Date(currentDate);
    const previous = new Date(previousDate);

    return (
        current.getDate() !== previous.getDate() ||
        current.getMonth() !== previous.getMonth() ||
        current.getFullYear() !== previous.getFullYear()
    );
};

// Generate initials from name
export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Validate email
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate username
export const isValidUsername = (username) => {
    const re = /^[a-zA-Z0-9_]{3,30}$/;
    return re.test(username);
};

// Validate password
export const isValidPassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 6;

    return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
};

// Generate color from string (for avatar backgrounds)
export const stringToColor = (str) => {
    if (!str) return '#6366f1';

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
        '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
        '#0ea5e9', '#3b82f6'
    ];

    return colors[Math.abs(hash) % colors.length];
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

// Format link expiry time
export const formatExpiryTime = (expiresAt) => {
    if (!expiresAt) return '';

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};
