$ErrorActionPreference = "Stop"

$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MavenVersion = "3.9.9"
$MavenHome = Join-Path $BaseDir ".mvn\apache-maven-$MavenVersion"
$MavenCmd = Join-Path $MavenHome "bin\mvn.cmd"
$JdkDir = Join-Path $BaseDir ".mvn\jdk"
$EnvFile = Join-Path $BaseDir ".env"

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $name = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

if (!(Test-Path $MavenCmd)) {
    Write-Host "Downloading Apache Maven $MavenVersion..."
    $mvnRoot = Join-Path $BaseDir ".mvn"
    $zip = Join-Path $mvnRoot "apache-maven-$MavenVersion-bin.zip"
    New-Item -ItemType Directory -Force $mvnRoot | Out-Null
    Invoke-WebRequest -UseBasicParsing "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip" -OutFile $zip
    Expand-Archive -Force $zip $mvnRoot
    Remove-Item $zip -Force
}

$javaMajor = 0
try {
    $versionLine = & java -version 2>&1 | Select-String -Pattern 'version' | Select-Object -First 1
    if ($versionLine -match '"(?<version>[^"]+)"') {
        $version = $Matches.version
        if ($version.StartsWith("1.")) {
            $javaMajor = [int]($version.Split(".")[1])
        } else {
            $javaMajor = [int]($version.Split(".")[0])
        }
    }
} catch {
    $javaMajor = 0
}

if ($javaMajor -lt 21) {
    $jdkJava = Join-Path $JdkDir "bin\java.exe"
    if (!(Test-Path $jdkJava)) {
        Write-Host "Downloading portable JDK 21..."
        $mvnRoot = Join-Path $BaseDir ".mvn"
        $zip = Join-Path $mvnRoot "jdk21.zip"
        $extract = Join-Path $mvnRoot "jdk-extract"
        New-Item -ItemType Directory -Force $mvnRoot | Out-Null
        Invoke-WebRequest -UseBasicParsing "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk" -OutFile $zip
        Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue
        Expand-Archive -Force $zip $extract
        $jdkHome = Get-ChildItem $extract -Directory | Select-Object -First 1
        Remove-Item $JdkDir -Recurse -Force -ErrorAction SilentlyContinue
        Move-Item $jdkHome.FullName $JdkDir
        Remove-Item $zip -Force
        Remove-Item $extract -Recurse -Force
    }
    $env:JAVA_HOME = $JdkDir
    $env:PATH = (Join-Path $JdkDir "bin") + ";" + $env:PATH
}

& $MavenCmd @args
exit $LASTEXITCODE
