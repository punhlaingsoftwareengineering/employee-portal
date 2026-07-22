/** OTP validity and resend cooldown (seconds). */
export const OTP_EXPIRES_IN_SECONDS = 180;
export const OTP_RESEND_COOLDOWN_SECONDS = 180;

/** HttpOnly cookie: unix ms when resend is allowed again. */
export const OTP_RESEND_COOKIE = 'otp_resend_available_at';
