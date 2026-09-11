import { setResponseHeader } from "h3";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => {
    if (event.node.res.statusCode >= 400) {
      setResponseHeader(event, "x-robots-tag", "noindex, nofollow");
    }
  });
});
