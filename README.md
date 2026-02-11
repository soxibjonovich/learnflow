# LearnFlow - Flashcard Learning App

An efficient flashcard learning application with spaced repetition (Leitner System), designed for optimal learning and memory retention.
created by: telegram -> @safarovvv27 
## Features

- 🧠 **Spaced Repetition** - Leitner system with 5 boxes for optimal memory retention
- 🔀 **Extreme Randomization** - Fisher-Yates shuffle prevents pattern prediction
- ✅ **Test Mode** - Written and multiple-choice tests with unit filtering (NEW!)
- 📚 **Unit Organization** - Group cards by units for targeted study (NEW!)
- 🌍 **Multi-language Support** - Add translations in any language (Russian, Spanish, etc.)
- 📝 **Example Sentences** - Context-based learning with usage examples
- 📋 **Paraphrase Practice** - Learn to express ideas in multiple ways
- 📊 **Progress Tracking** - Visual stats and mastery metrics
- 🔄 **Shared Database** - Collaborative learning with Supabase (Optional, NEW!)
- 💾 **Dual Storage** - Shared cards + personal progress
- 📥 **Import/Export** - Support for CSV, TSV, JSON, and Quizlet formats
- 🎨 **Clean Design** - Focused, distraction-free interface
- 🚀 **GitHub Pages Ready** - Deploy for free with Actions

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide icons

## Deployment on Raspberry Pi 4B

### Prerequisites

1. Raspberry Pi 4B with Raspberry Pi OS (64-bit recommended)
2. Docker and Docker Compose installed
3. At least 1GB free RAM and 2GB free storage

### Install Docker (if not already installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Reboot to apply group changes
sudo reboot
```

### Deploy LearnFlow

1. **Transfer files to Raspberry Pi:**

```bash
# On your computer, create a zip of the project
# Then transfer to Raspberry Pi using scp
scp learnflow.zip pi@raspberrypi.local:~/

# Or clone from git if you push it to a repository
# ssh pi@raspberrypi.local
# git clone <your-repo-url> learnflow
```

2. **Extract and navigate to project:**

```bash
cd ~/
unzip learnflow.zip -d learnflow
cd learnflow
```

3. **Build and run with Docker Compose:**

```bash
# Build the Docker image (this may take 5-10 minutes on Raspberry Pi)
docker-compose build

# Start the application
docker-compose up -d

# Check if running
docker-compose ps
```

4. **Access the application:**

Open your browser and navigate to:
- From Raspberry Pi: `http://localhost:3000`
- From another device on the same network: `http://[raspberry-pi-ip]:3000`

To find your Raspberry Pi's IP address:
```bash
hostname -I
```

### Docker Commands

```bash
# Start the app
docker-compose up -d

# Stop the app
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose build --no-cache
docker-compose up -d

# Check resource usage
docker stats learnflow-flashcards
```

### Performance Optimization for Raspberry Pi

The Docker image is optimized for ARM64 architecture and includes:
- Multi-stage build to minimize image size (~50MB final image)
- Nginx with gzip compression
- Static asset caching
- Health checks for reliability

### Troubleshooting

**App not accessible:**
```bash
# Check if container is running
docker ps

# Check logs for errors
docker-compose logs

# Restart container
docker-compose restart
```

**Out of memory:**
```bash
# Check memory usage
free -h

# Increase swap if needed
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

**Slow build:**
- Building on Raspberry Pi can take 5-15 minutes
- Consider building on a faster machine and transferring the image

## Local Development (without Docker)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Import/Export Features

LearnFlow supports importing and exporting flashcards in multiple formats:

### Supported Formats

1. **CSV** - Excel, Google Sheets compatible
2. **TSV** - Tab-separated values
3. **Quizlet Format** - Direct import from Quizlet
4. **JSON** - Full LearnFlow format with progress

### How to Import

1. Go to **Manage** tab
2. Click **Import** button
3. Select your format (CSV, TSV, Quizlet, or JSON)
4. Paste your data
5. Click **Import Cards**

### How to Export

1. Go to **Manage** tab
2. Click **Export** button
3. Choose format from dropdown
4. File downloads automatically

### Example Files Included

- `example-import.csv` - Russian phrases with translations
- `example-import.tsv` - Advanced English vocabulary
- `example-import-quizlet.txt` - French basics
- `example-import.json` - Biology terms

See `IMPORT-GUIDE.md` for detailed instructions and format specifications.

## Paraphrase Practice Feature

LearnFlow now includes a dedicated **Paraphrases** mode to help you master expressing the same idea in different ways.

### What are Paraphrases?

Paraphrases are different ways of saying the same thing. This feature is perfect for:
- **Writing skills** - Learn to vary your expression
- **Language learning** - Master natural variations
- **Academic work** - Avoid repetitive language
- **Professional communication** - Sound more versatile

### How to Use Paraphrases

1. Go to **Paraphrases** tab
2. Enter an **original phrase** or sentence
3. Add multiple **variations** (as many as you want)
4. Click **Save Paraphrase Set**
5. View and manage all your paraphrase sets

### Example Paraphrase Set

**Original:** "Thank you for your help."

**Variations:**
1. "I appreciate your assistance."
2. "Thanks for helping me out."
3. "I'm grateful for your support."
4. "Your help means a lot."

See `PARAPHRASES-GUIDE.md` for comprehensive examples and tips.

## Test Mode

Challenge yourself with interactive tests to check your learning progress!

### Two Test Formats

**1. Written Test**
- Type your answers manually
- Tests exact recall and spelling
- More challenging, better for deep learning
- Requires precise answers

**2. Multiple Choice**
- Select from 4 options
- Recognition-based testing
- Easier format, good for beginners
- Requires at least 4 cards

### How Tests Work

1. Go to **Test** tab
2. Choose your format (Written or Multiple Choice)
3. Answer up to 10 random questions from your cards
4. Get instant results with score and feedback
5. Review correct and incorrect answers

### Test Features

- 📊 **Real-time progress bar** - See how far you've progressed
- 🎯 **Random selection** - Different questions each time
- ✅ **Instant grading** - Immediate feedback on completion
- 📈 **Detailed results** - See which cards you got right/wrong
- 🔄 **Retake option** - Take as many tests as you want

### Perfect For

- 📝 Pre-exam preparation
- 🎓 Quiz yourself before important tests
- 📊 Track your learning progress
- 🔍 Identify weak spots in your knowledge
- 💪 Build confidence through practice

## Unit Organization

Organize your cards into units/categories for targeted learning!

### What are Units?

Units are labels you can assign to cards to group them logically:
- **Unit 1, Unit 2, Unit 3** - Textbook chapters
- **Basics, Intermediate, Advanced** - Difficulty levels
- **Verbs, Nouns, Adjectives** - Grammar categories
- **Chapter 1, Chapter 2** - Book sections
- **Week 1, Week 2** - Time-based organization

### How to Use Units

**When Creating Cards:**
1. Go to **Create** tab
2. Fill in Front, Back, Translation, Example
3. Add **Unit** (e.g., "Unit 5")
4. Cards without unit default to "General"

**When Testing:**
1. Go to **Test** tab
2. Select specific units to test (optional)
3. Click unit buttons to toggle selection
4. Start test - only selected units included!

**Benefits:**
- 🎯 Focus on specific topics
- 📚 Test one chapter at a time
- 🔄 Review systematically
- 📊 Track progress by unit

### Example Workflow

```
Day 1: Create cards → Assign to "Unit 1"
Day 2: Study all cards
Day 3: Test only "Unit 1" cards
Day 4: Create "Unit 2" cards
Day 5: Test both "Unit 1" and "Unit 2"
```

## Shared Database (Optional)

LearnFlow now supports a **shared database** where everyone can see and edit cards together!

### What is Shared Database?

- 🌍 **Public card library** - All users see same cards
- ✏️ **Collaborative editing** - Anyone can add/edit/delete
- 🔄 **Real-time sync** - See changes instantly
- 🚫 **No login required** - Just visit the URL
- 💾 **Personal progress** - Your study data stays private

### Perfect For

- Study groups sharing vocabulary
- Classroom learning environments
- Language exchange communities
- Collaborative flashcard sets
- Public learning resources

### How It Works

**Dual Storage Strategy:**
1. **Supabase Database** → Shared card content (front, back, translation, example, unit)
2. **localStorage** → Your personal progress (box level, reviews, study history)

Everyone sees the same cards, but your learning progress is private!

### Setup Instructions

See `SHARED-DATABASE-SETUP.md` for complete setup guide:
1. Create free Supabase account
2. Run SQL schema
3. Add credentials to GitHub Secrets
4. Deploy to GitHub Pages
5. Share URL with study group!

**⚠️ Warning:** Shared database is PUBLIC - anyone can edit/delete. Best for trusted groups!

## Bug Fixes (v3.0)

**Critical localStorage Bug - FIXED**
- Cards now save properly across sessions
- Data persistence improved with better error handling
- No more lost progress!

## Making it Accessible from Internet

### Option 1: Port Forwarding
1. Log into your router admin panel
2. Forward port 3000 to your Raspberry Pi's local IP
3. Access via your public IP: `http://[your-public-ip]:3000`

### Option 2: Cloudflare Tunnel (Recommended)
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb

# Login and create tunnel
cloudflared tunnel login
cloudflared tunnel create learnflow
cloudflared tunnel route dns learnflow learnflow.yourdomain.com

# Run tunnel
cloudflared tunnel run learnflow --url http://localhost:3000
```

### Option 3: Tailscale (Private Access)
```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Connect to your Tailscale network
sudo tailscale up

# Access from any device on your Tailscale network
# http://[tailscale-ip]:3000
```

## Updating the App

```bash
cd ~/learnflow

# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## Auto-start on Boot

Create systemd service:

```bash
sudo nano /etc/systemd/system/learnflow.service
```

Add:
```ini
[Unit]
Description=LearnFlow Flashcard App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/learnflow
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable learnflow
sudo systemctl start learnflow
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
