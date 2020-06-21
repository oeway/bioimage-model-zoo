<template>
  <div class="resource-item-info markdown-body">
    <b-carousel
      style="max-width: 1024px;"
      v-if="resourceItem.cover_images && resourceItem.cover_images.length > 0"
      :indicator="resourceItem.cover_images.length > 1"
      :arrow="resourceItem.cover_images.length > 1"
      :pause-info="false"
    >
      <b-carousel-item v-for="cover in resourceItem.cover_images" :key="cover">
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
    <span class="authors">
      {{
        resourceItem.authors && resourceItem.authors.length > 0
          ? "Authors: " + resourceItem.authors.join(",")
          : ""
      }}
    </span>
    <br />
    <span v-for="t in resourceItem.tags" :key="t">
      <b-tag style="cursor: pointer;" rounded>{{ t }}</b-tag>
    </span>
    <br />
    <p v-if="resourceItem.description">{{ resourceItem.description }}</p>
    <div v-if="resourceItem.docs" v-html="resourceItem.docs"></div>
    <br />
    <h2 v-if="formatedCitation">How to cite</h2>
    <ul v-if="formatedCitation" class="citation">
      <li v-for="c in formatedCitation" :key="c.text">
        {{ c.text }} <a :href="c.url" target="_blank">{{ c.url_text }}</a>
      </li>
    </ul>
    <div v-if="resourceItem.yamlConfig" v-html="resourceItem.yamlConfig"></div>
  </div>
</template>

<script>
import "../../node_modules/github-markdown-css/github-markdown.css";
import "../../node_modules/highlight.js/styles/github.css";
import marked from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { randId, concatAndResolveUrl, replaceAllRelByAbs } from "../utils";

export default {
  name: "ResourceItemInfo",
  props: {
    resourceItem: {
      type: Object,
      default: null
    }
  },
  created() {
    //open link in a new tab
    const renderer = new marked.Renderer();
    renderer.link = function(href, title, text) {
      var link = marked.Renderer.prototype.link.call(this, href, title, text);
      return link.replace("<a", "<a target='_blank' ");
    };
    renderer.image = function(href, title, text) {
      var link = marked.Renderer.prototype.image.call(this, href, title, text);
      return link.replace("/./", "/");
    };
    marked.setOptions({
      renderer: renderer,
      highlight: function(code) {
        return hljs.highlightAuto(code).value;
      }
    });
    DOMPurify.addHook("afterSanitizeAttributes", function(node) {
      // set all elements owning target to target=_blank
      if ("target" in node) {
        node.setAttribute("target", "_blank");
        // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
  },
  mounted() {
    this.getDocs(this.resourceItem);
    this.getYamlConfig(this.resourceItem);
  },
  computed: {
    formatedCitation: function() {
      let cites = this.resourceItem.cite;
      if (!cites) return null;
      if (this.resourceItem.cite && !Array.isArray(this.resourceItem.cite)) {
        cites = [this.resourceItem.cite];
      }
      const citations = [];
      for (let c of cites) {
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
      return citations;
    }
  },
  methods: {
    async getDocs(resourceItem) {
      resourceItem.docs = "@loading...";
      this.$forceUpdate();
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
        if (docsUrl.includes("github")) docsUrl = docsUrl + "?" + randId();
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
            marked.setOptions({
              baseUrl
            });
            resourceItem.docs = DOMPurify.sanitize(
              replaceAllRelByAbs(marked(raw_docs), baseUrl)
            );
          } else {
            resourceItem.docs = DOMPurify.sanitize(
              replaceAllRelByAbs(raw_docs, baseUrl)
            );
          }
        } else {
          resourceItem.docs = null;
        }
        this.$forceUpdate();
      } catch (e) {
        resourceItem.docs = null;
        this.$forceUpdate();
      }
    },
    async getYamlConfig(resourceItem) {
      resourceItem.yamlConfig = "@loading...";
      this.$forceUpdate();
      try {
        let yamlUrl;
        if (!resourceItem.source.startsWith("http"))
          yamlUrl = concatAndResolveUrl(
            resourceItem.root_url,
            resourceItem.source
          );
        else {
          yamlUrl = resourceItem.source;
        }
        if (yamlUrl.includes("github")) yamlUrl = yamlUrl + "?" + randId();
        const response = await fetch(yamlUrl);
        if (response.status == 200) {
          const raw_docs = await response.text();
          resourceItem.yamlConfig = DOMPurify.sanitize(
            marked(
              "## [Source](" + yamlUrl + ")\n```yaml\n" + raw_docs + " \n```"
            )
          );
        } else {
          resourceItem.yamlConfig = null;
        }
        this.$forceUpdate();
      } catch (e) {
        resourceItem.yamlConfig = null;
        this.$forceUpdate();
      }
    }
  }
};
</script>
<style scoped>
.resource-item-info {
  padding: 20px;
  height: 100%;
  overflow: auto;
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
</style>
