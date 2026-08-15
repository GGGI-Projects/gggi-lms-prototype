/**
 * The prototype-only bridge between the sign-up form and the verify-email
 * page.
 *
 * There is no backend here, so there is no session to carry an email address
 * across a `router.push` the way a real sign-up would. `sessionStorage` is the
 * smallest thing that works: it survives the navigation, it never leaves the
 * browser, and it clears itself the moment the tab closes - which is right for
 * a value that exists only so the next screen can say it back to the visitor.
 *
 * A query string (`/verify-email?email=...`) would do the same job but leaves
 * the address sitting in the URL - in browser history, in server logs, in
 * anything that screenshots the address bar. Not a real concern for a demo,
 * but the finished platform will feel this address the same way sign-up does,
 * so the prototype should not model the sloppier habit.
 */
export const SIGNUP_EMAIL_KEY = "ol.signup-email";
