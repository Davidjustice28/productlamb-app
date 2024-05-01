import { createCookie } from "@remix-run/node";

export const navbarState = createCookie("navbar_state", {
  maxAge: 604_800, // one week
});