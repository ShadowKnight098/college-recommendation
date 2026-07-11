const fs = require('fs');
const path = require('path');

function recoverLine697() {
  const logPath = 'C:\\Users\\shado\\.gemini\\antigravity\\brain\\41b4118f-9916-4be5-ac86-b764505bb624\\.system_generated\\logs\\transcript_full.jsonl';
  if (!fs.existsSync(logPath)) {
    console.error('Log file not found');
    return;
  }

  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');

  // Let's get line 697 specifically
  const targetLine = lines[697];
  if (!targetLine) {
    console.error('Line 697 not found');
    return;
  }

  const step = JSON.parse(targetLine);
  const content = step.content;
  const startIndex = content.indexOf('[');
  let jsonText = content.substring(startIndex).trim();

  console.log(`Original jsonText length: ${jsonText.length}`);
  
  // Let's print the last 200 characters to see where it got truncated
  console.log('Truncated tail:', jsonText.substring(jsonText.length - 200));

  // Let's write a parser that drops incomplete objects from the end.
  // We can find the last complete branch object, which ends with "}"
  // And it must be part of the "branches" array.
  // Let's find the last occurrence of "}," (which separates branches or colleges)
  // or the last complete branch "}" inside a branches list.
  // Let's find the last complete college block. A complete college block looks like:
  //   {
  //     "collegeCode": "...",
  //     "branches": [
  //        ...
  //     ]
  //   }
  // The branches array ends with "]" and the college object ends with "}"
  // So the last complete college ends with "]" then newlines/spaces then "}" followed by a comma "," or array closing.
  // Let's look for "]\n  }" or "]\n    }" or "]\n  }," from the end.
  
  // Let's try to search for the last occurrence of a complete college object closure:
  // A complete college ends with "  }" preceded by a "]" of the branches list.
  // Let's search from the end for "]" followed by some spaces/newlines and "}"
  
  let lastValidCollegeEnd = -1;
  // Let's search backwards
  for (let j = jsonText.length - 5; j >= 0; j--) {
    if (jsonText[j] === ']' && jsonText.indexOf('}', j) !== -1) {
      // Let's check if the text between j (']') and the next '}' contains only whitespace/newlines
      const slice = jsonText.substring(j + 1, jsonText.indexOf('}', j) + 1);
      if (/^\s*}\s*$/.test(slice)) {
        lastValidCollegeEnd = jsonText.indexOf('}', j) + 1;
        break;
      }
    }
  }

  if (lastValidCollegeEnd !== -1) {
    const cleanedText = jsonText.substring(0, lastValidCollegeEnd) + ']';
    try {
      const parsed = JSON.parse(cleanedText);
      const outputPath = path.join(__dirname, '../colleges_new_recovered.json');
      fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
      console.log(`Successfully recovered ${parsed.length} colleges with branch data! Written to colleges_new_recovered.json`);
    } catch (e) {
      console.error('Failed to parse cleaned JSON:', e.message);
    }
  } else {
    console.error('Could not find a valid college object closure.');
  }
}

recoverLine697();
