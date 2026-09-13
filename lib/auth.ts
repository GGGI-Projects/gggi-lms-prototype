/**
 * The prototype-only bridge between the registration form and the
 * application-status page.
 *
 * There is no backend here, so there is no session to carry an applicant's
 * details across a `router.push` the way a real registration would.
 * `sessionStorage` is the smallest thing that works: it survives the
 * navigation, it never leaves the browser, and it clears itself the moment
 * the tab closes - which is right for values that exist only so the next
 * screen can say them back to the applicant.
 *
 * A query string (`/application-status?email=...&province=...`) would do the
 * same job but leaves the details sitting in the URL - in browser history, in
 * server logs, in anything that screenshots the address bar. Not a real
 * concern for a demo, but the finished platform will treat these details the
 * same way registration does, so the prototype should not model the sloppier
 * habit.
 *
 * THREE KEYS, NOT ONE JSON BLOB - `RegisterForm` only ever writes all three
 * together, but keeping them separate means `ApplicationStatusPanel` can read
 * (or fail to read) each one independently, the same graceful degradation
 * the old single-key version already had for a visitor arriving with nothing
 * stored at all.
 */
export const REGISTRATION_NAME_KEY = "ol.registration-name";
export const REGISTRATION_EMAIL_KEY = "ol.registration-email";
export const REGISTRATION_PROVINCE_KEY = "ol.registration-province";
