const fs = require('fs');
const path = require('path');

function recoverAndParse() {
  const logPath = 'C:\\Users\\shado\\.gemini\\antigravity\\brain\\41b4118f-9916-4be5-ac86-b764505bb624\\.system_generated\\logs\\transcript_full.jsonl';
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  let userContent = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const step = JSON.parse(lines[i]);
    if (step.step_index === 1879) {
      userContent = step.content;
      break;
    }
  }
  
  if (!userContent) {
    console.error('Step 1879 not found.');
    return;
  }
  
  // Find the JSON start
  const startIndex = userContent.indexOf('[');
  if (startIndex === -1) {
    console.error('No JSON array start found.');
    return;
  }
  
  // Find the truncation marker
  let trimIndex = userContent.indexOf('<truncated');
  if (trimIndex === -1) {
    trimIndex = userContent.length;
  }
  
  let rawJson = userContent.substring(startIndex, trimIndex);
  
  // We need to trim rawJson back to the last complete object close '}'
  const lastCurly = rawJson.lastIndexOf('}');
  if (lastCurly === -1) {
    console.error('No closing curly bracket found.');
    return;
  }
  
  // Trim up to the last complete object and close the array
  rawJson = rawJson.substring(0, lastCurly + 1) + '\n]';
  
  try {
    const parsed = JSON.parse(rawJson);
    console.log(`Success! Recovered and parsed ${parsed.length} colleges.`);
    
    // Save to colleges.json
    const outputPath = path.join(__dirname, '../colleges.json');
    fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log('Saved cleaned JSON data to:', outputPath);
  } catch (err) {
    console.error('Cleaned JSON parsing failed:', err.message);
    
    // Let's print the last 200 characters of rawJson to see why it failed
    console.log('--- Tail of attempted JSON ---');
    console.log(rawJson.substring(rawJson.length - 300));
  }
}

recoverAndParse();
