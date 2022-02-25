<template>
  <div class="resource-item-info" v-if="resourceItem">
    <section style="margin-bottom: 10px">
      <app-icons :apps="resourceItem.apps"></app-icons>
      &nbsp;&nbsp;<badges :badges="resourceItem.badges"></badges>
    </section>
    <section>
      <pre class="resource-id">ID:</pre>
      <pre ref="resourceId" class="resource-id">{{ resourceItem.id }}</pre>
      <b-button
        size="is-small"
        icon-left="content-copy"
        @click="copyId(resourceItem.id)"
      ></b-button>
    </section>
    <b-carousel
      style="max-width: 1024px"
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
      {{ resourceItem.authors.length > 1 ? "Authors: " : "Author: " }}
      <b-tooltip
        v-for="author in resourceItem.authors"
        :key="author.name"
        :label="author.affiliation"
        position="is-bottom"
      >
        <span class="authors">{{ author.name }}</span>
      </b-tooltip>
    </p>
    <br />
    <span style="margin-top: 3px; display: block">
      <span v-for="t in resourceItem.tags" :key="t">
        <b-tag style="cursor: pointer" rounded>{{ t }}</b-tag>
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
        :baseUrl="resourceItem.baseUrl"
        :content="resourceItem.docs.slice(0, maxDocsLetters)"
      ></markdown>

      <a
        v-if="resourceItem.docs && resourceItem.docs.length > maxDocsLetters"
        style="color: #0366d6"
        @click="maxDocsLetters = resourceItem.docs.length"
        >+ click here to see the full documentation</a
      >

      <br />
      <h3 v-if="formatedCitation" id="citation">How to cite</h3>
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
import { mapState } from "vuex";
import Badges from "@/components/Badges.vue";
import AppIcons from "@/components/AppIcons.vue";
import Attachments from "@/components/Attachments.vue";
import Markdown from "@/components/Markdown.vue";
import CommentBox from "@/components/CommentBox.vue";
import { randId, concatAndResolveUrl } from "../utils";

export default {
  name: "ResourceItemInfo",
  props: {
    resourceItem: {
      type: Object,
      default: null,
    },
  },
  components: {
    markdown: Markdown,
    badges: Badges,
    attachments: Attachments,
    "app-icons": AppIcons,
    "comment-box": CommentBox,
  },
  data() {
    return {
      maxDescriptionLetters: 100,
      maxDocsLetters: 500,
      showSource: false,
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
  },
  computed: {
    formatedCitation: function () {
      let cites = this.resourceItem.cite;
      if (!cites || cites.length <= 0) return null;
      if (this.resourceItem.cite && !Array.isArray(this.resourceItem.cite)) {
        cites = [this.resourceItem.cite];
      }
      const citations = [];
      for (let c of cites) {
        if (typeof c === "string") {
          citations.push({
            text: c,
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
            url_text,
          });
        }
      }
      return citations;
    },
    ...mapState({
      resourceItems: (state) => state.resourceItems,
      siteConfig: (state) => state.siteConfig,
    }),
  },
  methods: {
    copyId(value) {
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
        queue: false,
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
          if (!this.resourceItem.documentation.startsWith("http")) {
            const temp = (
              this.resourceItem.root_url +
              "/" +
              this.resourceItem.documentation
            ).split("/");
            baseUrl = temp.slice(0, temp.length - 1).join("/");
          } else {
            const temp = this.resourceItem.documentation.split("/");
            baseUrl = temp.slice(0, temp.length - 1).join("/");
          }
          if (resourceItem.documentation.endsWith(".md")) {
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
        if (this.resourceItem.docs)
          this.maxDocsLetters = this.resourceItem.docs
            .split("\n")
            .slice(0, 5)
            .join("\n").length;
      }
    },
  },
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
</style>
