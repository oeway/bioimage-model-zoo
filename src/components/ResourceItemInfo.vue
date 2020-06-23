<template>
  <div class="resource-item-info">
    <b-taglist
      class="badge"
      attached
      rounded
      v-for="badge in resourceItem.badges"
      :key="badge.body"
    >
      <b-tag :type="badge.body_type || 'is-dark'">{{ badge.body }}</b-tag>
      <b-tag :type="badge.ext_type || 'is-success'" v-if="badge.ext">{{
        badge.ext
      }}</b-tag>
    </b-taglist>

    <b-carousel
      style="max-width: 1024px; margin-top: -10px;"
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
          ? "Author(s): " + resourceItem.authors.join(",")
          : ""
      }}
    </span>
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

    <template v-for="(table, name) in siteConfig.tables">
      <h2
        style="font-size:1.5rem;font-weight: 600;margin-top: 24px;
    margin-bottom: 16px; text-transform:capitalize;"
        :id="name"
        v-if="resourceItem[name]"
        :key="name + '_title'"
      >
        {{ name }}
      </h2>
      <b-table
        v-if="resourceItem[name]"
        :data="convert2Array(resourceItem[name])"
        :key="name + '_table'"
        :detailed="table.detailed"
        :show-detail-icon="table.detailed"
      >
        <template slot-scope="props">
          <b-table-column
            v-for="col in table.columns"
            :key="col.field"
            :field="col.field"
            :label="col.label"
            :width="col.width || 40"
            :sortable="col.sortable"
          >
            <a
              v-if="col.type === 'url'"
              :class="col.class"
              :href="props.row[col.field]"
              target="_blank"
            >
              {{ col.text }}
            </a>
            <span :class="col.class" v-else>
              {{ props.row[col.field] }}
            </span>
          </b-table-column>
        </template>
        <template slot="detail" slot-scope="props">
          <article class="media">
            <figure class="media-left" v-if="table.detailed">
              <p class="image is-64x64">
                <img :src="table.detailed_image" />
              </p>
            </figure>
            <div class="media-content" v-if="table.detailed_body">
              <div class="content">
                <p>
                  {{ props.row[table.detailed_body] }}
                </p>
              </div>
            </div>
          </article>
        </template>
      </b-table>
    </template>
    <div class="markdown-body">
      <div v-if="resourceItem.docs" v-html="resourceItem.docs"></div>
      <br />
      <h2 v-if="formatedCitation" id="citation">How to cite</h2>
      <ul v-if="formatedCitation" class="citation">
        <li v-for="c in formatedCitation" :key="c.text">
          {{ c.text }} <a :href="c.url" target="_blank">[{{ c.url_text }}]</a>
        </li>
      </ul>
      <div
        id="source"
        v-if="resourceItem.yamlConfig"
        v-html="resourceItem.yamlConfig"
      ></div>
    </div>
  </div>
</template>

<script>
import "../../node_modules/github-markdown-css/github-markdown.css";
import "../../node_modules/highlight.js/styles/github.css";
import siteConfig from "../../site.config.json";
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
  data() {
    return {
      siteConfig: siteConfig,
      maxDescriptionLetters: 100
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
  mounted() {
    const focus = () => {
      if (this.resourceItem._focus) {
        const el = document.getElementById(this.resourceItem._focus);
        if (el) {
          el.parentNode.scrollTop = el.offsetTop - 40;
        }
      }
    };
    this.getDocs(this.resourceItem).then(focus);
    this.getYamlConfig(this.resourceItem).then(focus);
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
    convert2Array(obj) {
      if (obj instanceof Object && obj.constructor === Object) {
        const values = [];
        for (let k of Object.keys(obj)) {
          if (obj[k] instanceof Object) {
            obj[k]["id"] = k;
            values.push(obj[k]);
          } else {
            const temp = obj[k].split("/");
            const name = temp[temp.length - 1] || "undefined";
            values.push({ source: obj[k], name: name });
          }
        }
        return values;
      } else if (Array.isArray(obj)) {
        const values = [];
        for (let k = 0; k < obj.length; k++) {
          if (obj[k] instanceof Object) {
            obj[k]["id"] = k;
            values.push(obj[k]);
          } else {
            const temp = obj[k].split("/");
            // sometimes the url is ended with '/'
            const name =
              temp[temp.length - 1] || temp[temp.length - 2] || "undefined";
            values.push({ source: obj[k], name: name });
          }
        }
        return values;
      } else {
        console.warn("Failed to convert: ", obj);
        return [];
      }
    },
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
</style>
