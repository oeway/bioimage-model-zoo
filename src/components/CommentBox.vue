<template>
  <div>
    <b-loading
      :is-full-page="false"
      :active.sync="loading"
      :can-cancel="false"
    ></b-loading>
  </div>
</template>

<script>
import siteConfig from "../../site.config.json";
export default {
  name: "CommentBox",
  props: {
    title: {
      type: String,
      default: null
    },
    repo: {
      type: String,
      default: siteConfig.model_repo
    },
    label: {
      type: String,
      default: "comment"
    }
  },
  mounted() {
    if (siteConfig.enable_comment) {
      this.loading = true;
      setTimeout(() => this.showCommentBox(), 200);
    }
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    showCommentBox() {
      this.loading = true;
      if (!this.title) {
        console.warn("You need to specify a title for the comment box");
        return;
      }
      // utteranc
      const title_backup = window.document.title;
      window.document.title = this.title;
      const utteranc = document.createElement("script");
      utteranc.src = "https://utteranc.es/client.js";
      utteranc.setAttribute("repo", this.repo);
      utteranc.setAttribute("issue-term", "title");
      utteranc.setAttribute("label", this.label);
      utteranc.setAttribute("theme", "github-light");
      utteranc.setAttribute("crossorigin", "anonymous");
      utteranc.setAttribute("async", true);
      // Fix github oauth redirection
      // see https://github.com/utterance/utterances/issues/140#issuecomment-479190093
      const originalUrl = window.location.href;
      const params = new URLSearchParams(window.location.search);
      for (let k of Object.keys(this.$route.query)) {
        params.set(k, this.$route.query[k]);
      }

      utteranc.onload = () => {
        window.document.title = title_backup;
        window.history.replaceState(null, "", originalUrl);
        this.loading = false;
      };

      const redirectUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", redirectUrl);
      this.$el.appendChild(utteranc);
    }
  }
};
</script>
<style scoped></style>
