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
      <section>
        <b-field>
          <b-upload
            :id="item.label"
            v-model="value"
            @input="updateFiles()"
            multiple
            drag-drop
            expanded
          >
            <section class="section">
              <div class="content has-text-centered">
                <b-icon icon="upload" size="is-large"></b-icon>

                Drop additional files here
                <br />
                <span
                  v-for="(file, index) in value"
                  :key="index"
                  class="tag is-primary"
                >
                  {{
                    file.name.slice(0, 20) +
                      (file.name.length > 20 ? "..." : "")
                  }}
                  <button
                    class="delete is-small"
                    type="button"
                    @click.prevent="removeFile(item.label, index)"
                  ></button>
                </span>
                <br />
                <b-button
                  v-if="value && value.length > 0"
                  class="is-small"
                  @click.prevent="clearFiles()"
                  >Clear files</b-button
                >
              </div>
            </section>
          </b-upload>
        </b-field>
      </section>
      <p v-if="error" class="help is-danger">
        {{ error }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "files",
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
  },
  methods: {
    removeFile(label, index) {
      this.value.splice(index, 1);
      this.$forceUpdate();
    },
    clearFiles() {
      this.value = null;
      this.$emit("input", null);
      this.$forceUpdate();
    },
    updateFiles() {
      this.$emit("input", this.value);
      // we need this because otherwise we cannot update the list on the interface
      this.$forceUpdate();
    },
    trimEllip(str, length) {
      if (!str) return str;
      if (typeof str === "object") str = str.toString();
      return str.length > length ? str.substring(0, length) + "..." : str;
    }
  }
};
</script>
