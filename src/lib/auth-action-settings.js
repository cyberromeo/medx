// Firebase email action (password reset / email verification) URL config.
// Forces the email link to land on our own /reset-password route inside the
// app instead of the default firebaseapp.com hosted page, so the existing
// client-side handler can read `oobCode` + `mode` from the query string.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const passwordResetActionCodeSettings = {
  // Final URL the user lands on after clicking the email link.
  // Firebase appends `?mode=resetPassword&oobCode=...&apiKey=...&continueUrl=...`
  url: `${SITE_URL}/reset-password`,
  // Handle the oobCode inside our own app (see src/app/reset-password/page.jsx)
  handleCodeInApp: true,
};

export const emailVerifyActionCodeSettings = {
  url: `${SITE_URL}/login`,
  handleCodeInApp: true,
};
