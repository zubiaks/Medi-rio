/** Ficheiro: src/test/setup.ts | Prepara jsdom para Vue e axe-core. */
import { config } from "@vue/test-utils";
config.global.stubs = { Teleport: true };
if (typeof window !== "undefined" && !window.matchMedia) Object.defineProperty(window, "matchMedia", { writable: true, value: (query: string) => ({ matches:false, media:query, onchange:null, addListener:()=>{}, removeListener:()=>{}, addEventListener:()=>{}, removeEventListener:()=>{}, dispatchEvent:()=>false }) });
