import { createCookie } from "@remix-run/node";

export const theme = createCookie("theme", {
  maxAge: 604_800, // one week
});