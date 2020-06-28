<template>
  <div class="container partners">
    <h2>Community Partners</h2>
    <br />
    <b-carousel-list
      v-model="selectedPartnerIndex"
      :data="partners"
      :arrow="true"
      :arrow-hover="false"
      :items-to-list="1"
      :repeat="false"
      :has-drag="true"
      :has-grayscale="false"
      :has-opacity="false"
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
      selectedPartnerIndex: 0
    };
  },
  methods: {
    switchPartner(partner) {
      this.$emit("switchPartner", partner);
    }
  }
};
</script>
<style scoped>
.partners > h2 {
  margin-top: 10px;
  font-size: 1.7rem;
}
.partners {
  background-color: #313131d9;
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
.partner-logo {
  height: 100px;
  max-height: 100px;
  width: auto;
}

@media screen and (max-width: 500px) {
  .partner-logo {
    height: 60px;
  }
  .partners > h2 {
    font-size: 1.2rem;
  }
}

@media screen and (max-height: 600px) {
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
</style>
