import { setResponseHeader } from "h3";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response, { event }) => {
    const status = event.node.res.statusCode;
    if (status >= 400)
      setResponseHeader(event, "x-robots-tag", "noindex, nofollow");
  });
});
