# LearnFlow Changelog

## Version 5.0 - Unit Organization + Shared Database

### ✨ New Features

**Unit/Category Organization**
- **Assign units to cards**: Group cards by Unit 1, Chapter 5, Basics, etc.
- **Unit field in create form**: Optional categorization when adding cards
- **Unit-based filtering**: Test only specific units
- **Visual unit selection**: Click to toggle units for testing
- **Smart defaults**: Cards without unit go to "General"
- **Unit counter**: See how many cards per unit

**Unit Testing Features:**
- 🏷️ Multi-select unit filter in test mode
- 📊 Card count per selected units
- 🎯 Test specific chapters/topics
- 🔄 Mix and match units
- ✅ All units or none (test everything)

**Shared Database (Optional)**
- **Collaborative learning**: All users see same cards
- **Real-time sync**: See changes instantly via Supabase
- **No authentication**: Public access, anyone can edit
- **GitHub Pages ready**: Free deployment with Actions
- **Dual storage**: Shared cards + personal progress
- **WebSocket updates**: Live card additions/edits/deletions

**Supabase Integration:**
- ✅ PostgreSQL database backend
- ✅ Row Level Security policies
- ✅ Real-time subscriptions
- ✅ Free tier (500MB, 2GB bandwidth)
- ✅ No login required
- ✅ Public collaborative editing

### 🎯 Use Cases

**Unit Organization:**
- Textbook chapters (Unit 1-20)
- Difficulty levels (Beginner, Intermediate, Advanced)
- Grammar types (Verbs, Nouns, Adjectives)
- Time-based (Week 1, Week 2)
- Custom categories

**Shared Database:**
- Study groups
- Classroom learning
- Language exchange
- Community flashcards
- Public learning resources

### 📚 Documentation

**New Guides:**
- `SHARED-DATABASE-SETUP.md` - Complete Supabase + GitHub Pages setup
- GitHub Actions workflow included
- SQL schema for database setup
- Environment configuration examples

### 🔧 Technical Details

**Database Schema:**
```sql
shared_cards (
  id UUID PRIMARY KEY,
  front TEXT,
  back TEXT,
  translation TEXT,
  example TEXT,
  unit TEXT DEFAULT 'General',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Storage Strategy:**
- Supabase: Card content (shared)
- localStorage: Study progress (private)
- Best of both worlds!

---

## Version 4.0 - Test Mode + Enhanced Learning

### ✨ New Features

**Test Mode - Complete Testing System**
- **Two test formats:**
  - Written Test: Type answers, tests exact recall
  - Multiple Choice: Select from 4 options, easier recognition
- **Smart question selection:**
  - Random selection from all cards
  - Up to 10 questions per test
  - Different questions each time
- **Comprehensive results:**
  - Percentage score display
  - Correct/incorrect breakdown
  - Review all answers with feedback
  - See correct answers for mistakes
- **User-friendly interface:**
  - Progress bar during test
  - Question counter
  - Clean results screen
  - Option to retake immediately

**Test Mode Features:**
- ✅ Instant grading and feedback
- 📊 Visual progress tracking
- 🎯 Random question selection
- 🔄 Unlimited retakes
- 📈 Detailed answer review
- 🎨 Color-coded results (green for correct, red for incorrect)

### 🎯 Use Cases for Test Mode

- **Pre-exam preparation** - Quiz yourself before the real thing
- **Progress tracking** - See how much you've learned
- **Weak spot identification** - Find cards you need to study more
- **Confidence building** - Practice in a test-like environment
- **Quick assessment** - 10-question tests for fast feedback

---

## Version 3.0 - Fixed + Paraphrases Feature

### 🐛 Critical Bug Fixes

**localStorage Save Bug - FIXED**
- **Issue**: Cards were not being saved to localStorage properly
- **Cause**: useEffect condition `cards.length > 0` prevented saving when cards array was empty, breaking the save cycle
- **Fix**: Changed condition to `cards.length >= 0` to ensure saves work even with 0 cards
- **Impact**: Cards now persist correctly across page refreshes and browser sessions

### ✨ New Features

**Paraphrases Mode**
- New dedicated section for paraphrase practice
- Learn to express the same idea in multiple ways
- Create paraphrase sets with:
  - Original phrase/sentence
  - Multiple variations (unlimited)
  - Add/remove variations dynamically
- Separate storage from flashcards
- Perfect for:
  - Writing skills improvement
  - Language learning
  - Communication practice
  - Academic writing
  - Professional communication

**Paraphrases Features:**
- ➕ Add unlimited variations per paraphrase
- 🗑️ Delete individual paraphrase sets
- 💾 Auto-save to localStorage
- 📊 View count of variations per set
- 🎨 Beautiful gradient cards for each set
- 📱 Responsive design

### 🔧 Technical Improvements

**Error Handling**
- Added try-catch blocks for localStorage operations
- Graceful handling of corrupted data
- Console error logging for debugging

**Data Persistence**
- Separate localStorage keys for cards and paraphrases
- Independent save triggers
- No data conflicts between features

**UI/UX Improvements**
- New 4-tab navigation (Study, Create, Paraphrases, Manage)
- Clearer visual hierarchy
- Better empty states
- Improved form validation

### 📋 What's Included

1. **Fixed localStorage** - Cards now save properly
2. **Paraphrases system** - Complete new feature
3. **Import/Export** - All 4 formats (CSV, TSV, JSON, Quizlet)
4. **Spaced Repetition** - Leitner system with 5 boxes
5. **Extreme Randomization** - Fisher-Yates shuffle
6. **Multi-language** - Translation fields
7. **Examples** - Context-based learning

### 🚀 Deployment

Same deployment process - just extract and run:
```bash
tar -xzf learnflow-v3-fixed.tar.gz -C learnflow
cd learnflow
chmod +x deploy.sh
./deploy.sh
```

### 📖 Usage Examples

**Paraphrases Example:**

Original: "The project was completed ahead of schedule."

Variations:
1. "We finished the project earlier than planned."
2. "The project reached completion before the deadline."
3. "We delivered the project ahead of the target date."

**Use Cases:**
- Essay writing practice
- Email communication
- Academic papers
- Professional presentations
- Language proficiency

---

## Version 2.0 - Import/Export

### Features Added
- CSV import/export
- TSV import/export  
- JSON import/export
- Quizlet format support
- Example import files
- Comprehensive import guide

---

## Version 1.0 - Initial Release

### Core Features
- Spaced repetition (Leitner system)
- Extreme randomization
- Translation fields
- Example sentences
- Progress tracking
- Local storage
- Clean design
- Raspberry Pi optimized Docker deployment
