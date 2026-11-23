# ZIP 12B — sincronização, backup e restauro

## Listas remotas

O dashboard apresenta `Listas da conta`, carregadas diretamente do PocketBase. O editor permite alterar nome, descrição e fixação, sincronizar itens e eliminar uma lista remota.

Antes de guardar, o módulo volta a carregar o registo e compara `updated`. Se outro browser tiver alterado a lista, a escrita é bloqueada para evitar perda silenciosa.

## Backups

Scripts incluídos:

- `scripts/Backup-Mediario.ps1`
- `scripts/Test-MediarioBackup.ps1`
- `scripts/Restore-Mediario.ps1`

O backup contém um manifesto JSON com SHA-256, tamanho e caminho de cada ficheiro.

### Criar

```powershell
Set-Location "D:\Mediário"
.\scripts\Backup-Mediario.ps1
```

### Validar

```powershell
.\scripts\Test-MediarioBackup.ps1 -Backup "D:\Mediário\backups\mediario-backup-AAAAmmdd-HHmmss.zip"
```

### Restaurar

Para o PocketBase antes do restauro:

```powershell
Stop-Process -Name pocketbase -Force
.\scripts\Restore-Mediario.ps1 -Backup "CAMINHO_DO_BACKUP.zip" -Force
```

O restauro move a instalação existente para `pre-restore-AAAAmmdd-HHmmss` antes de copiar o backup. Se a cópia falhar, tenta repor a instalação anterior.

## Credenciais

Um backup integral que inclua `pb_data/data.db` pode conter credenciais guardadas em `app_settings`. Guarda o ZIP como um segredo e não o publiques. O parâmetro `-IncludeSecrets` apenas regista explicitamente essa intenção no manifesto; não altera o conteúdo da base.
