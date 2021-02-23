<template>
  <div class="attachments">
    <template v-for="(att_val, name) in normalizedAttachments">
      <h2
        style="font-size:1.5rem;font-weight: 600;margin-top: 24px;
    margin-bottom: 16px; text-transform:capitalize;"
        :id="name"
        v-if="att_val"
        :key="name + '_title'"
      >
        {{ name }}
      </h2>
      <b-table
        v-if="att_val"
        :data="convert2Array(att_val)"
        :key="name + '_table'"
        :detailed="!!att_val.type"
        :show-detail-icon="!!att_val.type"
      >
        <template slot-scope="props">
          <b-table-column
            v-for="col in availableColumns"
            :key="col.field"
            :field="col.field"
            :label="col.label"
            :width="col.width || 40"
            :sortable="col.sortable"
          >
            <template v-if="props.row[col.field]">
              <a
                v-if="col.type === 'url'"
                :class="col.class"
                :href="props.row[col.field]"
                target="_blank"
              >
                {{ col.text }}
              </a>
              <span :class="col.class" v-else>
                {{
                  props.row[col.field] &&
                    props.row[col.field].slice(0, col.max_length) +
                      (props.row[col.field].length > col.max_length
                        ? "..."
                        : "")
                }}
              </span>
            </template>
          </b-table-column>
        </template>
        <template slot="detail" slot-scope="props">
          <resource-item-card :resourceItem="props.row"></resource-item-card>
        </template>
      </b-table>
    </template>
  </div>
</template>

<script>
import ResourceItemCard from "./ResourceItemCard";
import siteConfig from "../../site.config.json";
export default {
  name: "Attachments",
  props: {
    attachments: {
      type: Object,
      default: null
    },
    focusTarget: {
      type: String,
      default: null
    }
  },
  components: {
    "resource-item-card": ResourceItemCard
  },
  data() {
    return {
      siteConfig: siteConfig,
      columns: []
    };
  },
  mounted() {
    // scroll into view
    setTimeout(() => {
      this.focus(this.focusTarget);
    }, 100);
  },
  watch: {
    focusTarget: function(newTarget) {
      this.focus(newTarget);
    }
  },
  computed: {
    availableColumns: function() {
      return siteConfig.attachment_table.columns.filter(c =>
        this.columns.includes(c.field)
      );
    },
    normalizedAttachments: function() {
      const converted = {};
      for (let k of Object.keys(this.attachments)) {
        const items = this.attachments[k];
        if (typeof items === "object") {
          const arr = [];
          for (let j of Object.keys(items)) {
            // make a shallow copy
            const item = Object.assign({}, items[j]);
            item.name = j;
            arr.push(item);
          }
          converted[k] = arr;
        } else {
          converted[k] = items;
        }
      }
      return converted;
    }
  },
  methods: {
    focus(target) {
      if (target) {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView();
        }
      }
    },
    convert2Array(obj) {
      const columns = [];
      this.columns = columns;
      if (obj instanceof Object && obj.constructor === Object) {
        const values = [];
        for (let k of Object.keys(obj)) {
          if (obj[k] instanceof Object) {
            obj[k]["id"] = k;
            values.push(obj[k]);
            for (let n of Object.keys(obj[k])) {
              if (!columns.includes(n)) columns.push(n);
            }
          } else {
            const temp = obj[k].split("/");
            const name = temp[temp.length - 1] || "undefined";
            values.push({ download_url: obj[k], name: name });
            if (!columns.includes("download_url")) columns.push("download_url");
            if (!columns.includes("name")) columns.push("name");
          }
        }
        return values;
      } else if (Array.isArray(obj)) {
        const values = [];
        for (let k = 0; k < obj.length; k++) {
          if (obj[k] instanceof Object) {
            obj[k]["id"] = k;
            values.push(obj[k]);
            for (let n of Object.keys(obj[k])) {
              if (!columns.includes(n)) columns.push(n);
            }
          } else {
            const temp = obj[k].split("/");
            // sometimes the url is ended with '/'
            const name =
              temp[temp.length - 1] || temp[temp.length - 2] || "undefined";
            values.push({ download_url: obj[k], name: name });
            if (!columns.includes("download_url")) columns.push("download_url");
            if (!columns.includes("name")) columns.push("name");
          }
        }
        return values;
      } else {
        console.warn("Failed to convert: ", obj);
        return [];
      }
    }
  }
};
</script>
<style scoped></style>
