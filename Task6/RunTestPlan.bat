@echo off
SET homeDir=%cd%
rem ECHO Home dir - %homeDir%
for /f "tokens=*" %%a in ('dir *.jmx /b /s') do set scriptDir=%%a
rem ECHO Script dir - %scriptDir%
SET jmeterDir=C:\apache-jmeter-5.0\apache-jmeter-5.0\bin
rem ECHO Jmeter dir - %jmeterDir%

if exist "%homeDir%\Report" RMDIR /S /Q "%homeDir%\Report"
chdir /d %jmeterDir%
call jmeter -n -t "%scriptDir%" -l "%homeDir%\Report\testresults.jtl"


chdir /d %jmeterDir%

rem If you want full results (with samles) use result.jtl instead of testresults.jtl
SET resultsFile=testresults.jtl
