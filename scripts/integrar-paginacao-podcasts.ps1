param(
  [string]$ViewPath = "D:\Mediário\pb_public\src\views\PodcastsView.vue"
)

$ErrorActionPreference = "Stop"
$content = [System.IO.File]::ReadAllText($ViewPath)

$replacements = @(
  @{
    Name = "podcasts"
    Pattern = '(?s)<nav\b[^>]*v-if="podcastPages\s*>\s*1"[^>]*class="pagination"[^>]*>.*?</nav>'
    Value = @'
<PodcastPagination
      :page="podcastPage"
      :pages="podcastPages"
      label="Paginação dos podcasts"
      @change="podcastPage = $event; loadPodcasts()"
    />
'@
  },
  @{
    Name = "episódios"
    Pattern = '(?s)<nav\b[^>]*v-if="episodePages\s*>\s*1"[^>]*class="pagination"[^>]*>.*?</nav>'
    Value = @'
<PodcastPagination
      :page="episodePage"
      :pages="episodePages"
      label="Paginação dos episódios"
      @change="episodePage = $event; loadEpisodes()"
    />
'@
  }
)

foreach ($item in $replacements) {
  $matches = [regex]::Matches($content, $item.Pattern)
  if ($matches.Count -ne 1) {
    throw "Esperava 1 paginação de $($item.Name), mas encontrei $($matches.Count)."
  }
  $content = [regex]::Replace($content, $item.Pattern, $item.Value.TrimEnd(), 1)
}

if ($content -notmatch 'import\s+PodcastPagination\s+from') {
  $scriptEnd = $content.IndexOf("</script>")
  if ($scriptEnd -lt 0) { throw "Não encontrei </script>." }
  $import = 'import PodcastPagination from "@/components/podcasts/PodcastPagination.vue";' + "`r`n"
  $content = $content.Insert($scriptEnd, $import)
}

[System.IO.File]::WriteAllText(
  $ViewPath,
  $content,
  [System.Text.UTF8Encoding]::new($false)
)

$newCount = ([regex]::Matches($content, '<PodcastPagination\b')).Count
$oldCount = ([regex]::Matches($content, 'class="pagination"')).Count

if ($newCount -ne 2 -or $oldCount -ne 0) {
  throw "Resultado inesperado: novos=$newCount; antigos=$oldCount."
}

Write-Host "[OK] Paginação avançada integrada: 2 componentes, 0 blocos antigos." -ForegroundColor Green
