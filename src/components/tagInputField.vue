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
        :data="item.options"
        :open-on-focus="item.options && item.options.length > 0"
        autocomplete
        @input="$emit('input', value)"
        :icon="item.icon || 'label'"
        :placeholder="item.placeholder"
      >
        <template #empty>
          There are no tags
        </template>
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
    value: undefined
  }),
  created() {
    this.value = this.item.value;
    this.item.value && this.$emit("input", this.item.value);
  }
};
</script>
