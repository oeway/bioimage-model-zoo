<template>
  <div class="markdown-body">
    <div v-if="docs" v-html="docs"></div>
  </div>
</template>

<script>
import "../../node_modules/github-markdown-css/github-markdown.css";
import "../../node_modules/highlight.js/styles/github.css";
import marked from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";

import { replaceAllRelByAbs } from "../utils";

export default {
  name: "Markdown",
  props: {
    baseUrl: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      docs: null
    };
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
  watch: {
    content: function(newContent) {
      this.docs = DOMPurify.sanitize(
        replaceAllRelByAbs(marked(newContent), this.baseUrl)
      );
    },
    baseUrl: function(newBaseUrl) {
      this.baseUrl = newBaseUrl;

      this.docs = DOMPurify.sanitize(
        replaceAllRelByAbs(marked(this.content), this.baseUrl)
      );
    },
    url: function(newUrl) {
      if (!newUrl) return;

      this.showDocsUrl(newUrl);
    }
  },
  mounted() {
    marked.setOptions({
      baseUrl: this.baseUrl
    });
    if (this.content)
      this.docs = DOMPurify.sanitize(
        replaceAllRelByAbs(marked(this.content), this.baseUrl)
      );
    else if (this.url) {
      this.showDocsUrl(this.url);
    }
  },
  methods: {
    async showDocsUrl(url) {
      this.docs = "@loading...";
      const response = await fetch(url);
      if (response.status == 200) {
        const temp = url.split("/");
        const baseUrl = temp.slice(0, temp.length - 1).join("/");
        const content = await response.text();
        this.docs = DOMPurify.sanitize(
          replaceAllRelByAbs(marked(content), baseUrl)
        );
      } else {
        this.docs = "Oops! Failed to load from " + url;
      }
    }
  }
};
</script>
<style scoped></style>
