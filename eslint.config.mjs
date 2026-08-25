// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/attributes-order": "off",
    "vue/first-attribute-linebreak": "off",
    "vue/multi-word-component-names": "off",
  },
});
