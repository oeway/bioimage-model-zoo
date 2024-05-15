<template>
  <div class="resource-item-info" v-if="resourceItem">
    <section style="margin-bottom:10px;">
      <app-icons :apps="resourceItem.apps"></app-icons>
      &nbsp;&nbsp;<badges :badges="resourceItem.badges"></badges>
    </section>
    <section>
      <pre class="resource-id">🆔</pre>
      <pre ref="resourceId" class="resource-id">{{ resourceItem.id }}</pre>

      <b-button
        size="is-small"
        icon-left="content-copy"
        @click="copyText(resourceItem.id)"
      ></b-button>

      <pre
        style="margin-left: 20px;"
        class="resource-id"
        v-if="resourceItem.nickname_icon"
        >{{ resourceItem.nickname_icon }}</pre
      >
      <pre
        ref="resourceNickname"
        class="resource-id"
        v-if="resourceItem.nickname"
        >{{ resourceItem.nickname }}</pre
      >

      <b-button
        size="is-small"
        icon-left="content-copy"
        v-if="resourceItem.nickname"
        @click="copyText(resourceItem.nickname)"
      ></b-button>
    </section>
    <b-carousel
      style="max-width: 1024px;"
      v-if="resourceItem.covers && resourceItem.covers.length > 0"
      :indicator="resourceItem.covers.length > 1"
      :arrow="resourceItem.covers.length > 1"
      :pause-info="false"
    >
      <b-carousel-item v-for="cover in resourceItem.covers" :key="cover">
        <figure class="image is-16by9">
          <img
            loading="lazy"
            :src="cover"
            :alt="resourceItem.name"
            class="cover-image"
            data-target="modal-image2"
          />
        </figure>
      </b-carousel-item>
    </b-carousel>
    <p
      class="authors"
      v-if="resourceItem.authors && resourceItem.authors.length > 0"
    >
      {{ resourceItem.authors.length > 1 ? "Contributors: " : "Contributor: " }}
      <b-tooltip
        v-for="author in resourceItem.authors"
        :key="author.name"
        :label="author.affiliation"
        position="is-bottom"
      >
        <span class="authors">{{ author.name || author }}</span>
      </b-tooltip>
    </p>
    <br />
    <span style="margin-top:3px;display: block;">
      <span v-for="t in resourceItem.tags" :key="t">
        <b-tag style="cursor: pointer;" rounded>{{ t }}</b-tag>
      </span>
    </span>
    <br />
    <p v-if="resourceItem.description">
      {{ resourceItem.description.slice(0, maxDescriptionLetters) }}
      <a
        v-if="resourceItem.description.length > maxDescriptionLetters"
        @click="maxDescriptionLetters = resourceItem.description.length"
        >...show all.</a
      >
    </p>
    <attachments
      :attachments="resourceItem.attachments"
      :focusTarget="resourceItem._focus"
    ></attachments>
    <div class="markdown-body">
      <markdown
        v-if="resourceItem.docs"
        :enable-run-buttons="true"
        :run-button-context="runButtonContext"
        :baseUrl="resourceItem.baseUrl"
        :content="resourceItem.docs.slice(0, maxDocsLetters)"
      ></markdown>

      <a
        v-if="resourceItem.docs && resourceItem.docs.length > maxDocsLetters"
        style="color: #0366d6;"
        @click="maxDocsLetters = resourceItem.docs.length"
        >+ click here to see the full documentation</a
      >

      <br />
      <test-run-form
        v-if="resourceItem.type === 'model' && modelAvailable"
        :resourceItem="resourceItem"
      >
      </test-run-form>
      <div
        class="not-available"
        v-if="resourceItem.type === 'model' && !modelAvailable"
      >
        This model is not available for testing.
      </div>

      <br />
      <div v-if="resourceItem.training_data_item">
        <h2>Training Data</h2>
        <resource-item-card
          @show-info="showResourceItemInfo(resourceItem.training_data_item)"
          :resourceItem="resourceItem.training_data_item"
        ></resource-item-card>
      </div>
      <h2>
        Test Summary
      </h2>
      <span v-if="resourceItem.type == 'model'">
        This {{ resourceItem.type }} can be used in:
        <app-icons :onlyLinked="true" :apps="resourceItem.apps"></app-icons>
        <br />
        <br />
      </span>
      <test-summary
        v-if="
          resourceItem.test_summary &&
            Object.keys(resourceItem.test_summary).length > 0
        "
        :summary="resourceItem.test_summary"
      ></test-summary>
      <h2 v-if="formatedCitation" id="citation">How to cite</h2>
      <ul v-if="formatedCitation" class="citation">
        <li v-for="c in formatedCitation" :key="c.text">
          {{ c.text }}
          <a v-if="c.url" :href="c.url" target="_blank">[{{ c.url_text }}]</a>
        </li>
      </ul>
    </div>
    <comment-box :title="resourceItem.name"></comment-box>
  </div>
  <h2 v-else>Resource not found: {{ resourceId }}</h2>
</template>

<script>
import yaml from "js-yaml";
import { mapState } from "vuex";
import Badges from "@/components/Badges.vue";
import AppIcons from "@/components/AppIcons.vue";
import Attachments from "@/components/Attachments.vue";
import Markdown from "@/components/Markdown.vue";
import TestSummary from "@/components/TestSummary.vue";
import CommentBox from "@/components/CommentBox.vue";
import { randId, concatAndResolveUrl } from "../utils";
import ResourceItemCard from "./ResourceItemCard";
import TestRunForm from "./TestRun.vue";

async function fetchTestSummary(url) {
  const response = await fetch(url);
  if (response.ok) {
    const yamlStr = await response.text();
    return yaml.load(yamlStr);
  } else {
    throw new Error(`Oops, failed to fetch test summary.`);
  }
}

// const bioengineTemplate = `
// <!-- ImJoyPlugin: { "type": "web-python"} -->
// \`\`\`python
// from imjoy import api

// class ImJoyPlugin():
//     async def setup(self):
//         pass
//     async def run(ctx):
//         runner = await api.loadPlugin("https://raw.githubusercontent.com/imjoy-team/bioimage-io-models/master/src/generic-bioengine-app.imjoy.html")
//         await runner.run(ctx)

// api.export(ImJoyPlugin())
// \`\`\`
// `;

export default {
  name: "ResourceItemInfo",
  props: {
    resourceItem: {
      type: Object,
      default: null
    },
    showResourceItemInfo: {
      type: Function,
      default: null
    }
  },
  components: {
    markdown: Markdown,
    "test-summary": TestSummary,
    badges: Badges,
    attachments: Attachments,
    "app-icons": AppIcons,
    "comment-box": CommentBox,
    "resource-item-card": ResourceItemCard,
    "test-run-form": TestRunForm
  },
  data() {
    return {
      maxDescriptionLetters: 100,
      maxDocsLetters: 500,
      showSource: false,
      modelAvailable: false
    };
  },

  mounted() {
    const focus = () => {
      if (this.resourceItem._focus) {
        const el = document.getElementById(this.resourceItem._focus);
        if (el) {
          el.parentNode.scrollTop = el.offsetTop - 40;
        }
      }
    };
    if (this.resourceItem.documentation)
      this.getDocs(this.resourceItem).then(focus);
    if (!this.resourceItem.test_summary) {
      // replace the trailing file name "rdf.yaml" into "test_summary.yaml"
      const url = this.resourceItem.source.replace(
        /rdf\.yaml$/,
        "test_summary.yaml"
      );
      fetchTestSummary(url).then(summary => {
        this.resourceItem.test_summary = summary;
        this.$forceUpdate();
      });
    }
    this.getManifestList();
  },
  computed: {
    runButtonContext: function() {
      return {
        config: {
          referer: window.location.href,
          mode: "one",
          type: "bioengine"
        },
        data: this.resourceItem
      };
    },
    formatedCitation: function() {
      let cites = this.resourceItem.cite;
      if (!cites || cites.length <= 0) return null;
      if (this.resourceItem.cite && !Array.isArray(this.resourceItem.cite)) {
        cites = [this.resourceItem.cite];
      }
      const citations = [];
      for (let c of cites) {
        if (typeof c === "string") {
          citations.push({
            text: c
          });
        } else {
          let url = c.url;
          let url_text = "link";
          if (c.doi) {
            if (c.doi.startsWith("http")) url = c.doi;
            else url = "https://doi.org/" + c.doi;
            url_text = "doi";
          }
          citations.push({
            text: c.text,
            url,
            url_text
          });
        }
      }
      return citations;
    },
    ...mapState({
      resourceItems: state => state.resourceItems,
      siteConfig: state => state.siteConfig
    })
  },
  methods: {
    copyText(value) {
      const tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = value;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      const data = {
        message: "Copied to your clipboard!",
        duration: 1000,
        queue: false
      };
      this.$buefy.snackbar.open(data);
    },
    async getDocs(resourceItem) {
      resourceItem.docs = "@loading...";
      try {
        let docsUrl;
        if (!resourceItem.documentation.startsWith("http"))
          docsUrl = concatAndResolveUrl(
            resourceItem.root_url,
            resourceItem.documentation
          );
        else {
          docsUrl = resourceItem.documentation;
        }
        if (docsUrl.includes("github.")) docsUrl = docsUrl + "?" + randId();
        const response = await fetch(docsUrl);
        if (response.status == 200) {
          const raw_docs = await response.text();
          let baseUrl;
          if (!resourceItem.documentation.startsWith("http")) {
            const temp = (
              resourceItem.root_url +
              "/" +
              resourceItem.documentation
            ).split("/");
            baseUrl = temp.slice(0, temp.length - 1).join("/");
          } else {
            const temp = resourceItem.documentation.split("/");
            baseUrl = temp.slice(0, temp.length - 1).join("/");
          }
          if (
            resourceItem.documentation.endsWith(".md") ||
            resourceItem.documentation.endsWith(".md/content")
          ) {
            resourceItem.baseUrl = baseUrl;
            resourceItem.docs = raw_docs;
          } else if (resourceItem.documentation) {
            resourceItem.docs = `### [Documentation](${resourceItem.documentation})`;
          }
        } else {
          resourceItem.docs = null;
        }
        this.$forceUpdate();
      } catch (e) {
        resourceItem.docs = null;
        this.$forceUpdate();
      } finally {
        if (resourceItem.docs) {
          // if(resourceItem.type === 'model')
          //   resourceItem.docs = resourceItem.docs + `\n${bioengineTemplate}`
          this.maxDocsLetters = resourceItem.docs
            .split("\n")
            .slice(0, 5)
            .join("\n").length;
        }
      }
    },
    async getManifestList() {
      const manifestUrl =
        "https://raw.githubusercontent.com/bioimage-io/bioengine-model-runner/gh-pages/manifest.bioengine.json";
      const list = await fetch(manifestUrl).then(r => r.json());
      const aviableModels = list.collection.map(m => m.id);
      this.modelAvailable = aviableModels.includes(this.resourceItem.id);
    }
  }
};
</script>
<style scoped>
.resource-item-info {
  padding: 20px;
  height: calc(100% - 50px);
  overflow: auto;
  overscroll-behavior: contain;
}

@media screen and (max-width: 768px) {
  .resource-item-info {
    padding: 5px;
  }
}
.card-image {
  max-height: 500px;
}
.citation {
  list-style-type: circle;
}
.cover-image {
  object-fit: contain;
}
.badge {
  display: inline-block;
  padding: 1px;
  margin-top: -5px;
  margin-bottom: -5px;
}
.tags:not(:last-child) {
  margin-bottom: -10px;
}
.authors {
  margin-left: 10px;
}
.resource-id {
  padding: 3px;
  font-size: 1.1rem;
  display: inline-block;
  margin-right: 5px;
}
.not-available {
  color: red;
}
</style>
