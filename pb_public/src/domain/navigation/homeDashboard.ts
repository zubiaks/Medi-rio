import type { Permission } from "@/domain/auth/types";
export interface HomeDashboardLink{title:string;description:string;to:string;permission?:Permission;icon:string}
export const homeDashboardLinks:HomeDashboardLink[]=[
{title:"Catálogo",description:"Consultar títulos, pessoas e conteúdos.",to:"/catalogo",permission:"catalog.read",icon:"▣"},
{title:"Pesquisa global",description:"Pesquisar e descobrir em todo o Mediário.",to:"/pesquisa",permission:"catalog.read",icon:"⌕"},
{title:"Listas",description:"Listas manuais, inteligentes e sincronizadas.",to:"/listas",permission:"lists.use",icon:"☷"},
{title:"Diário",description:"Registar consumos, avaliações e notas.",to:"/diario",permission:"diary.use",icon:"◫"},
{title:"Providers",description:"TMDB, OMDb e fontes externas.",to:"/providers",permission:"providers.use",icon:"◇"},
{title:"Manutenção",description:"Tarefas, diagnóstico e operações técnicas.",to:"/manutencao",permission:"maintenance.use",icon:"⚙"},
{title:"Administração",description:"Segurança, credenciais e instalação.",to:"/administracao",permission:"users.manage",icon:"◆"}];
