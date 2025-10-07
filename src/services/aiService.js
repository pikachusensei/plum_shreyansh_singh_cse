const tesseract = require('tesseract.js');
const chrono = require('chrono-node');
const { formatInTimeZone } = require('date-fns-tz'); 

class DepartmentMapper {
  constructor() {
    this.departmentMap = new Map([
      ['dentist', 'Dentistry'],
      ['cardiologist', 'Cardiology'],
      ['doctor', 'General Medicine'],
      ['heart', 'Cardiology'], // Added an alias
      ['orthopaedics', 'Orthopaedics'],
    ]);
    
    // A list of common words to ignore when looking for a department
    this.stopWords = new Set(['a', 'an', 'the', 'my', 'for', 'at', 'on', 'in', 'with']);
  }

  capitalize(s) {
    if (typeof s !== 'string' || s.length === 0) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  getDepartment(text) {
    const lowerCaseText = text.toLowerCase();
    
    // 1. Check for existing keywords (this is fast and reliable)
    for (const [keyword, standardName] of this.departmentMap.entries()) {
      if (lowerCaseText.includes(keyword)) {
        console.log(`Found existing keyword: '${keyword}' -> '${standardName}'`);
        return standardName;
      }
    }

    // 2. If no keyword found, try to learn a new one with smarter patterns
    let newKeyword = null;

    // Pattern A: Look for "(department) appointment"
    let match = lowerCaseText.match(/(\w+)\s+(appointment|appt)/);
    if (match && match[1] && !this.stopWords.has(match[1])) {
      newKeyword = match[1];
    }

    // Pattern B: If Pattern A fails, look for "appointment at (department)"
    if (!newKeyword) {
      match = lowerCaseText.match(/(?:appointment|appt)\s+(?:at|for|in|with)\s+(\w+)/);
      if (match && match[1]) {
        newKeyword = match[1];
      }
    }

    // 3. If we found a new keyword, learn it and return the standard name
    if (newKeyword) {
      const newStandardName = this.capitalize(newKeyword);
      console.log(`Learned new department: '${newKeyword}' -> '${newStandardName}'`);
      this.departmentMap.set(newKeyword, newStandardName);
      return newStandardName;
    }

    return null; // No department found
  }
}
const departmentMapper = new DepartmentMapper();


function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


async function processTextRequest(text,timezone) {
  console.log('Step 1: Parsing date and time with chrono-node...');
  
  const referenceDate = new Date('2025-10-07T12:00:00Z');
  const parsedResult = chrono.parse(text, referenceDate, { forwardDate: true });

  if (!parsedResult || parsedResult.length === 0) {
    return { status: 'needs_clarification', message: 'Could not determine a valid date or time.' };
  }

  const appointmentDate = parsedResult[0].start.date();
  console.log('Parsed Date:', appointmentDate);

  console.log('Step 2: Extracting department...');
  const department = departmentMapper.getDepartment(text);

  if (!department) {
    return { status: 'needs_clarification', message: 'Could not determine the department.' };
  }
  console.log('Extracted Department:', department);
  
  console.log('Step 3: Assembling final output...');

  // Final Assembly
  const finalAppointment = {
    appointment: {
      department: department,
      // Use formatInTimeZone to get the date and time in the user's specific timezone
      date: formatInTimeZone(appointmentDate, timezone, 'yyyy-MM-dd'),
      time: formatInTimeZone(appointmentDate, timezone, 'HH:mm'),
      tz: timezone, // Use the dynamic timezone
    },
    status: 'ok',
  };

  return finalAppointment;
}


async function processImageRequest(filePath,timezone) {
  console.log('Starting OCR process for image...');
  const { data: { text } } = await tesseract.recognize(filePath, 'eng', { logger: m => console.log(m) });
  console.log('OCR Result:', text);
  if (!text || text.trim().length === 0) {
    throw new Error('OCR failed to extract any text from the image.');
  }
  return processTextRequest(text,timezone);
}

module.exports = {
  processTextRequest,
  processImageRequest,
};