/**
 * Projeto: Mediário
 * Ficheiro: src/domain/library/repository.ts
 * Tipo: Registo de repositórios PocketBase.
 * Domínio: Biblioteca física.
 *
 * Finalidade:
 * Centraliza as coleções utilizadas pela Biblioteca e mantém as vistas e os
 * componentes afastados do cliente PocketBase directo.
 */
import { PocketBaseRepository } from "@/infrastructure/pocketbase/repository";
import type {
  EditionTypeRecord,
  LibraryCopyRecord,
  LoanHistoryRecord,
  PhysicalFormatRecord,
} from "./records";

export const libraryCopyRepository =
  new PocketBaseRepository<LibraryCopyRecord>("exemplares");

export const physicalFormatRepository =
  new PocketBaseRepository<PhysicalFormatRecord>("formatos_fisicos");

export const editionTypeRepository =
  new PocketBaseRepository<EditionTypeRecord>("tipos_edicao");

export const loanHistoryRepository =
  new PocketBaseRepository<LoanHistoryRecord>("historico_emprestimos");
