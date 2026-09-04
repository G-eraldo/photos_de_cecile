export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:response", (response) => {
    if (response.headers instanceof Headers) {
      response.headers.delete("x-powered-by");
      return;
    }

    delete response.headers?.["x-powered-by"];
    delete response.headers?.["X-Powered-By"];
  });
});
