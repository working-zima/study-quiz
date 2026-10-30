# Azure AZ-900 과목 원본 추출 2단계 — 1단계(dump_pages.py)가 잘라 둔 그림 블록 PNG의 글자를
# Windows 내장 OCR(Windows.Media.Ocr, en-US)로 읽어 같은 이름의 .txt로 쓴다(UTF-8, BOM 없음).
#
# Usage:
#     powershell.exe -File scripts/azure-source/ocr.ps1 docs/source/azure/raw/dump/img docs/source/azure/raw/dump/ocr
#
# Windows PowerShell 5.1(powershell.exe)에서만 돈다. PowerShell 7(pwsh)은 .NET Core 위에서 돌아
# WinRT 형식을 [형식, 어셈블리, ContentType = WindowsRuntime] 꼴로 불러오지 못하고, 비동기 결과를 기다리는
# AsTask 확장도 없다. 그래서 Windows가 아닌 기기에서는 이 단계를 돌릴 수 없다 — 이 PC의 raw/dump/를 복사해 간다.
# 시작할 때 설치된 인식기 언어를 찍고, en-US 인식기가 없으면 멈춘다.
#
# OCR은 라디오 단추·체크 표시를 읽지 못한다. 예/아니요·핫스팟·끌어 놓기 문항에서 그림으로만 표시된 정답은
# 이 결과에 남지 않으므로 그 그림(raw/dump/img/)이나 원본 PDF의 그 쪽을 렌더해서 본다.
#
# 결과물은 커밋하지 않는다(ADR-009). 규칙은 docs/source/azure/CLAUDE.md에 있다. 다음 단계: dump_merge.py(3단계).
param([string]$InDir, [string]$OutDir)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Globalization.Language, Windows.Foundation, ContentType = WindowsRuntime]
'available: ' + (([Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages | ForEach-Object { $_.LanguageTag }) -join ', ')
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, [Type]$type) {
    $task = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
    $task.Wait() | Out-Null
    $task.Result
}
$lang = New-Object Windows.Globalization.Language 'en-US'
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
if ($null -eq $engine) { Write-Error 'en-US OCR engine not available'; exit 1 }
New-Item -ItemType Directory -Force $OutDir | Out-Null
Get-ChildItem $InDir -Filter *.png | ForEach-Object {
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($_.FullName)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
    $lines = $result.Lines | ForEach-Object { $_.Text }
    [System.IO.File]::WriteAllLines((Join-Path $OutDir ($_.BaseName + '.txt')), [string[]]$lines, [System.Text.UTF8Encoding]::new($false))
    $stream.Dispose()
}
'done'
