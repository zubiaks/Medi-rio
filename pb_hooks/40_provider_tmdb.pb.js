/**
 * Mediário
 * Caminho: pb_hooks/40_provider_tmdb.pb.js
 * Versão do ficheiro: 1.6.0
 * Tipo: Hook PocketBase
 * Domínio: Providers / TMDB
 * Finalidade: Pesquisa e detalhe avançado TMDB sem expor credenciais.
 * Autor: Zubiaks <zubiaks@hotmail.com>
 * Licença: PolyForm Noncommercial License 1.0.0
 */
/// <reference path="../pb_data/types.d.ts" />


const tmdbRateState = {};
function requireTmdbUser(e) {
  const auth = e.auth;
  const role = auth ? String(auth.get("role") || "") : "";
  const state = auth ? String(auth.get("estado") || "") : "";
  if (!auth) throw new UnauthorizedError("É necessário iniciar sessão.");
  if (state && state !== "ativo") throw new ForbiddenError("A conta não está ativa.");
  if (["admin", "editor"].indexOf(role) < 0) {
    throw new ForbiddenError("A conta não tem permissão para utilizar providers.");
  }
  const key = auth.id;
  const now = Date.now();
  const window = tmdbRateState[key] || { started: now, count: 0 };
  if (now - window.started >= 60000) { window.started = now; window.count = 0; }
  window.count += 1;
  tmdbRateState[key] = window;
  if (window.count > 40) throw new TooManyRequestsError("Limite de pedidos TMDB atingido. Tenta novamente dentro de um minuto.");
}

routerAdd("GET", "/api/mediario/providers/tmdb/search", (e) => {
  requireTmdbUser(e);
  const query = (e.request.url.query().get("query") || "").trim();
  const mediaType = (e.request.url.query().get("type") || "multi").trim();
  const page = Math.max(1, parseInt(e.request.url.query().get("page") || "1", 10));
  if (query.length < 2) throw new BadRequestError("A pesquisa deve ter pelo menos dois caracteres.");
  const setting = $app.findFirstRecordByFilter("app_settings", 'chave = "tmdb_api_key_v3"');
  const rawValue = setting.get("valor");
  let decodedValue = rawValue;
  if (rawValue && typeof rawValue !== "string" && typeof rawValue.length === "number") {
    let jsonText = "";
    for (let index = 0; index < rawValue.length; index += 1) jsonText += String.fromCharCode(rawValue[index]);
    try { decodedValue = JSON.parse(jsonText); } catch (_) { decodedValue = jsonText; }
  }
  let apiKey = typeof decodedValue === "string" ? decodedValue : decodedValue && (decodedValue.key || decodedValue.value || decodedValue.api_key || decodedValue.tmdb_api_key_v3);
  apiKey = String(apiKey || "").trim().replace(/^"|"$/g, "");
  if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) throw new BadRequestError("A chave TMDB v3 configurada tem um formato inválido.");
  const allowedTypes = ["multi", "movie", "tv", "person"];
  const endpointType = allowedTypes.indexOf(mediaType) >= 0 ? mediaType : "multi";
  const response = $http.send({ url: "https:" + "//api.themoviedb.org/3/search/" + endpointType + "?api_key=" + encodeURIComponent(apiKey) + "&language=pt-PT&include_adult=false&page=" + page + "&query=" + encodeURIComponent(query), method: "GET", headers: { accept: "application/json" }, timeout: 30 });
  if (response.statusCode !== 200) throw new BadRequestError("O TMDB respondeu com o estado HTTP " + response.statusCode + ".");
  const results = (response.json.results || []).map((item) => ({ id: item.id, media_type: item.media_type || endpointType, title: item.title || item.name || "Sem título", original_title: item.original_title || item.original_name || "", date: item.release_date || item.first_air_date || "", overview: item.overview || "", poster_url: item.poster_path ? "https:" + "//image.tmdb.org/t/p/w342" + item.poster_path : "", backdrop_url: item.backdrop_path ? "https:" + "//image.tmdb.org/t/p/w780" + item.backdrop_path : "", vote_average: item.vote_average || 0, popularity: item.popularity || 0 }));
  return e.json(200, { page: response.json.page || page, total_pages: response.json.total_pages || 1, total_results: response.json.total_results || results.length, results });
});

routerAdd("GET", "/api/mediario/providers/tmdb/details/{type}/{id}", (e) => {
  requireTmdbUser(e);
  const mediaType = e.request.pathValue("type");
  const externalId = e.request.pathValue("id");
  if (["movie", "tv"].indexOf(mediaType) < 0 || !/^\d+$/.test(externalId)) throw new BadRequestError("Identificador ou tipo TMDB inválido.");
  const setting = $app.findFirstRecordByFilter("app_settings", 'chave = "tmdb_api_key_v3"');
  const rawValue = setting.get("valor");
  let decodedValue = rawValue;
  if (rawValue && typeof rawValue !== "string" && typeof rawValue.length === "number") {
    let jsonText = "";
    for (let index = 0; index < rawValue.length; index += 1) jsonText += String.fromCharCode(rawValue[index]);
    try { decodedValue = JSON.parse(jsonText); } catch (_) { decodedValue = jsonText; }
  }
  let apiKey = typeof decodedValue === "string" ? decodedValue : decodedValue && (decodedValue.key || decodedValue.value || decodedValue.api_key || decodedValue.tmdb_api_key_v3);
  apiKey = String(apiKey || "").trim().replace(/^"|"$/g, "");
  if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) throw new BadRequestError("A chave TMDB v3 configurada tem um formato inválido.");
  const response = $http.send({ url: "https:" + "//api.themoviedb.org/3/" + mediaType + "/" + externalId + "?api_key=" + encodeURIComponent(apiKey) + "&language=pt-PT&append_to_response=external_ids,keywords,videos,release_dates,content_ratings,credits,alternative_titles", method: "GET", headers: { accept: "application/json" }, timeout: 30 });
  if (response.statusCode !== 200) throw new BadRequestError("O TMDB respondeu com o estado HTTP " + response.statusCode + ".");
  const item = response.json;
  const keywordBox = item.keywords || {};
  const keywords = keywordBox.keywords || keywordBox.results || [];
  const videos = (item.videos && item.videos.results) || [];
  const trailer = videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.iso_639_1 === "pt") || videos.find((video) => video.site === "YouTube" && video.type === "Trailer");
  let certification = "";
  if (mediaType === "movie") {
    const releases = (item.release_dates && item.release_dates.results) || [];
    const country = releases.find((entry) => entry.iso_3166_1 === "PT") || releases.find((entry) => entry.iso_3166_1 === "US");
    const release = country && country.release_dates ? country.release_dates.find((entry) => entry.certification) : null;
    certification = release ? release.certification : "";
  } else {
    const ratings = (item.content_ratings && item.content_ratings.results) || [];
    const rating = ratings.find((entry) => entry.iso_3166_1 === "PT") || ratings.find((entry) => entry.iso_3166_1 === "US");
    certification = rating ? rating.rating : "";
  }
  const externalIds = item.external_ids || {};
  return e.json(200, {
    id: item.id, media_type: mediaType, title: item.title || item.name || "Sem título", original_title: item.original_title || item.original_name || "", date: item.release_date || item.first_air_date || "", overview: item.overview || "", tagline: item.tagline || "", runtime: item.runtime || null, episode_run_time: item.episode_run_time || [], status: item.status || "", genres: item.genres || [], imdb_id: item.imdb_id || externalIds.imdb_id || "", poster_url: item.poster_path ? "https:" + "//image.tmdb.org/t/p/w500" + item.poster_path : "", backdrop_url: item.backdrop_path ? "https:" + "//image.tmdb.org/t/p/original" + item.backdrop_path : "", vote_average: item.vote_average || 0, vote_count: item.vote_count || 0, popularity: item.popularity || 0, original_language: item.original_language || "", homepage: item.homepage || "",
    production_countries: item.production_countries || [], spoken_languages: item.spoken_languages || [], production_companies: (item.production_companies || []).map((company) => ({ id: company.id, name: company.name || "", origin_country: company.origin_country || "", logo_url: company.logo_path ? "https:" + "//image.tmdb.org/t/p/w300" + company.logo_path : "" })), belongs_to_collection: item.belongs_to_collection ? { id: item.belongs_to_collection.id, name: item.belongs_to_collection.name || "", poster_url: item.belongs_to_collection.poster_path ? "https:" + "//image.tmdb.org/t/p/w500" + item.belongs_to_collection.poster_path : "", backdrop_url: item.belongs_to_collection.backdrop_path ? "https:" + "//image.tmdb.org/t/p/original" + item.belongs_to_collection.backdrop_path : "" } : null, keywords, certification, trailer_youtube_key: trailer ? trailer.key : "", number_of_seasons: item.number_of_seasons || 0, number_of_episodes: item.number_of_episodes || 0,
    credits: {
      cast: (((item.credits || {}).cast) || []).slice(0, 50).map((credit) => ({ id: credit.id, credit_id: credit.credit_id || "", name: credit.name || "", character: credit.character || "", order: credit.order || 0, popularity: credit.popularity || 0, profile_url: credit.profile_path ? "https:" + "//image.tmdb.org/t/p/w300" + credit.profile_path : "", department: credit.known_for_department || "Acting" })),
      crew: (((item.credits || {}).crew) || []).filter((credit) => ["Director", "Writer", "Screenplay", "Teleplay", "Creator"].indexOf(credit.job) >= 0).slice(0, 50).map((credit) => ({ id: credit.id, credit_id: credit.credit_id || "", name: credit.name || "", job: credit.job || "", department: credit.department || "", popularity: credit.popularity || 0, profile_url: credit.profile_path ? "https:" + "//image.tmdb.org/t/p/w300" + credit.profile_path : "" })),
    },
    alternative_titles: ((((item.alternative_titles || {}).titles) || ((item.alternative_titles || {}).results) || []).map((title) => ({ name: title.title || "", country: title.iso_3166_1 || "", type: title.type || "" })).filter((title) => title.name)),
  });
});


routerAdd("GET", "/api/mediario/providers/tmdb/season/{id}/{season}", (e) => {
  requireTmdbUser(e);
  const externalId = e.request.pathValue("id");
  const seasonNumber = e.request.pathValue("season");
  if (!/^\d+$/.test(externalId) || !/^\d+$/.test(seasonNumber)) {
    throw new BadRequestError("Identificador TMDB ou temporada inválidos.");
  }
  const setting = $app.findFirstRecordByFilter("app_settings", 'chave = "tmdb_api_key_v3"');
  const rawValue = setting.get("valor");
  let decodedValue = rawValue;
  if (rawValue && typeof rawValue !== "string" && typeof rawValue.length === "number") {
    let jsonText = "";
    for (let index = 0; index < rawValue.length; index += 1) jsonText += String.fromCharCode(rawValue[index]);
    try { decodedValue = JSON.parse(jsonText); } catch (_) { decodedValue = jsonText; }
  }
  let apiKey = typeof decodedValue === "string" ? decodedValue : decodedValue && (decodedValue.key || decodedValue.value || decodedValue.api_key || decodedValue.tmdb_api_key_v3);
  apiKey = String(apiKey || "").trim().replace(/^"|"$/g, "");
  if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) throw new BadRequestError("A chave TMDB v3 configurada tem um formato inválido.");
  const response = $http.send({
    url: "https:" + "//api.themoviedb.org/3/tv/" + externalId + "/season/" + seasonNumber + "?api_key=" + encodeURIComponent(apiKey) + "&language=pt-PT",
    method: "GET",
    headers: { accept: "application/json" },
    timeout: 30,
  });
  if (response.statusCode !== 200) throw new BadRequestError("O TMDB respondeu com o estado HTTP " + response.statusCode + ".");
  const item = response.json;
  return e.json(200, {
    id: item.id,
    season_number: item.season_number,
    name: item.name || "",
    overview: item.overview || "",
    air_date: item.air_date || "",
    poster_url: item.poster_path ? "https:" + "//image.tmdb.org/t/p/w500" + item.poster_path : "",
    episodes: (item.episodes || []).map((episode) => ({
      id: episode.id,
      episode_number: episode.episode_number,
      name: episode.name || "",
      overview: episode.overview || "",
      air_date: episode.air_date || "",
      runtime: episode.runtime || 0,
      vote_average: episode.vote_average || 0,
      thumbnail_url: episode.still_path ? "https:" + "//image.tmdb.org/t/p/w780" + episode.still_path : "",
    })),
  });
});


routerAdd("GET", "/api/mediario/providers/tmdb/images/{type}/{id}", (e) => {
  requireTmdbUser(e);
  const mediaType = e.request.pathValue("type");
  const externalId = e.request.pathValue("id");
  if (["movie", "tv"].indexOf(mediaType) < 0 || !/^\d+$/.test(externalId)) {
    throw new BadRequestError("Identificador ou tipo TMDB inválido.");
  }
  const setting = $app.findFirstRecordByFilter("app_settings", 'chave = "tmdb_api_key_v3"');
  const rawValue = setting.get("valor");
  let decodedValue = rawValue;
  if (rawValue && typeof rawValue !== "string" && typeof rawValue.length === "number") {
    let jsonText = "";
    for (let index = 0; index < rawValue.length; index += 1) jsonText += String.fromCharCode(rawValue[index]);
    try { decodedValue = JSON.parse(jsonText); } catch (_) { decodedValue = jsonText; }
  }
  let apiKey = typeof decodedValue === "string" ? decodedValue : decodedValue && (decodedValue.key || decodedValue.value || decodedValue.api_key || decodedValue.tmdb_api_key_v3);
  apiKey = String(apiKey || "").trim().replace(/^"|"$/g, "");
  if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) throw new BadRequestError("A chave TMDB v3 configurada tem um formato inválido.");
  const response = $http.send({
    url: "https:" + "//api.themoviedb.org/3/" + mediaType + "/" + externalId + "/images?api_key=" + encodeURIComponent(apiKey) + "&include_image_language=pt,en,null",
    method: "GET",
    headers: { accept: "application/json" },
    timeout: 30,
  });
  if (response.statusCode !== 200) throw new BadRequestError("O TMDB respondeu com o estado HTTP " + response.statusCode + ".");
  const mapImage = (item, size) => ({
    file_path: item.file_path || "",
    url: item.file_path ? "https:" + "//image.tmdb.org/t/p/" + size + item.file_path : "",
    preview_url: item.file_path ? "https:" + "//image.tmdb.org/t/p/w342" + item.file_path : "",
    language: item.iso_639_1 || "",
    width: item.width || 0,
    height: item.height || 0,
    vote_average: item.vote_average || 0,
  });
  return e.json(200, {
    posters: (response.json.posters || []).slice(0, 40).map((item) => mapImage(item, "original")),
    backdrops: (response.json.backdrops || []).slice(0, 40).map((item) => mapImage(item, "original")),
    logos: (response.json.logos || []).slice(0, 40).map((item) => mapImage(item, "original")),
  });
});


routerAdd("GET", "/api/mediario/providers/tmdb/discovery/{type}/{id}/{mode}", (e) => {
  requireTmdbUser(e);
  const mediaType = e.request.pathValue("type");
  const externalId = e.request.pathValue("id");
  const mode = e.request.pathValue("mode");
  const page = Math.max(1, parseInt(e.request.url.query().get("page") || "1", 10));
  if (["movie", "tv"].indexOf(mediaType) < 0 || !/^\d+$/.test(externalId)) {
    throw new BadRequestError("Identificador ou tipo TMDB inválido.");
  }
  if (["recommendations", "similar"].indexOf(mode) < 0) {
    throw new BadRequestError("Modo de descoberta TMDB inválido.");
  }
  const setting = $app.findFirstRecordByFilter("app_settings", 'chave = "tmdb_api_key_v3"');
  const rawValue = setting.get("valor");
  let decodedValue = rawValue;
  if (rawValue && typeof rawValue !== "string" && typeof rawValue.length === "number") {
    let jsonText = "";
    for (let index = 0; index < rawValue.length; index += 1) jsonText += String.fromCharCode(rawValue[index]);
    try { decodedValue = JSON.parse(jsonText); } catch (_) { decodedValue = jsonText; }
  }
  let apiKey = typeof decodedValue === "string" ? decodedValue : decodedValue && (decodedValue.key || decodedValue.value || decodedValue.api_key || decodedValue.tmdb_api_key_v3);
  apiKey = String(apiKey || "").trim().replace(/^"|"$/g, "");
  if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) throw new BadRequestError("A chave TMDB v3 configurada tem um formato inválido.");
  const response = $http.send({
    url: "https:" + "//api.themoviedb.org/3/" + mediaType + "/" + externalId + "/" + mode + "?api_key=" + encodeURIComponent(apiKey) + "&language=pt-PT&page=" + page,
    method: "GET",
    headers: { accept: "application/json" },
    timeout: 30,
  });
  if (response.statusCode !== 200) throw new BadRequestError("O TMDB respondeu com o estado HTTP " + response.statusCode + ".");
  const results = (response.json.results || []).slice(0, 20).map((item) => ({
    id: item.id,
    media_type: mediaType,
    title: item.title || item.name || "Sem título",
    original_title: item.original_title || item.original_name || "",
    date: item.release_date || item.first_air_date || "",
    overview: item.overview || "",
    poster_url: item.poster_path ? "https:" + "//image.tmdb.org/t/p/w342" + item.poster_path : "",
    backdrop_url: item.backdrop_path ? "https:" + "//image.tmdb.org/t/p/w780" + item.backdrop_path : "",
    vote_average: item.vote_average || 0,
    popularity: item.popularity || 0,
  }));
  return e.json(200, {
    page: response.json.page || page,
    total_pages: response.json.total_pages || 1,
    total_results: response.json.total_results || results.length,
    results,
  });
});
