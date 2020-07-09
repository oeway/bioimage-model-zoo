<template>
  <div class="container partners">
    <h2>Community Partners</h2>
    <b-carousel-list
      v-model="selectedPartnerIndex"
      :data="partners"
      :arrow="true"
      :arrow-hover="true"
      :items-to-list="1"
      :items-to-show="items2Show"
      :repeat="false"
      :has-drag="true"
      :has-grayscale="false"
      :has-opacity="false"
      icon-size="is-large"
    >
      <template slot="item" slot-scope="props">
        <figure class="image">
          <b-tooltip :label="props.list.name" position="is-right">
            <a @click="switchPartner(props.list)"
              ><img class="partner-logo" :src="props.list.icon"
            /></a>
          </b-tooltip>
        </figure>
      </template>
    </b-carousel-list>
  </div>
</template>

<script>
const ICON_WIDTH = 140;
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
      selectedPartnerIndex: 0,
      items2Show: window.innerWidth / ICON_WIDTH
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
      this.items2Show = window.innerWidth / ICON_WIDTH;
      this.$forceUpdate();
    },
    switchPartner(partner) {
      this.$emit("switchPartner", partner);
    }
  }
};
</script>
<style scoped>
.partners > h2 {
  margin-top: 2px;
  margin-bottom: 10px;
  font-size: 1.3rem;
  color: #407ae6;
}
.partners {
  background-color: #fdfdfdfd;
  text-align: center;
  width: 100vw;
  max-width: 100vw;
  position: absolute;
  bottom: 0px;
  right: 0px;
  left: 0px;
  margin-right: 0px;
  margin-left: 0px;
}
.carousel-list {
  padding-left: 30px;
  padding-right: 30px;
}
.partner-logo {
  height: 80px;
  max-height: 100px;
  width: auto;
  margin-bottom: 10px;
}

@media screen and (max-width: 500px) {
  .partner-logo {
    height: 60px;
  }
  .partners > h2 {
    font-size: 1.2rem;
  }
  .carousel-list {
    padding-left: 10px;
    padding-right: 10px;
  }
}

@media screen and (max-height: 500px) {
  .partners {
    height: 100px;
  }
  .partner-logo {
    height: 50px;
  }
  .partners > h2 {
    display: none;
  }
}
.carousel-list.has-shadow {
  box-shadow: unset !important;
}
</style>
