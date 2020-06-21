<template>
  <div class="resource-item-card">
    <div class="card is-shady">
      <div class="card-image">
        <b-carousel
          v-if="
            resourceItem.cover_images && resourceItem.cover_images.length > 0
          "
          :indicator="resourceItem.cover_images.length > 1"
          :arrow="resourceItem.cover_images.length > 1"
          :pause-info="false"
        >
          <b-carousel-item
            class="carousel-image"
            v-for="cover in resourceItem.cover_images"
            :key="cover"
          >
            <img
              loading="lazy"
              :src="cover"
              :alt="resourceItem.name"
              class="cover-image"
              data-target="modal-image2"
            />
          </b-carousel-item>
        </b-carousel>
        <img
          v-else
          style="background-color: black;width: 100%;height:180px;"
          class="cover-image"
        />
      </div>
      <div class="card-content">
        <div class="content">
          <h4 class="resource-item-title" @click="showResourceItemInfo">
            {{ resourceItem.name }}
          </h4>
          <b-tooltip
            v-if="resourceItem.download_url"
            label="Download"
            class="download-btn"
            position="is-top"
          >
            <b-button
              tag="a"
              rounded
              :href="resourceItem.download_url"
              class="is-small action-btn"
            >
              <b-icon icon="download" size="is-small"> </b-icon>
            </b-button>
          </b-tooltip>

          <div class="buttons floating-buttons">
            <template v-for="app in apps">
              <b-tooltip :key="app.name" :label="app.name" position="is-top">
                <b-button
                  rounded
                  @click="runOneModel(app, resourceItem)"
                  class="is-small action-btn"
                >
                  <b-icon v-if="!app.config.icon" icon="puzzle" size="is-small">
                  </b-icon>

                  <img
                    v-else-if="app.config.icon.startsWith('http')"
                    class="app-icons"
                    :src="app.config.icon"
                  />
                  <b-icon v-else :icon="app.config.icon" size="is-small">
                  </b-icon>
                </b-button>
              </b-tooltip>
            </template>
          </div>
          <span class="authors">
            {{
              resourceItem.authors && resourceItem.authors.length > 0
                ? "by " + etAl(resourceItem.authors)
                : ""
            }}
          </span>
          <p class="resource-item-description" v-if="resourceItem.description">
            {{
              resourceItem.description.slice(0, 100) +
                (resourceItem.description.length > 100 ? "..." : "")
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModelCard",
  props: {
    resourceItem: {
      type: Object,
      default: null
    },
    apps: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    etAl: authors => {
      authors = authors.map(author => {
        return author.split(";")[0];
      });
      if (authors.length < 3) {
        return authors.join(", ");
      } else {
        return authors.slice(0, 3).join(", ") + " et al.";
      }
    },
    showResourceItemInfo() {
      this.$emit("show-info", this.resourceItem);
    }
  }
};
</script>
<style scoped>
.card {
  height: 360px;
}
.card-content {
  padding: 1rem;
}
.resource-item-title {
  font-size: 1.2em;
  font-weight: 400;
  cursor: pointer;
  color: #2196f3;
}
.authors {
  font-size: 0.9em;
  font-weight: 600;
}
.resource-item-description {
  font-size: 0.9em;
}
.action-btn {
  width: 33px;
}
.floating-buttons {
  position: absolute;
  left: 10px;
  bottom: -15px;
}
.app-icons {
  width: 20px !important;
  max-width: 20px;
  padding-top: 5px;
}
.button.is-small {
  border-radius: 30px;
  font-size: 0.8rem;
  background-color: #d2ebffc7;
  color: rgb(25, 25, 26);
}
.cover-image {
  max-height: 100%;
  object-fit: cover;
}
.carousel-image {
  max-height: 200px;
  background: black;
  text-align: center;
}
</style>
