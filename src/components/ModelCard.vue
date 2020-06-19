<template>
  <div class="model-card">
    <div class="card is-shady">
      <div class="card-image">
        <figure class="image is-16by9">
          <img
            loading="lazy"
            :src="model.cover_image"
            :alt="model.name"
            class="cover-image"
            data-target="modal-image2"
          />
        </figure>
      </div>
      <div class="card-content">
        <div class="content">
          <h4 class="model-title">{{ model.name }}</h4>
          <b-tooltip label="Download" class="download-btn" position="is-top">
            <b-button
              rounded
              :href="model.download_url"
              class="is-small action-btn"
            >
              <b-icon icon="download" size="is-small"> </b-icon>
            </b-button>
          </b-tooltip>

          <div class="buttons floating-buttons">
            <template v-for="app_key in model.applications">
              <b-tooltip
                :key="app_key"
                v-if="apps[app_key]"
                :label="apps[app_key].name"
                position="is-top"
              >
                <b-button
                  rounded
                  @click="runOneModel(apps[app_key], model)"
                  class="is-small action-btn"
                >
                  <b-icon
                    v-if="!apps[app_key].config.icon"
                    icon="puzzle"
                    size="is-small"
                  >
                  </b-icon>

                  <img
                    v-else-if="apps[app_key].config.icon.startsWith('http')"
                    class="app-icons"
                    :src="apps[app_key].config.icon"
                  />
                  <b-icon
                    v-else
                    :icon="apps[app_key].config.icon"
                    size="is-small"
                  >
                  </b-icon>
                </b-button>
              </b-tooltip>
            </template>
          </div>
          <span class="authors">
            {{ model.authors ? "by " + etAl(model.authors) : "" }}
          </span>
          <p class="model-description" v-if="model.description">
            {{ model.description.slice(0, 100) }}
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
    model: {
      type: Object,
      default: null
    },
    apps: {
      type: Object,
      default: null
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
.model-title {
  font-size: 1.2em;
  font-weight: 400;
}
.authors {
  font-size: 0.9em;
  font-weight: 600;
}
.model-description {
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
  max-height: 200px;
}
</style>
