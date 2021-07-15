<template>
  <div>
    <label :for="item.label" class="label">
      {{ item.label }}
      <span
        class="helpLabel has-text-grey-light is-size-7 is-italic"
        style="margin-left: .5rem;font-weight: 400;"
        >{{ item.help }}</span
      >
      <sup
        class="has-text-grey-light is-size-7"
        v-if="item.isRequired !== false"
        >*</sup
      >
    </label>
    <div class="control">
      <div v-for="(author, i) in value" :key="i">
        <b-field>
          <b-input
            @input="commitValue"
            type="text"
            placeholder="Full Name"
            v-model="author.name"
            maxlength="1000"
          >
          </b-input>
          <b-input
            @input="commitValue"
            type="text"
            placeholder="Affiliation (optional)"
            v-model="author.affiliation"
            maxlength="100"
          >
          </b-input>
          <b-input
            @input="commitValue"
            type="text"
            placeholder="ORCID (optional)"
            v-model="author.orcid"
            maxlength="1000"
          >
          </b-input>

          <b-button
            v-if="value.length > 1"
            style="text-transform:none;"
            class="button"
            icon-left="delete"
            @click="removeAuthor(author)"
          ></b-button>
          <b-button
            v-if="
              i === value.length - 1 && !(!author.name || author.name === '')
            "
            style="text-transform:none;"
            class="button"
            icon-left="plus"
            @click="addNewAuthor"
          ></b-button>
        </b-field>
      </div>
      <p v-if="error" class="help is-danger">
        {{ error }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "author",
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
    if (this.value && !Array.isArray(this.value)) this.value = [this.value];
    this.value = this.value || [];
    this.value = this.value.filter(v => v.name && v.name != "");
    this.commitValue();

    if (this.value.length <= 0) {
      this.value.push({});
    }
  },
  methods: {
    commitValue() {
      if (this.value.length <= 0) this.$emit("input", null);
      else {
        if (this.value[this.value.length - 1].name === "")
          this.$emit("input", this.value.slice(0, this.value.length - 1));
        else this.$emit("input", this.value);
      }
    },
    addNewAuthor() {
      if (this.value[this.value.length - 1].name !== "") {
        this.value.push({});
      }
      this.commitValue();
    },
    removeAuthor(author) {
      const index = this.value.indexOf(author);
      if (index >= 0) {
        this.value.splice(index, 1);
      }
      this.commitValue();
    }
  }
};
</script>
<style>
.autocomplete > .dropdown-menu > .dropdown-content {
  display: block !important;
  width: 100%;
}
</style>
