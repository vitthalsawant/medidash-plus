@echo off
echo Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo Waiting for Docker Desktop to start...
timeout /t 30 /nobreak > nul

echo Starting Supabase...
npx supabase start

echo Running migrations...
npx supabase db reset

echo Done! Your doctors should now be available in the appointment form.
pause
