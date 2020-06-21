import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import ResourceItemList from "@/components/ResourceItemList.vue";
import { store } from "../../src/store";

describe("ResourceItemList.vue", () => {
  it("renders props.msg when passed", () => {
    const wrapper = shallowMount(ResourceItemList, {
      propsData: { $store: store }
    });
    expect(wrapper.text()).to.include("Layers");
  });
});
