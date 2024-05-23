<template>
  <div class="test-summary">
    It has been tested with:
    <code
      v-for="(tests, consumer) in summary.tests"
      :key="'code-' + consumer"
      style="margin: 2px;"
    >
      {{ consumer + " " }}
    </code>
    <a
      class="button is-small"
      style="margin-left: 10px; color: blue;"
      @click="toggleAll()"
      >{{ showAll ? "- hide details" : "+ more details" }}</a
    >
    <div
      v-show="showAll"
      v-for="(tests, consumer) in summary.tests"
      :key="'details-' + consumer"
      class="container"
    >
      <h3>{{ consumer }}</h3>
      <ul>
        <li v-for="(test, k) in tests" :key="k" style="list-style: none;">
          {{ test.status == "passed" ? "✅" : "❌" }}
          <span style="margin-left: 5px;">{{ test.name }}</span>
          <b-button
            class="button is-small"
            style="margin-left: 10px; color: blue; height: 22px;"
            @click="toggleSummary(test)"
            >{{ test.expand ? "-" : "+" }}</b-button
          >
          <div v-show="test.expand">
            <pre v-if="test.status">Status: {{ test.status }}</pre>
            <pre v-if="test.error">Error: {{ test.error }}</pre>
            <pre v-if="test.traceback">Traceback: 
              <p v-for="(line, lk) in test.traceback" :key="lk">{{line}}</p>
            </pre>
            <pre v-if="test.wanings">Warnings: {{ test.wanings }}</pre>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "TestSummary",
  props: {
    summary: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showAll: false
    };
  },
  mounted() {},
  methods: {
    toggleSummary(test) {
      test.expand = !test.expand;
      this.$forceUpdate();
    },
    toggleAll() {
      this.showAll = !this.showAll;
      this.$forceUpdate();
    }
  }
};
</script>
<style scoped></style>
