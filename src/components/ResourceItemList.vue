<template>
  <div class="resource-item-list">
    <div class="container content-wrapper">
      <div class="columns is-multiline" v-if="displayMode === 'card'">
        <div
          v-for="item in allItems"
          :key="item.name"
          class="column is-4-desktop is-3-widescreen is-half-tablet"
        >
          <resource-item-card
            @show-info="showResourceItemInfo"
            :resourceItem="item"
          ></resource-item-card>
        </div>
        <span
          style="text-align: center;"
          class="column"
          v-if="allItems && allItems.length === 0"
          >The list is empty.</span
        >
      </div>
      <b-table
        v-else
        :data="allItems"
        :detailed="true"
        :show-detail-icon="true"
      >
        <template slot-scope="props">
          <b-table-column
            v-if="siteConfig.table_view.columns.includes('name')"
            label="Name"
            width="20"
            field="name"
            sortable
          >
            <a @click="showResourceItemInfo(props.row)">
              {{ props.row.name }}
            </a>
          </b-table-column>
          <b-table-column
            v-if="siteConfig.table_view.columns.includes('authors')"
            label="Author(s)"
            width="20"
            sortable
            field="authors"
          >
            <span>
              {{ props.row.authors.join(", ") }}
            </span>
          </b-table-column>
          <b-table-column
            v-if="siteConfig.table_view.columns.includes('badges')"
            label="Badges"
            width="50"
            field="badges"
            sortable
          >
            <div class="badges" v-if="props.row.badges">
              <a
                class="badge"
                v-for="badge in props.row.badges"
                :key="badge.label"
                :href="badge.url"
                target="_blank"
                @click="!badge.url && badge.run && badge.run()"
              >
                <b-taglist v-if="!badge.icon" attached rounded>
                  <b-tag :type="badge.label_type || 'is-dark'">{{
                    badge.label
                  }}</b-tag>
                  <b-tag
                    :type="badge.ext_type || 'is-success'"
                    v-if="badge.ext"
                    >{{ badge.ext }}</b-tag
                  >
                </b-taglist>
                <img v-else :alt="badge.label" :src="badge.icon" />
              </a>
            </div>
          </b-table-column>
          <b-table-column
            v-if="siteConfig.table_view.columns.includes('apps')"
            label="Apps"
            width="30"
            field="apps"
            sortable
          >
            <app-icons :apps="props.row.apps"></app-icons>
          </b-table-column>
        </template>
        <template slot="detail" slot-scope="props">
          <resource-item-card
            @show-info="showResourceItemInfo"
            :resourceItem="props.row"
          ></resource-item-card>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import AppIcons from "./AppIcons";
import ResourceItemCard from "./ResourceItemCard";
import siteConfig from "../../site.config.json";
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

Vue.component("label-selector", {
  props: ["all-labels"],
  template: document.getElementById("label-selector")
});

export default {
  name: "ResourceItemList",
  components: {
    "resource-item-card": ResourceItemCard,
    "app-icons": AppIcons
  },
  props: {
    allItems: {
      type: Array,
      default: null
    },
    displayMode: {
      type: String,
      default: "card"
    }
  },
  computed: {
    filteredItems: function() {
      const covered = this.allItems.filter(item => item.cover_image);
      const items = covered.concat(
        this.allItems.filter(item => !item.cover_image)
      );
      return items.filter(item =>
        this.filters.every(label => item.allLabels.includes(label))
      );
    }
  },
  data() {
    return {
      isSafari: isSafari,
      siteConfig: siteConfig
    };
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    showResourceItemInfo(minfo) {
      this.$emit("show-resource-item-info", minfo);
    }
  }
};
</script>

<style lang="css" scoped>
.resource-item-list {
  min-height: 60vh;
}
.badges {
  left: 5px;
  bottom: 5px;
}
a.badge {
  display: inline-block;
  padding: 1px;
}
.action-btn {
  width: 33px;
}
.action-btn .icon {
  font-size: 1.4rem;
}

.app-icon {
  width: 22px !important;
  max-width: 22px;
}

.button.is-small {
  border-radius: 30px;
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.85);
  color: #2196f3;
}
</style>
