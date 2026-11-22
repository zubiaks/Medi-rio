/**
 * Fluxo coordenado dos empréstimos da Biblioteca física.
 * Estados confirmados no PocketBase: Emprestado, Atrasado, Devolvido,
 * Perdido, Danificado e Cancelado.
 */
import {
  libraryCopyRepository,
  loanHistoryRepository,
} from "./repository";
import type { LibraryCopyRecord, LoanHistoryRecord } from "./records";

export const LOAN_STATES = {
  borrowed: "Emprestado",
  late: "Atrasado",
  returned: "Devolvido",
  lost: "Perdido",
  damaged: "Danificado",
  cancelled: "Cancelado",
} as const;

export type LoanState = typeof LOAN_STATES[keyof typeof LOAN_STATES];
export interface StartLoanInput { pessoa:string; dataEmprestimo:string; dataPrevista:string; notas?:string }
export interface RenewLoanInput { dataPrevista:string; notas?:string }
export interface ReturnLoanInput { dataDevolucao:string; bomEstado:boolean; notas?:string }
export interface CloseLoanInput { data:string; notas:string }
export interface LoanContext { copy:LibraryCopyRecord; history:LoanHistoryRecord }

const activeStates: LoanState[] = [LOAN_STATES.borrowed, LOAN_STATES.late];
const errorMessage=(cause:unknown)=>cause instanceof Error?cause.message:String(cause);
function validateDates(start:string,due:string){if(!start)throw new Error("Indica a data do empréstimo.");if(!due)throw new Error("Indica a data prevista de devolução.");if(due<start)throw new Error("A devolução prevista não pode ser anterior ao empréstimo.")}
export function loanIsLate(history:Pick<LoanHistoryRecord,"estado"|"data_prevista"|"data_devolucao">,today=new Date().toISOString().slice(0,10)){return activeStates.includes(history.estado as LoanState)&&!history.data_devolucao&&Boolean(history.data_prevista&&history.data_prevista.slice(0,10)<today)}
export async function findActiveLoan(copyId:string){const result=await loanHistoryRepository.list({page:1,perPage:10,filter:`exemplar = "${copyId}" && (estado = "${LOAN_STATES.borrowed}" || estado = "${LOAN_STATES.late}")`,sort:"-data_emprestimo",expand:"pessoa"});return result.items[0]}
async function rollbackCopy(copyId:string,payload:Record<string,unknown>,cause:unknown):Promise<never>{try{await libraryCopyRepository.update(copyId,payload)}catch(rollback){throw new Error(`${errorMessage(cause)} O rollback do exemplar também falhou: ${errorMessage(rollback)}`)}throw cause}
export async function startLoan(copy:LibraryCopyRecord,input:StartLoanInput):Promise<LoanContext>{if(copy.emprestado)throw new Error("Este exemplar já está marcado como emprestado.");if(!input.pessoa)throw new Error("Seleciona a pessoa que recebe o exemplar.");validateDates(input.dataEmprestimo,input.dataPrevista);if(await findActiveLoan(copy.id))throw new Error("Já existe um empréstimo ativo para este exemplar.");const previous={emprestado:Boolean(copy.emprestado),emprestado_a:copy.emprestado_a||"",data_emprestimo:copy.data_emprestimo||"",data_prevista:copy.data_prevista||""};const updated=await libraryCopyRepository.update(copy.id,{emprestado:true,emprestado_a:input.pessoa,data_emprestimo:input.dataEmprestimo,data_prevista:input.dataPrevista});try{const history=await loanHistoryRepository.create({titulo:copy.titulo,exemplar:copy.id,pessoa:input.pessoa,estado:LOAN_STATES.borrowed,data_emprestimo:input.dataEmprestimo,data_prevista:input.dataPrevista,data_devolucao:"",renovacoes:0,devolvido_em_bom_estado:false,notas:input.notas?.trim()||""});return{copy:updated,history}}catch(cause){return rollbackCopy(copy.id,previous,cause)}}
export async function syncLateStatus(history:LoanHistoryRecord,today=new Date().toISOString().slice(0,10)){if(loanIsLate(history,today)&&history.estado!==LOAN_STATES.late)return loanHistoryRepository.update(history.id,{estado:LOAN_STATES.late});return history}
export async function renewLoan(copy:LibraryCopyRecord,history:LoanHistoryRecord,input:RenewLoanInput):Promise<LoanContext>{if(!copy.emprestado||!activeStates.includes(history.estado as LoanState))throw new Error("Este empréstimo já não está ativo.");validateDates(copy.data_emprestimo||history.data_emprestimo,input.dataPrevista);const previous=copy.data_prevista||"";const updated=await libraryCopyRepository.update(copy.id,{data_prevista:input.dataPrevista});try{const saved=await loanHistoryRepository.update(history.id,{estado:LOAN_STATES.borrowed,data_prevista:input.dataPrevista,renovacoes:(history.renovacoes||0)+1,notas:input.notas?.trim()||history.notas||""});return{copy:updated,history:saved}}catch(cause){return rollbackCopy(copy.id,{data_prevista:previous},cause)}}
export async function returnLoan(copy:LibraryCopyRecord,history:LoanHistoryRecord,input:ReturnLoanInput):Promise<LoanContext>{if(!copy.emprestado||!activeStates.includes(history.estado as LoanState))throw new Error("Este empréstimo já foi encerrado.");if(!input.dataDevolucao)throw new Error("Indica a data de devolução.");if(input.dataDevolucao<history.data_emprestimo.slice(0,10))throw new Error("A devolução não pode ser anterior ao empréstimo.");const previous={emprestado:true,emprestado_a:copy.emprestado_a||history.pessoa,data_emprestimo:copy.data_emprestimo||history.data_emprestimo,data_prevista:copy.data_prevista||history.data_prevista||""};const updated=await libraryCopyRepository.update(copy.id,{emprestado:false,emprestado_a:"",data_emprestimo:"",data_prevista:""});try{const saved=await loanHistoryRepository.update(history.id,{estado:input.bomEstado?LOAN_STATES.returned:LOAN_STATES.damaged,data_devolucao:input.dataDevolucao,devolvido_em_bom_estado:input.bomEstado,notas:input.notas?.trim()||history.notas||""});return{copy:updated,history:saved}}catch(cause){return rollbackCopy(copy.id,previous,cause)}}
export async function markLoanLost(copy:LibraryCopyRecord,history:LoanHistoryRecord,input:CloseLoanInput):Promise<LoanContext>{if(!copy.emprestado||!activeStates.includes(history.estado as LoanState))throw new Error("Este empréstimo já foi encerrado.");if(!input.notas.trim())throw new Error("Indica nas notas o motivo da perda.");const updated=await libraryCopyRepository.update(copy.id,{emprestado:false,emprestado_a:"",data_emprestimo:"",data_prevista:""});const saved=await loanHistoryRepository.update(history.id,{estado:LOAN_STATES.lost,data_devolucao:input.data,notas:input.notas.trim()});return{copy:updated,history:saved}}
export async function cancelLoan(copy:LibraryCopyRecord,history:LoanHistoryRecord,input:CloseLoanInput):Promise<LoanContext>{if(!copy.emprestado||!activeStates.includes(history.estado as LoanState))throw new Error("Este empréstimo já foi encerrado.");if(!input.notas.trim())throw new Error("Indica nas notas o motivo do cancelamento.");const updated=await libraryCopyRepository.update(copy.id,{emprestado:false,emprestado_a:"",data_emprestimo:"",data_prevista:""});const saved=await loanHistoryRepository.update(history.id,{estado:LOAN_STATES.cancelled,data_devolucao:input.data,notas:input.notas.trim()});return{copy:updated,history:saved}}
