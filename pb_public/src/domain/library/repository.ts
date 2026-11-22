import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type { EditionTypeRecord, LibraryCopyRecord, LoanHistoryRecord, PhysicalFormatRecord } from "./records";
export const libraryCopyRepository=new PocketBaseRepository<LibraryCopyRecord>("exemplares");
export const physicalFormatRepository=new PocketBaseRepository<PhysicalFormatRecord>("formatos_fisicos");
export const editionTypeRepository=new PocketBaseRepository<EditionTypeRecord>("tipos_edicao");
export const loanHistoryRepository=new PocketBaseRepository<LoanHistoryRecord>("historico_emprestimos");
