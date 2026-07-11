const fs = require('fs');

function inspectLogs() {
  const logPath = 'C:\\Users\\shado\\.gemini\\antigravity\\brain\\41b4118f-9916-4be5-ac86-b764505bb624\\.system_generated\\logs\\transcript_full.jsonl';
  if (!fs.existsSync(logPath)) {
    console.error('Log file not found');
    return;
  }

  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');

  console.log(`Total lines in log: ${lines.length}`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const step = JSON.parse(line);
      if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
        const content = step.content;
        const len = content.length;
        console.log(`Line ${i}: length=${len}, snippet="${content.substring(0, 100).replace(/\n/g, ' ')}..."`);
      }
    } catch (e) {}
  }
}

inspectLogs();
