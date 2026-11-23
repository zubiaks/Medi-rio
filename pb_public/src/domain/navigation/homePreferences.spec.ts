import { describe, expect, it } from "vitest";
import { moveHomeBlock } from "./homePreferences";
describe("preferências do início",()=>{it("move blocos sem ultrapassar limites",()=>{expect(moveHomeBlock(["a","b"],"b",-1)).toEqual(["b","a"]);expect(moveHomeBlock(["a","b"],"a",-1)).toEqual(["a","b"]);});});
