/** Ficheiro: src/components/iptv/ChannelEditDialog.a11y.spec.ts | Testa diálogo e erros ARIA. */
import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { expectNoA11yViolations } from "@/test/accessibility";
import ChannelEditDialog from "./ChannelEditDialog.vue";
enableAutoUnmount(afterEach);
vi.mock("@/domain/repositories",()=>({channelRepository:{update:vi.fn(),list:vi.fn(async()=>({page:1,perPage:1,totalItems:0,totalPages:0,items:[]}))}}));
const channel={id:"channel-test-1",collectionId:"pbc_2614173453",collectionName:"canais_tv",created:"2026-11-21 00:00:00.000Z",updated:"2026-11-21 00:00:00.000Z",nome:"Canal de teste",url_stream:"https://example.com/live.m3u8",qualidade:"HD" as const,ativo:true,cemiterio:false};
function mountDialog(){return mount(ChannelEditDialog,{attachTo:document.body,props:{channel,countries:[],languages:[],tags:[],categories:[]}})}
describe("a11y: ChannelEditDialog",()=>{
 it("não apresenta violações automáticas",async()=>{const w=mountDialog();await flushPromises();await expectNoA11yViolations(w.element)});
 it("tem semântica de diálogo modal",()=>{const w=mountDialog();const d=w.get('[role="dialog"]');expect(d.attributes("aria-modal")).toBe("true");expect(d.attributes("aria-labelledby")).toBe("channel-edit-title")});
 it("assinala o nome vazio e associa a mensagem",async()=>{const w=mountDialog();await w.get("#channel-nome").setValue("");await w.get("form").trigger("submit");await nextTick();await flushPromises();const input=w.get("#channel-nome");expect(input.attributes("aria-invalid")).toBe("true");expect(input.attributes("aria-describedby")).toContain("nome-error");expect(w.get("#nome-error").text()).toContain("Indica o nome do canal")});
 it("apresenta um resumo de erros acessível",async()=>{const w=mountDialog();await w.get("#channel-nome").setValue("");await w.get("#channel-url_stream").setValue("");await w.get("form").trigger("submit");await flushPromises();const s=w.get(".form-error-summary");expect(s.attributes("role")).toBe("alert");expect(s.attributes("aria-live")).toBe("assertive")});
 it("o botão de fechar tem nome acessível",()=>expect(mountDialog().get('button[aria-label="Fechar"]').exists()).toBe(true));
});
