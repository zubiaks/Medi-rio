/**
 * Mediário
 * Caminho: pb_hooks/60_provider_admin.pb.js
 * Versão: 1.0.0
 * Domínio: Providers / configuração segura
 * Finalidade: Editar, remover e testar credenciais através do backend local.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 */
/// <reference path="../pb_data/types.d.ts" />

const providerDefinitions = {
  tmdb: { credentialKey: "tmdb_api_key_v3", label: "TMDB", defaultRpm: 30 },
  omdb: { credentialKey: "omdb_api_key", label: "OMDb", defaultRpm: 20 },
};

function providerDefinition(name) {
  const definition = providerDefinitions[name];
  if (!definition) throw new BadRequestError("Provider não suportado.");
  return definition;
}

function settingRecord(key) {
  try {
    return $app.findFirstRecordByFilter("app_settings", "chave = {:key}", { key });
  } catch (_) {
    return null;
  }
}

function decodeSetting(record) {
  if (!record) return null;
  const raw = record.get("valor");
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string" || typeof raw === "boolean" || typeof raw === "number") return raw;
  if (typeof raw.length === "number") {
    let text = "";
    for (let index = 0; index < raw.length; index += 1) text += String.fromCharCode(raw[index]);
    try { return JSON.parse(text); } catch (_) { return text; }
  }
  return raw;
}

function credentialValue(provider) {
  const definition = providerDefinition(provider);
  const value = decodeSetting(settingRecord(definition.credentialKey));
  if (typeof value === "string") return value.trim().replace(/^"|"$/g, "");
  return String(value && (value.key || value.value || value.api_key || "") || "").trim();
}

function mask(value) {
  if (!value) return "";
  const finalPart = value.slice(-4);
  return "••••••••" + finalPart;
}

function saveSetting(key, value) {
  let record = settingRecord(key);
  if (!record) {
    const collection = $app.findCollectionByNameOrId("app_settings");
    record = new Record(collection);
    record.set("chave", key);
  }
  record.set("valor", value);
  $app.save(record);
  return record;
}

function safeProvider(provider) {
  const definition = providerDefinition(provider);
  const credential = credentialValue(provider);
  const operational = decodeSetting(settingRecord("provider_" + provider + "_settings")) || {};
  return {
    provider,
    label: definition.label,
    enabled: operational.enabled !== false,
    credential_configured: Boolean(credential),
    credential_masked: mask(credential),
    language: String(operational.language || "pt-PT"),
    fallback_language: String(operational.fallback_language || "en"),
    timeout_seconds: Math.max(5, Math.min(60, parseInt(operational.timeout_seconds || "30", 10))),
    requests_per_minute: Math.max(1, Math.min(40, parseInt(operational.requests_per_minute || definition.defaultRpm, 10))),
    retries: Math.max(0, Math.min(5, parseInt(operational.retries || "2", 10))),
  };
}

routerAdd("GET", "/api/mediario/providers/admin/settings", (e) => {
  return e.json(200, {
    providers: Object.keys(providerDefinitions).map(safeProvider),
  });
});

routerAdd("PUT", "/api/mediario/providers/admin/settings/{provider}", (e) => {
  const provider = e.request.pathValue("provider");
  const definition = providerDefinition(provider);
  const body = new DynamicModel({
    enabled: false,
    language: "",
    fallback_language: "",
    timeout_seconds: 0,
    requests_per_minute: 0,
    retries: 0,
  });
  e.bindBody(body);
  saveSetting("provider_" + provider + "_settings", {
    enabled: Boolean(body.enabled),
    language: String(body.language || "pt-PT").slice(0, 10),
    fallback_language: String(body.fallback_language || "en").slice(0, 10),
    timeout_seconds: Math.max(5, Math.min(60, parseInt(body.timeout_seconds || 30, 10))),
    requests_per_minute: Math.max(1, Math.min(40, parseInt(body.requests_per_minute || definition.defaultRpm, 10))),
    retries: Math.max(0, Math.min(5, parseInt(body.retries || 2, 10))),
  });
  return e.json(200, safeProvider(provider));
});

routerAdd("POST", "/api/mediario/providers/admin/settings/{provider}/credential", (e) => {
  const provider = e.request.pathValue("provider");
  const definition = providerDefinition(provider);
  const body = new DynamicModel({ credential: "" });
  e.bindBody(body);
  const credential = String(body.credential || "").trim().replace(/^"|"$/g, "");
  if (!credential) throw new BadRequestError("Indica uma credencial não vazia.");
  if (provider === "tmdb" && !/^[a-fA-F0-9]{32}$/.test(credential)) {
    throw new BadRequestError("A chave TMDB v3 tem de conter 32 caracteres hexadecimais.");
  }
  saveSetting(definition.credentialKey, credential);
  return e.json(200, safeProvider(provider));
});

routerAdd("DELETE", "/api/mediario/providers/admin/settings/{provider}/credential", (e) => {
  const provider = e.request.pathValue("provider");
  const definition = providerDefinition(provider);
  const record = settingRecord(definition.credentialKey);
  if (record) $app.delete(record);
  return e.json(200, safeProvider(provider));
});

routerAdd("POST", "/api/mediario/providers/admin/settings/{provider}/test", (e) => {
  const provider = e.request.pathValue("provider");
  const credential = credentialValue(provider);
  if (!credential) throw new BadRequestError("A credencial ainda não está configurada.");
  let url = "";
  if (provider === "tmdb") {
    url = "https:" + "//api.themoviedb.org/3/movie/348?api_key=" + encodeURIComponent(credential) + "&language=pt-PT";
  } else {
    url = "https:" + "//www.omdbapi.com/?apikey=" + encodeURIComponent(credential) + "&i=tt0078748&r=json";
  }
  const response = $http.send({ url, method: "GET", headers: { accept: "application/json" }, timeout: 30 });
  const ok = response.statusCode === 200 && response.json && response.json.Response !== "False";
  if (!ok) throw new BadRequestError("A credencial foi recusada pelo provider.");
  return e.json(200, {
    ok: true,
    provider,
    message: "Ligação ao " + providerDefinition(provider).label + " validada.",
  });
});
