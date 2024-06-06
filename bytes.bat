@echo off
setlocal enabledelayedexpansion

set "totalSize=0"

for /f "tokens=3" %%a in ('dir /s /-c ^| find "bytes"') do (
	    set /a "size=%%a"
	        set /a "totalSize+=size"
)

set /a "totalSizeMB=totalSize / 1024 / 1024"

echo Total size of the directory: %totalSizeMB% MB

endlocal
