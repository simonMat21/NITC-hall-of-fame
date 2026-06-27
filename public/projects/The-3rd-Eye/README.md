# 🕵️ The 3rd Eye — OSINT Intelligence Agentic Framework



**The 3rd Eye** is a modular Open Source Intelligence (OSINT) Agentic framework designed to collect, correlate, and analyze publicly available information and present it in a **structured intelligence report**.



The project emphasizes:



* Clear investigation flow

* Modular agents

* Reproducible results

* Professional reporting standards



---



## 📌 Project Scope



The framework assists in:



* Discovering public digital footprints

* Correlating identities across platforms

* Identifying exposed contact information

* Generating analyst-ready intelligence reports



This tool is intended for **educational, research, and defensive OSINT use** only.



---



## ✨ Core Features



* **Search Agent**



  * Automated search execution

  * URL filtering and relevance classification



* **Social Media Intelligence**



  * LinkedIn profile extraction

  * Instagram public data & media

  * Twitter (X) profile and activity

  * Facebook public profile data



* **Username Enumeration**



  * Cross-platform discovery using Maigret



* **Contact Intelligence**



  * Email extraction & analysis

  * Phone number discovery (in progress)



* **Media Collection**



  * Profile images

  * Banners

  * Publicly accessible photos



* **Intelligence Report Generation**



  * Fixed professional report structure

  * Executive summary

  * Location intelligence

  * Exposure & risk assessment

  * Markdown output (PDF optional)



---



## 🧠 Architecture Overview



The project follows a **graph-based agent architecture** using LangGraph.



### Key Components



* Search Agent

* URL Classification Module

* Platform-Specific Scrapers

* Analysis Modules (Email, Phone, Username)

* Report Synthesis

  

## 🏗 Architecture

🔹 Current Architecture



![status](https://github.com/Ordinary0x/The-3rd-Eye/blob/main/architecture_images/present_status.png)



🔹 Search Agent Architecture



![search_agent](https://github.com/Ordinary0x/The-3rd-Eye/blob/main/architecture_images/Search_Agent.png)



🔹 Final Mission



![mission](https://github.com/Ordinary0x/The-3rd-Eye/blob/main/architecture_images/Mission.png)



📌 Architecture diagrams are provided in the repository (`/architecture_images`).



---



## 🧰 Tools & Libraries



This project integrates established OSINT tools and libraries:



* **Maigret**

  [https://github.com/soxoj/maigret](https://github.com/soxoj/maigret)



* **linkedin-scraper**

  [https://github.com/joeyism/linkedin_scraper.git](https://github.com/joeyism/linkedin_scraper.git)



* **Instaloader**

  [https://instaloader.github.io/](https://instaloader.github.io/)



* **twscrape**

  [https://github.com/vladkens/twscrape](https://github.com/vladkens/twscrape)



* **Holehe**

  [https://github.com/megadose/holehe](https://github.com/megadose/holehe)



* **facebook-scraper**

  [https://github.com/kevinzg/facebook-scraper.git](https://github.com/kevinzg/facebook-scraper.git)



* **LangGraph** (agent orchestration)



* **Google Gemini 2.5** (intelligence synthesis)



---



## 🔑 API Configuration



### Required



```env

GOOGLE_API_KEY=your_gemini_2.5_free_api_key

```



### Optional (Enhancement APIs)



```env

HIBP_API_KEY=your_key

BREACHDIRECTORY_API_KEY=your_key

INTELX_KEY=your_key

```



> Optional APIs improve depth of analysis but are **not mandatory**.



---



## 📄 Report Output



Reports are generated in **Markdown** format with a fixed outline.



Example output structure:



```

target_name/

    ├── photos/

    │   ├── profile.jpg

    │   ├── banner.jpg

    └── final_report.md

```



---



## 🚀 Installation



### 1️⃣ Clone the Repository



```bash

git clone https://github.com/your-username/the-3rd-eye.git

cd the-3rd-eye

```



---



### 2️⃣ Install Dependencies



#### Option A: Using `uv` (Recommended)



```bash

uv venv

source .venv/bin/activate

uv pip install -r requirements.txt

```



#### Option B: Using `pip`



```bash

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

```



---



### 3️⃣ Environment Variables



Create a `.env` file:



```bash

cp .env.example .env

```



Add required API keys.



---



### 4️⃣ Run the Tool



```bash

python main.py

```



---



## 🧪 Project Status



* ✅ Search Agent

* ✅ URL Classification

* ✅ Core Social Media Scrapers

* ✅ Email Analysis

* ⚠ Phone Number Intelligence (WIP)

* ⚠ Maigret Full Automation (WIP)

* ⚠ Image Analysis (Planned)



---



## 🔭 Future Work



Planned enhancements include:



* Ollama (local LLM) support

* Multi-agent intelligence workflows

* Image analysis (object & face detection & Backgroung detection)

* Entity relationship graphs

* Timeline reconstruction

* Confidence scoring

* CLI automation modes



---



## 🎯 Project Vision



The long-term goal is to build a **robust, extensible OSINT framework** that:



* Scales from simple investigations to advanced research

* Encourages responsible OSINT practices

* Supports community-driven improvements



---



## 🤝 Contributions



Contributions are welcome.



Areas where help is appreciated:



* OSINT tooling

* Debuging present errors

* Making a website

* Data analysis

* Visualization

* Documentation



Please open an issue or discussion before submitting major changes.



---



## ❓ Questions or Suggestions?



If you have:



* Feature ideas

* Architecture suggestions

* Tool integrations

* Research improvements



Feel free to open an issue or start a discussion.



---



