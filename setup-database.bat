@echo off
echo ========================================
echo    MediDash Plus Database Setup
echo ========================================
echo.

echo This script will help you set up the Supabase database with default doctors.
echo.

echo Step 1: Check if Docker Desktop is running...
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Docker Desktop is not running!
    echo.
    echo Please follow these steps:
    echo 1. Start Docker Desktop
    echo 2. Wait for it to fully load (you'll see the Docker icon in your system tray)
    echo 3. Run this script again
    echo.
    echo Press any key to exit...
    pause > nul
    goto :eof
) else (
    echo ✅ Docker Desktop is running.
)

echo.
echo Step 2: Starting Supabase...
npx supabase start

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start Supabase. Please check the error above.
    echo.
    echo Common solutions:
    echo - Make sure Docker Desktop is running
    echo - Try running: npx supabase stop
    echo - Then run: npx supabase start
    echo.
    goto :eof
)

echo.
echo Step 3: Resetting database and applying migrations...
echo This will create the database schema and add default doctors.
npx supabase db reset

if %errorlevel% neq 0 (
    echo.
    echo ❌ Database reset failed. Please check the error above.
    echo.
    echo Try these steps:
    echo 1. Make sure Docker Desktop is running
    echo 2. Run: npx supabase stop
    echo 3. Run: npx supabase start
    echo 4. Run: npx supabase db reset
    echo.
) else (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo Your database now includes:
    echo - 5 default doctors (Dr. Sarah Johnson, Dr. Michael Chen, etc.)
    echo - Proper database schema
    echo - All necessary tables and permissions
    echo.
    echo You can now use the appointment booking feature!
)

echo.
echo Press any key to exit...
pause > nul
