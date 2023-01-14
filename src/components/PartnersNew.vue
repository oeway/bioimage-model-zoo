<template>
  <div class="partners-component">
    <h2>Community Partners</h2>
    <div class="partners-list">
      <div v-for="p in partners" :key="p.name" class='partners-list-item' @click='switchPartner(p)'>
        <img :src="p.logo || p.icon" :alt="p.name">
        <p>{{ p.name }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Partners",
  props: {
    partners: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      icon_width: 140,
      selectedPartnerIndex: 0,
      items2Show: window.innerWidth / 140
    };
  },
  mounted() {
    window.addEventListener("resize", this.updateSize);
    window.dispatchEvent(new Event("resize"));
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateSize);
  },
  methods: {
    updateSize() {
      if (window.innerWidth < 512) {
        this.icon_width = 80;
      } else {
        this.icon_width = 140;
      }
      this.items2Show = window.innerWidth / this.icon_width;
      this.$forceUpdate();
    },
    switchPartner(partner) {
      this.$emit("switchPartner", partner);
    }
  }
};
</script>
<style scoped>
.partners-component > h2 {
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #2196f3;
}
.partners-component {
  width: 100%;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  background-color: white;
  text-align: center;
  right: 0px;
  left: 0px;
}

.partners-list {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.partners-list-item {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 6rem;
  cursor: pointer;
}

.partners-list-item > img {
  height: 2.5rem;
  width: auto;
}

.partners-list-item > p {
  color: #2196f3;
  margin-top: 0.4rem;
  font-size: 0.75rem;
}

@media screen and (max-width: 500px) {
  .partners-list {
    flex-wrap: wrap;
  }

  .partners-list-item {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>
