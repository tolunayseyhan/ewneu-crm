$csv = Import-Csv 'C:\_Datenbankabfragen\ClientCube\csv\offene_angebote_utf8.csv' -Delimiter ';' -Encoding UTF8
$grouped = $csv | Group-Object -Property Angebotsnr

$angebote = foreach ($group in $grouped) {
    $rows = $group.Group
    $first = $rows[0]

    $bezeichnung = $first.BEZEICHNUNG -replace ' ___ DB:.*', '' -replace ' ___ Referenz:.*', ''
    $bezeichnung = $bezeichnung.Trim()

    $total = 0
    foreach ($row in $rows) {
        $preis = $row.PREIS -replace '\.', '' -replace ',', '.'
        try { $total += [decimal]$preis } catch {}
    }
    $totalRounded = [Math]::Round($total, 2)

    $latestDate = "2026-01-01"
    foreach ($row in $rows) {
        $dp = $row.VON_DATUM -split '\.'
        if ($dp.Count -eq 3) {
            $d = "{0}-{1}-{2}" -f $dp[2], $dp[1], $dp[0]
            if ($d -gt $latestDate) { $latestDate = $d }
        }
    }

    $mengeRaw = ($first.MENGE -replace '[^0-9]', '')
    if ($mengeRaw -eq '') { $mengeRaw = '1' }

    [PSCustomObject]@{
        id          = "ang-" + $group.Name
        nummer      = $group.Name
        kunde_id    = $first.Kunden_Nr.Trim()
        artikel     = $bezeichnung
        menge       = [int]$mengeRaw
        gesamtpreis = $totalRounded
        datum       = $latestDate
    }
}

$sorted = $angebote | Sort-Object -Property datum -Descending | Select-Object -First 300

$outPath = 'C:\Users\tseyhan\Downloads\PPX\ewneu-crm\lib\angebote-import.ts'
$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine('import type { Angebot } from "./types";')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('export const mockAngeboteReal: Angebot[] = [')

foreach ($a in $sorted) {
    $art = $a.artikel -replace '"', "'"
    $gesamtStr = $a.gesamtpreis.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $entry = '  { id: "' + $a.id + '", nummer: "' + $a.nummer + '", kunde_id: "' + $a.kunde_id + '", artikel: "' + $art + '", menge: ' + $a.menge + ', gesamtpreis: ' + $gesamtStr + ', status: "offen" as const, erstellt_am: "' + $a.datum + '", created_at: "' + $a.datum + 'T00:00:00Z" },'
    [void]$sb.AppendLine($entry)
}

[void]$sb.AppendLine('];')

[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($false))
Write-Host "Done! Written $($sorted.Count) entries to $outPath"
Write-Host "File size: $((Get-Item $outPath).Length) bytes"
Write-Host ""
Write-Host "First 3 entries:"
Get-Content $outPath | Select-Object -Skip 3 -First 3
