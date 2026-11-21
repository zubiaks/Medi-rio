/** Ficheiro: GridDensityControl.a11y.spec.ts | Testa o controlo acessível de densidade. */
import { afterEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import GridDensityControl from "./GridDensityControl.vue";
enableAutoUnmount(afterEach);
describe("a11y: GridDensityControl",()=>{
  it("não tem violações automáticas",async()=>{
    const wrapper=mount(GridDensityControl,{attachTo:document.body,props:{modelValue:5,"onUpdate:modelValue":()=>{}}});
    await expectNoA11yViolations(wrapper.element);
  });
  it("permite escolher seis cartões",async()=>{
    const wrapper=mount(GridDensityControl,{props:{modelValue:5,"onUpdate:modelValue":(value:number)=>wrapper.setProps({modelValue:value})}});
    await wrapper.findAll('input[type="radio"]')[4].setValue(true);
    expect(wrapper.props("modelValue")).toBe(6);
  });
});
