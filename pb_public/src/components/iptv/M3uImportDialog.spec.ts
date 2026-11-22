import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import { enableAutoUnmount,flushPromises,mount } from "@vue/test-utils";
import M3uImportDialog from "./M3uImportDialog.vue";
const mocks=vi.hoisted(()=>({channelCreate:vi.fn(),channelUpdate:vi.fn(),channelDelete:vi.fn(),sourceList:vi.fn(),sourceCreate:vi.fn(),categoryList:vi.fn(),categoryCreate:vi.fn()}));
vi.mock("@/domain/repositories",()=>({iptvChannelRepository:{create:mocks.channelCreate,update:mocks.channelUpdate,delete:mocks.channelDelete},iptvSourceRepository:{list:mocks.sourceList,create:mocks.sourceCreate},iptvCategoryRepository:{list:mocks.categoryList,create:mocks.categoryCreate}}));
enableAutoUnmount(afterEach);
const item=(url="https://x/new.m3u8")=>({name:"Canal Novo",url,tvgId:"canal-1",tvgName:"Canal Novo",tvgLogo:"",groupTitle:"",language:"",country:"",adult:false,selected:true,errors:[]});
const existing={id:"c1",created:"",updated:"",nome:"Canal Antigo",url_stream:"https://x/old.m3u8",tvg_id:"canal-1"};
const mountDialog=(channels:any[]=[])=>mount(M3uImportDialog,{attachTo:document.body,props:{open:true,existing:channels}});
beforeEach(()=>{Object.values(mocks).forEach(m=>m.mockReset());mocks.categoryList.mockResolvedValue({items:[]});mocks.sourceList.mockResolvedValue({items:[]});mocks.sourceCreate.mockResolvedValue({id:"s1"});});

describe("M3uImportDialog modos",()=>{
 it("mostra o plano antes de importar",async()=>{const w=mountDialog([existing as any]);(w.vm as any).items=[item(),{...item("https://x/novo"),tvgId:"novo"}];await w.vm.$nextTick();expect(w.text()).toContain("Plano da importação");expect(w.text()).toContain("1 novos");expect(w.text()).toContain("1 correspondentes")});
 it("modo criar apenas ignora canais correspondentes",async()=>{const w=mountDialog([existing as any]);(w.vm as any).items=[item()];(w.vm as any).importMode="create-only";await (w.vm as any).run();await flushPromises();expect(mocks.channelUpdate).not.toHaveBeenCalled();expect(mocks.sourceCreate).not.toHaveBeenCalled();expect(w.text()).toContain("1 ignoradas")});
 it("modo apenas fontes não altera metadados",async()=>{const w=mountDialog([existing as any]);(w.vm as any).items=[item()];(w.vm as any).importMode="sources-only";await (w.vm as any).run();expect(mocks.channelUpdate).not.toHaveBeenCalled();expect(mocks.sourceCreate).toHaveBeenCalledTimes(1)});
 it("modo sincronizar atualiza metadados e fontes",async()=>{const w=mountDialog([existing as any]);(w.vm as any).items=[item()];await (w.vm as any).run();expect(mocks.channelUpdate).toHaveBeenCalledTimes(1);expect(mocks.sourceCreate).toHaveBeenCalledTimes(1)});
});
