
Set-Location 'C:\Users\RAGHAVAAAKINEPALLY\.gemini\antigravity\scratch\ml\inference'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'python service.py' -WindowStyle Minimized

Set-Location 'C:\Users\RAGHAVAAAKINEPALLY\.gemini\antigravity\scratch'
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'node server/server.js' -WindowStyle Minimized
