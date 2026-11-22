import { describe, expect, it } from "vitest";
import { buildM3uImportPlan } from "./m3uImportPlan";
import type { M3uItem } from "./m3u";

const item = (name:string,url:string,tvgId=name,errors:string[]=[]) => ({ name,url,tvgId,tvgName:name,tvgLogo:"",groupTitle:"",language:"",country:"",adult:false,selected:!errors.length,errors }) as M3uItem;

describe("buildM3uImportPlan",()=>{
  it("separa novos, correspondentes, duplicados e inválidos",()=>{
    const plan=buildM3uImportPlan([
      item("Existente","https://x/new","id-1"),
      item("Novo","https://x/novo","id-2"),
      item("Duplicado","https://x/novo","id-3"),
      item("Inválido","","id-4",["URL inválido"]),
    ],[{id:"c1",created:"",updated:"",nome:"Existente",url_stream:"https://x/old",tvg_id:"id-1"}] as any);
    expect(plan).toEqual({total:4,valid:2,invalid:1,newChannels:1,matchedChannels:1,internalDuplicates:1});
  });
});
