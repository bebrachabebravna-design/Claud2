import { loadFont } from "@remotion/fonts";
import { cyrillicFont, latinExtFont, latinFont } from "./font-data";

/**
 * Montserrat is inlined as data URIs rather than fetched.
 *
 * Remotion recycles render tabs every few hundred frames, and on reload the
 * font request would occasionally never settle — the render then died on a
 * delayRender timeout mid-way through. A data URI removes the request, so the
 * face resolves synchronously and the render cannot stall on it.
 *
 * Google ships one subsetted file per script, so each is registered against the
 * same family with its own unicode-range: Cyrillic for the copy, latin for
 * digits and the URL, latin-ext for the ruble sign. The files are variable
 * across the 600-900 axis, so one face per subset covers every weight in use.
 */
const cyrillic = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
const latin =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const latinExt =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

loadFont({ family: "Montserrat", url: cyrillicFont, format: "woff2", weight: "600 900", display: "block", unicodeRange: cyrillic });
loadFont({ family: "Montserrat", url: latinFont, format: "woff2", weight: "600 900", display: "block", unicodeRange: latin });
loadFont({ family: "Montserrat", url: latinExtFont, format: "woff2", weight: "600 900", display: "block", unicodeRange: latinExt });

export const displayFont = "Montserrat, sans-serif";
