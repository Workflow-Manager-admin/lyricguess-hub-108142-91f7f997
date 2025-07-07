#!/bin/bash
cd /home/kavia/workspace/code-generation/lyricguess-hub-108142-91f7f997/website_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

