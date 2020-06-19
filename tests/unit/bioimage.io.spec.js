import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import ModelList from "@/components/ModelList.vue";
import { store } from "../../src/store";

describe("ModelList.vue", () => {
  it("renders props.msg when passed", () => {
    const wrapper = shallowMount(ModelList, {
      propsData: { $store: store }
    });
    expect(wrapper.text()).to.include("Layers");
  });
});
