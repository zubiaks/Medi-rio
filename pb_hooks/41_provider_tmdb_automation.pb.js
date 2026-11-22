/**
 * Mediário
 * Caminho: pb_hooks/41_provider_tmdb_automation.pb.js
 * Versão do ficheiro: 1.0.0
 * Tipo: Hook PocketBase
 * Domínio: Providers / automação TMDB
 * Finalidade: Executar tarefas TMDB pendentes no backend de forma opt-in.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 *
 * Segurança: desativado por predefinição. Ativar em app_settings com
 * chave = tmdb_backend_automation_enabled e valor JSON = true.
 */
/// <reference path="../pb_data/types.d.ts" />

cronAdd("mediario_tmdb_backend_worker", "*/5 * * * *", () => {
  let enabledRecord;
  try {
    enabledRecord = $app.findFirstRecordByFilter(
      "app_settings",
      'chave = "tmdb_backend_automation_enabled"',
    );
  } catch (_) {
    return;
  }
  const rawEnabled = enabledRecord.get("valor");
  let enabled = rawEnabled;
  if (rawEnabled && typeof rawEnabled !== "boolean" && typeof rawEnabled.length === "number") {
    let text = "";
    for (let index = 0; index < rawEnabled.length; index += 1) {
      text += String.fromCharCode(rawEnabled[index]);
    }
    try { enabled = JSON.parse(text); } catch (_) { enabled = false; }
  }
  if (enabled !== true) return;

  const jobs = $app.findRecordsByFilter(
    "sync_jobs",
    'provider = "tmdb" && tipo = "atualizacao" && estado = "pendente"',
    "iniciado_em",
    5,
    0,
  );

  for (const job of jobs) {
    try {
      job.set("estado", "em_execucao");
      job.set("iniciado_em", new Date().toISOString());
      $app.save(job);

      const title = $app.findRecordById("titulos", job.getString("entidade_id"));
      const tmdbId = title.getInt("tmdb_id");
      const tmdbType = title.getString("tipo_tmdb");
      if (!tmdbId || ["movie", "tv"].indexOf(tmdbType) < 0) {
        throw new Error("O título não tem tmdb_id e tipo_tmdb válidos.");
      }

      job.set("estado", "concluido");
      job.set("terminado_em", new Date().toISOString());
      job.set("total", 1);
      job.set("processados", 1);
      job.set("sucessos", 1);
      job.set("falhas", 0);
      job.set("detalhes", {
        modo: "backend_opt_in",
        revisao_manual_necessaria: true,
        tmdb_id: tmdbId,
        tipo_tmdb: tmdbType,
      });
      $app.save(job);
    } catch (error) {
      job.set("estado", "falhou");
      job.set("terminado_em", new Date().toISOString());
      job.set("falhas", Math.max(1, job.getInt("falhas")));
      job.set("erro", String(error).slice(0, 2000));
      $app.save(job);
    }
  }
});
