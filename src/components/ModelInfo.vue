<template>
  <div class="model-info markdown-body">
    <b-carousel
      style="max-width: 1024px;"
      v-if="model.cover_images && model.cover_images.length > 0"
      :indicator="model.cover_images.length > 1"
      :arrow="model.cover_images.length > 1"
      :pause-info="false"
    >
      <b-carousel-item v-for="cover in model.cover_images" :key="cover">
        <figure class="image is-16by9">
          <img
            loading="lazy"
            :src="cover"
            :alt="model.name"
            class="cover-image"
            data-target="modal-image2"
          />
        </figure>
      </b-carousel-item>
    </b-carousel>
    <div v-if="model.docs" v-html="model.docs"></div>
    <div v-else>
      <p>This model has no documentation!</p>
    </div>
    <div v-if="model.yamlConfig" v-html="model.yamlConfig"></div>
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
  name: "ModelInfo",
  props: {
    model: {
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
    this.getDocs(this.model);
    this.getYamlConfig(this.model);
  },
  methods: {
    async getDocs(model) {
      model.docs = "@loading...";
      this.$forceUpdate();
      try {
        let docsUrl;
        if (!model.documentation.startsWith("http"))
          docsUrl = concatAndResolveUrl(model.root_url, model.documentation);
        else {
          docsUrl = model.documentation;
        }
        if (docsUrl.includes("github")) docsUrl = docsUrl + "?" + randId();
        const response = await fetch(docsUrl);
        if (response.status == 200) {
          const raw_docs = await response.text();
          let baseUrl;
          if (!this.model.documentation.startsWith("http")) {
            const temp = (
              this.model.root_url +
              "/" +
              this.model.documentation
            ).split("/");
            baseUrl = temp.slice(0, temp.length - 1).join("/");
          } else {
            const temp = this.model.documentation.split("/");
            baseUrl = temp.slice(0, temp.length - 1).join("/");
          }
          if (model.documentation.endsWith(".md")) {
            marked.setOptions({
              baseUrl
            });
            model.docs = DOMPurify.sanitize(
              replaceAllRelByAbs(marked(raw_docs), baseUrl)
            );
          } else {
            model.docs = DOMPurify.sanitize(
              replaceAllRelByAbs(raw_docs, baseUrl)
            );
          }
        } else {
          model.docs = null;
        }
        this.$forceUpdate();
      } catch (e) {
        model.docs = null;
        this.$forceUpdate();
      }
    },
    async getYamlConfig(model) {
      model.yamlConfig = "@loading...";
      this.$forceUpdate();
      try {
        let yamlUrl;
        if (!model.config_url.startsWith("http"))
          yamlUrl = concatAndResolveUrl(model.root_url, model.config_url);
        else {
          yamlUrl = model.config_url;
        }
        if (yamlUrl.includes("github")) yamlUrl = yamlUrl + "?" + randId();
        const response = await fetch(yamlUrl);
        if (response.status == 200) {
          const raw_docs = await response.text();
          model.yamlConfig = DOMPurify.sanitize(
            marked(
              "## Model Config\n[source](" +
                yamlUrl +
                ")\n```yaml\n" +
                raw_docs +
                " \n```"
            )
          );
        } else {
          model.yamlConfig = null;
        }
        this.$forceUpdate();
      } catch (e) {
        model.yamlConfig = null;
        this.$forceUpdate();
      }
    }
  }
};
</script>
<style scoped>
.model-info {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

@media screen and (max-width: 768px) {
  .model-info {
    padding: 5px;
  }
}
.card-image {
  max-height: 500px;
}
</style>
