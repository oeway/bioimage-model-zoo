<template>
  <div class="container attachments">
    <template v-for="(att_val, name) in attachments">
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
        :detailed="true"
        :show-detail-icon="true"
      >
        <template slot-scope="props">
          <b-table-column
            v-for="col in siteConfig.attachment_table.columns"
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
                {{ props.row[col.field] }}
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
      siteConfig: siteConfig
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
    }
  }
};
</script>
<style scoped></style>
