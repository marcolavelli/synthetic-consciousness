@echo off
echo =======================================================
echo STATO EMOTIVO IA (Ruota di Plutchik)
echo =======================================================
echo Avvio del server locale su http://localhost:8000 ...
start http://localhost:8000/index.html
python -m http.server 8000
