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
          style="background-color: black;width: 100%;height:160px;"
          class="cover-image"
        />
      </div>
      <div class="card-content">
        <div class="content">
          <h4 class="resource-item-title" @click="showResourceItemInfo">
            <img
              v-if="icon.type === 'img'"
              style="border-radius: 4px; background: #ffffffd0;"
              class="item-icon"
              :src="icon.src"
            />
            <img
              v-else-if="icon.type === 'animal'"
              class="item-icon"
              style="border-radius: 50%;background: #167cf0b8;"
              :src="'/static/anonymousAnimals/' + icon.src + '.png'"
            />
            <b-icon
              v-else
              style="height:22px;"
              :icon="icon.src"
              size="is-small"
            />
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
                  tag="a"
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
          <div class="badges" v-if="resourceItem.badges">
            <a
              class="badge"
              v-for="badge in resourceItem.badges"
              :key="badge.body"
              :href="badge.url"
              @click="!badge.url && badge.run && badge.run()"
            >
              <b-taglist attached rounded>
                <b-tag :type="badge.body_type || 'is-dark'">{{
                  badge.body
                }}</b-tag>
                <b-tag
                  :type="badge.ext_type || 'is-success'"
                  v-if="badge.ext"
                  >{{ badge.ext }}</b-tag
                >
              </b-taglist>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { anonymousAnimals } from "../utils";
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
  max-width: 500px;
}
.card-image {
  height: 160px;
}
.card-content {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 4px;
}
.resource-item-title {
  margin-top: 6px;
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
  margin-top: 3px;
}

.button.is-small {
  border-radius: 30px;
  font-size: 0.8rem;
  background-color: rgba(255, 255, 255, 0.85);
  color: #2196f3;
}
.cover-image {
  height: 160px;
  max-height: 180px;
  object-fit: contain;
}
.carousel-image {
  max-height: 180px;
  background: black;
  text-align: center;
}
.item-icon {
  position: absolute;
  top: 125px;
  display: inline-block;
  margin-top: auto;
  margin-bottom: auto;
  border: 3px solid #00000000;
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
.badges {
  position: absolute;
  left: 5px;
  bottom: 5px;
}
a.badge {
  display: inline-block;
  padding: 1px;
}
</style>
