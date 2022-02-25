<template>
  <div>
    <label v-if="item.showLabel" :for="item.label" class="label">
      {{ item.label }}
      <span
        v-if="item.help"
        class="helpLabel has-text-grey-light is-size-7 is-italic"
        style="margin-left: 0.5rem; font-weight: 400"
      >
        {{ item.help }}
      </span>
      <sup
        class="has-text-grey-light is-size-7"
        v-if="item.isRequired !== false"
        >*</sup
      >
    </label>
    <div class="control">
      <b-button
        expanded
        :type="
          callbackError
            ? 'is-danger'
            : item.value
            ? 'is-success'
            : 'is-warning is-light'
        "
        :id="item.label"
        class="select-button"
        @click="resolveCallback(item)"
        :icon-left="item.icon"
        :style="item.style"
      >
        {{ item.label }}
      </b-button>

      <pre v-if="callbackError">{{ callbackError }}</pre>

      <p class="help is-info">{{ trimEllip(item.value, 20) }}</p>
      <p v-if="error" class="help is-danger">
        {{ error }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "button",
  props: {
    error: {
      type: String,
      default: null,
    },
    item: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    value: undefined,
    callbackError: null,
  }),
  created() {
    this.value = this.item.value;
    this.item.value && this.$emit("input", this.item.value);
  },
  methods: {
    trimEllip(str, length) {
      if (!str) return str;
      if (typeof str === "object") str = str.toString();
      return str.length > length ? str.substring(0, length) + "..." : str;
    },
    syntaxHighlight(json) {
      if (typeof json != "string") {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        function (match) {
          var cls = "number";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "key";
            } else {
              cls = "string";
            }
          } else if (/true|false/.test(match)) {
            cls = "boolean";
          } else if (/null/.test(match)) {
            cls = "null";
          }
          return '<span class="' + cls + '">' + match + "</span>";
        }
      );
    },
    async resolveCallback(item) {
      try {
        this.item.value = await Promise.resolve(item.callback());
        this.$emit("input", this.item.value);
      } catch (e) {
        this.callbackError = `${e}`;
      }
      this.$forceUpdate();
    },
  },
};
</script>
