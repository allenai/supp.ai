/**
 * Extend the browser's Window type to reflect the additional APIs associated
 * with Google Analytics.
 */
export declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        googleAnalyticsId?: string;
    }
}
