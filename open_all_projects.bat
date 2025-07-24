@echo off
REM Open multiple Windows PowerShell tabs for different project directories using Windows Terminal

REM Open Windows Terminal with multiple tabs
wt ^
new-tab --title "ai_chatbot_backend" powershell -NoExit -Command "cd C:\Users\instincthub\code_projects\ai-projects\ai-chatbot\ai_chatbot_backend" ; ^
new-tab --title "chatbot_frontend" powershell -NoExit -Command "cd C:\Users\instincthub\code_projects\ai-projects\ai-chatbot\chatbot_frontend" ; 