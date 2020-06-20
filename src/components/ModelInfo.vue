<template>
  <div class="model-info markdown-body">
    <div v-if="model.docs" v-html="model.docs"></div>
    <h4 v-else>
      {{ model && model.description }}
      <br />
      This model has no documentation!
    </h4>
  </div>
</template>

<script>
import "../../node_modules/github-markdown-css/github-markdown.css";
import "../../node_modules/highlight.js/styles/github.css";
import marked from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { randId } from "../utils";

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
  },
  methods: {
    async getDocs(model) {
      if (model.docs) return;
      model.docs = "@loading...";
      this.$forceUpdate();
      try {
        let docsUrl;
        if (!model.documentation.startsWith("http"))
          docsUrl = model.root_url + "/" + model.documentation;
        if (docsUrl.includes("github")) docsUrl = docsUrl + "?" + randId();

        const response = await fetch(docsUrl);
        if (response.status == 200) {
          const raw_docs = await response.text();
          if (model.documentation.endsWith(".md")) {
            model.docs = DOMPurify.sanitize(marked(raw_docs));
          } else {
            model.docs = DOMPurify.sanitize(raw_docs);
          }
        } else {
          model.docs = null;
        }
        this.$forceUpdate();
      } catch (e) {
        model.docs = "";
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
</style>
