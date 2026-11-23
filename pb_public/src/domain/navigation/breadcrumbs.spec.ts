import { describe, expect, it } from "vitest";
import { routeBreadcrumbs } from "./breadcrumbs";
describe("breadcrumbs",()=>{it("inclui catálogo nos detalhes",()=>{expect(routeBreadcrumbs({name:"catalog-detail",meta:{}} as any)).toEqual([{label:"Início",to:"/"},{label:"Catálogo",to:"/catalogo"},{label:"Detalhe do título"}]);});});
