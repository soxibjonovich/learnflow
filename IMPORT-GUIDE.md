# LearnFlow Import/Export Guide

## 📥 Importing Cards

LearnFlow supports **4 different import formats** to make it easy to bring in your existing flashcard sets from various sources.

### Supported Formats

1. **CSV** (Comma-Separated Values) - Excel, Google Sheets
2. **TSV** (Tab-Separated Values) - Plain text with tabs
3. **Quizlet Format** - Direct copy/paste from Quizlet
4. **JSON** - Full LearnFlow format with all fields

---

## Format Details

### 1. CSV Format (Excel/Google Sheets)

**Best for:** Creating cards in Excel or Google Sheets

**Structure:**
```csv
Front,Back,Translation,Example
"Hello","Привет","Russian greeting","Hello, how are you?"
"Goodbye","До свидания","","See you tomorrow!"
```

**How to create:**
1. Open Excel or Google Sheets
2. Create columns: Front, Back, Translation, Example
3. Fill in your cards (Translation and Example are optional)
4. Export/Download as CSV
5. Copy content and paste into LearnFlow import

**Tips:**
- First row can be headers (optional)
- Use quotes around text that contains commas
- Translation and Example columns are optional
- Empty fields are allowed

---

### 2. TSV Format (Tab-Separated)

**Best for:** Simple text files, clipboard operations

**Structure:**
```
Front[TAB]Back[TAB]Translation[TAB]Example
Hello[TAB]Привет[TAB]Russian greeting[TAB]Hello, how are you?
Goodbye[TAB]До свидания[TAB][TAB]See you tomorrow!
```

**How to create:**
1. Open any text editor
2. Type your cards with TAB key separating fields
3. Each line is one card
4. Copy and paste into LearnFlow import

**Tips:**
- Press TAB key between fields (don't type [TAB])
- Translation and Example are optional (can be empty)
- No quotes needed
- First row can be headers (optional)

---

### 3. Quizlet Format

**Best for:** Importing from Quizlet or Anki

**Structure:**
```
Front[TAB]Back
Hello[TAB]Привет
Goodbye[TAB]До свидания
Thank you[TAB]Спасибо
```

**How to import from Quizlet:**
1. Go to your Quizlet set
2. Click the three dots menu (⋯)
3. Select "Export"
4. Copy the text
5. Paste directly into LearnFlow (select Quizlet format)

**Tips:**
- Simple front/back only
- No translation or example fields
- Perfect for quick imports
- Compatible with most flashcard apps

---

### 4. JSON Format

**Best for:** Full-featured import/export, backups, sharing complete sets

**Structure:**
```json
[
  {
    "front": "Hello",
    "back": "Привет",
    "translation": "Russian greeting",
    "example": "Hello, how are you today?"
  },
  {
    "front": "Goodbye",
    "back": "До свидания",
    "translation": "",
    "example": "See you tomorrow!"
  }
]
```

**How to create:**
1. Use a text editor
2. Follow the JSON array format shown above
3. Each card is an object with front, back, translation, example
4. Copy and paste into LearnFlow import

**Tips:**
- Most complete format
- Preserves all fields
- Best for sharing complete card sets
- Can include progress data when exported from LearnFlow

---

## 📤 Exporting Cards

LearnFlow allows you to export your cards in all 4 formats:

### Export Options

1. **JSON (with progress)** - Includes learning progress, box levels, review counts
2. **CSV (Excel compatible)** - Open in Excel/Sheets, includes all fields
3. **TSV (Tab-separated)** - Simple text format
4. **Quizlet Format** - Import into Quizlet or other apps

### How to Export

1. Go to "Manage" tab
2. Click "Export" button
3. Hover to see format options
4. Select your desired format
5. File downloads automatically

---

## 💡 Use Cases

### Scenario 1: Creating Cards in Excel
1. Create spreadsheet with Front, Back, Translation, Example columns
2. Fill in your vocabulary
3. Export as CSV
4. Import into LearnFlow

### Scenario 2: Importing from Quizlet
1. Open your Quizlet set
2. Export the set
3. Copy the text
4. Paste into LearnFlow with "Quizlet Format" selected

### Scenario 3: Sharing with Friends
1. Export your cards as JSON
2. Send file to friend
3. Friend imports JSON into their LearnFlow
4. They get your complete card set!

### Scenario 4: Backup Your Progress
1. Export as JSON
2. Save file to cloud storage
3. Import anytime to restore cards with progress

---

## 📋 Example Files

We've included example files for each format:

- `example-import.csv` - Common phrases in Russian
- `example-import.tsv` - Advanced English vocabulary
- `example-import-quizlet.txt` - French basics
- `example-import.json` - Biology terms

Try importing these to see how each format works!

---

## ⚠️ Important Notes

- **Translation and Example fields are optional** in all formats except JSON
- **Empty fields are allowed** - just leave them blank
- **Headers are optional** - LearnFlow detects them automatically
- **Progress is reset** on import - all cards start at Box 1
- **Duplicate cards** - Cards with same front text will be imported as separate entries
- **Character encoding** - Use UTF-8 for special characters (Russian, Chinese, etc.)

---

## 🆘 Troubleshooting

**Import failed:**
- Check format matches the selected type
- Ensure proper separators (commas for CSV, tabs for TSV)
- Remove any extra blank lines
- Check for unclosed quotes in CSV

**Cards missing fields:**
- Verify column order: Front, Back, Translation, Example
- Make sure TAB key is used (not spaces) for TSV/Quizlet
- Check that quotes are properly closed in CSV

**Special characters broken:**
- Save file as UTF-8 encoding
- Avoid using Excel's default CSV (try "CSV UTF-8" option)

---

## 🎯 Quick Reference

| Format | Best For | Separator | Optional Fields |
|--------|----------|-----------|-----------------|
| CSV | Excel/Sheets | Comma (,) | Translation, Example |
| TSV | Text editors | Tab | Translation, Example |
| Quizlet | Import from Quizlet | Tab | N/A (Front/Back only) |
| JSON | Complete backup | N/A | None |

---

Happy learning! 🎓
