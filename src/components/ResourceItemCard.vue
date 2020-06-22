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
            <img v-if="icon.type === 'img'" class="item-icon" :src="icon.src" />
            <img
              v-else-if="icon.type === 'animal'"
              class="item-icon"
              :src="'/static/anonymousAnimals/' + icon.src + '.png'"
            />
            <b-icon v-else :icon="icon.src" size="is-small" />
            <span>{{ resourceItem.name }}</span>
          </h4>
          <div class="buttons floating-buttons">
            <template v-for="app in resourceItem.apps">
              <b-tooltip
                :class="{ 'hover-show': app.show_on_hover && !isTouchDevice }"
                :key="app.name"
                :label="app.name"
                position="is-top"
              >
                <b-button
                  rounded
                  :tag="app.url ? 'a' : 'button'"
                  :href="app.url"
                  target="_blank"
                  @click="!app.url && app.run && app.run()"
                  class="is-small action-btn"
                >
                  <b-icon v-if="!app.icon" icon="puzzle" size="is-small">
                  </b-icon>
                  <img
                    v-else-if="app.icon.startsWith('http')"
                    class="app-icon"
                    :style="{ 'margin-top': isSafari ? '-1px' : '3px' }"
                    :src="app.icon"
                  />
                  <b-icon v-else :icon="app.icon" size="is-small"> </b-icon>
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
import { anonymousAnimals } from "../utils";
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isTouchDevice = (function() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
})();

export default {
  name: "ModelCard",
  props: {
    resourceItem: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isSafari: isSafari,
      isTouchDevice: isTouchDevice
    };
  },
  computed: {
    icon: function() {
      if (this.resourceItem.icon) {
        if (this.resourceItem.icon.startsWith("http")) {
          return { type: "img", src: this.resourceItem.icon };
        }
        if (anonymousAnimals.indexOf(this.resourceItem.icon) >= 0) {
          return {
            type: "animal",
            src: this.resourceItem.icon
          };
        } else {
          return { type: "material", src: this.resourceItem.icon };
        }
      } else {
        let sum = 0;
        if (this.resourceItem.name)
          for (let i = 0; i < this.resourceItem.name.length; i++) {
            sum = sum + this.resourceItem.name.charCodeAt(i);
          }
        const selectedIcon = anonymousAnimals[sum % anonymousAnimals.length];
        return {
          type: "animal",
          src: selectedIcon
        };
      }
    }
  },
  methods: {
    etAl(authors) {
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
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 4px;
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
.action-btn .icon {
  font-size: 1.4rem;
}
.floating-buttons {
  position: absolute;
  top: 5px;
  left: 10px;
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
.cover-image {
  max-height: 100%;
  object-fit: cover;
}
.carousel-image {
  max-height: 200px;
  background: black;
  text-align: center;
}
.item-icon {
  display: inline-block;
  margin-top: auto;
  margin-bottom: auto;
  border-radius: 50%;
  border: 3px solid #00000000;
  background: #167cf0b8;
  margin-right: 4px;
  width: 32px;
  max-width: 100px;
}

.hover-show {
  opacity: 0;
  transition: 0.3s ease;
}

.card:hover .hover-show {
  opacity: 1;
  transition: 0.3s ease;
}
</style>
