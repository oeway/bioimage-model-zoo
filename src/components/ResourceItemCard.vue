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
            <app-icons
              :apps="resourceItem.apps"
              :enableHover="!isTouchDevice"
            ></app-icons>
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
          <badges class="badges" :badges="resourceItem.badges"></badges>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Badges from "./Badges";
import AppIcons from "./AppIcons";
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
  components: {
    badges: Badges,
    "app-icons": AppIcons
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
.resource-item-card {
  max-width: 500px;
}
.card {
  height: 360px;
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

.floating-buttons {
  position: absolute;
  top: 0px;
  left: 5px;
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

.badges {
  position: absolute;
  left: 5px;
  bottom: 5px;
}
</style>
