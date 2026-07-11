const fs = require('fs');
const path = require('path');

function extract() {
  const logPath = 'C:\\Users\\shado\\.gemini\\antigravity\\brain\\41b4118f-9916-4be5-ac86-b764505bb624\\.system_generated\\logs\\transcript_full.jsonl';
  if (!fs.existsSync(logPath)) {
    console.error('Log file not found at:', logPath);
    return;
  }

  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');

  // Let's iterate from the end to find the user input that contains the branches list
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const step = JSON.parse(line);
      if (step.source === 'USER_EXPLICIT' && step.type === 'USER_INPUT') {
        const content = step.content;
        // Search for JSON array start
        const startIndex = content.indexOf('[');
        if (startIndex !== -1) {
          let jsonText = content.substring(startIndex);
          // Clean up trailing tags if any
          const endIndex = jsonText.lastIndexOf(']');
          if (endIndex !== -1) {
            jsonText = jsonText.substring(0, endIndex + 1);
          }

          // Try to parse to verify
          try {
            const parsed = JSON.parse(jsonText);
            const outputPath = path.join(__dirname, '../colleges_new.json');
            fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
            console.log(`Successfully extracted ${parsed.length} colleges with branch data to colleges_new.json`);
            return;
          } catch (e) {
            // If parsing failed due to truncation, let's fix it
            console.log('JSON failed to parse directly, attempting recovery...');
            
            // Trim to the last complete object in the array
            let lastCompleteIndex = jsonText.lastIndexOf('},');
            if (lastCompleteIndex === -1) {
              lastCompleteIndex = jsonText.lastIndexOf('}');
            }
            if (lastCompleteIndex !== -1) {
              const recoveredText = jsonText.substring(0, lastCompleteIndex + 1) + ']';
              try {
                const parsedRecovered = JSON.parse(recoveredText);
                const outputPath = path.join(__dirname, '../colleges_new.json');
                fs.writeFileSync(outputPath, JSON.stringify(parsedRecovered, null, 2));
                console.log(`Successfully recovered and wrote ${parsedRecovered.length} colleges with branch data to colleges_new.json`);
                return;
              } catch (err) {
                console.error('Recovery failed:', err.message);
              }
            }
          }
        }
      }
    } catch (err) {
      // Ignore line parse errors
    }
  }

  console.error('No JSON array found in user messages.');
}

extract();
