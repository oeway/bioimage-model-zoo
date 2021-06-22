<template>
  <div>
    <label :for="item.label" class="label">
      {{ item.label }}
      <sup
        class="has-text-grey-light is-size-7"
        v-if="item.isRequired !== false"
        >*</sup
      >
    </label>
    <div class="control">
      <b-taginput
        :id="item.label"
        v-model="value"
        :data="filteredTags"
        :allow-new="item.allow_new !== false"
        :open-on-focus="item.options && item.options.length > 0"
        autocomplete
        @input="$emit('input', value)"
        :icon="item.icon || 'label'"
        :placeholder="item.placeholder"
        @typing="getFilteredTags"
      >
      </b-taginput>
      <p v-if="error" class="help is-danger">
        {{ error }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "tags",
  props: {
    error: {
      type: String,
      default: null
    },
    item: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    value: undefined,
    filteredTags: []
  }),
  mounted() {
    this.filteredTags = this.item.options;
  },
  created() {
    this.value = this.item.value;
    this.item.value && this.$emit("input", this.item.value);
  },
  methods: {
    getFilteredTags(text) {
      this.filteredTags =
        this.item.options &&
        this.item.options.filter(option => {
          return (
            option
              .toString()
              .toLowerCase()
              .indexOf(text.toLowerCase()) >= 0
          );
        });
    }
  }
};
</script>
<style>
.autocomplete .dropdown-content {
  display: block !important;
  width: 100%;
}
</style>
