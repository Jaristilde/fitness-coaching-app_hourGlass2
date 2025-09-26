# streamlit_app.py
# Hourglass Workout Program by Joane Aristilde - Enhanced with Video Support

import streamlit as st
from textwrap import dedent
import re
from datetime import date, datetime, timedelta
import json
import os
from typing import Dict, Optional
import pandas as pd
import numpy as np

# Import storage functions with error handling
try:
    from storage import (
        init_storage, get_profile, save_profile, get_settings, save_settings,
        save_daily_log, get_logs, delete_all_user_data, export_logs_csv,
    )
    STORAGE_AVAILABLE = True
except ImportError:
    STORAGE_AVAILABLE = False
    # Dummy functions if storage module is not available
    def init_storage(): pass
    def get_profile(user_id): return None
    def save_profile(**kwargs): pass
    def get_settings(user_id): return None
    def save_settings(user_id, settings): pass
    def save_daily_log(**kwargs): pass
    def get_logs(user_id, start, end): return pd.DataFrame()
    def delete_all_user_data(user_id): pass
    def export_logs_csv(user_id): return "export.csv"

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================
st.set_page_config(
    page_title="Hourglass Fitness Transformation",
    page_icon="💪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Admin Mode Detection
try:
    ADMIN_MODE = (
        os.environ.get("ADMIN_MODE", "").lower() == "true" or
        (hasattr(st, 'secrets') and "ADMIN_MODE" in st.secrets and str(st.secrets["ADMIN_MODE"]).lower() == "true")
    )
except:
    ADMIN_MODE = os.environ.get("ADMIN_MODE", "").lower() == "true"

MAX_VIDEO_MB = 50
UPLOAD_ROOT = "uploaded_content"
MAIN_MEDIA_DIR = os.path.join(UPLOAD_ROOT, "main_media")
EXERCISE_VIDEOS_DIR = os.path.join(UPLOAD_ROOT, "exercise_videos")
PROGRESS_DIR = os.path.join(UPLOAD_ROOT, "progress_photos")
USER_DATA_DIR = "user_data"
VIDEOS_DIR = "videos"
VIDEOS_JSON = "videos.json"
WORKOUT_LOG_CSV = "workout_log.csv"

# ============================================================================
# INITIALIZATION & HELPERS
# ============================================================================
def ensure_dirs():
    """Create necessary directories if they don't exist"""
    dirs = [
        UPLOAD_ROOT, MAIN_MEDIA_DIR, EXERCISE_VIDEOS_DIR,
        PROGRESS_DIR, USER_DATA_DIR, VIDEOS_DIR
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def init_session_state():
    """Initialize session state variables"""
    if 'initialized' not in st.session_state:
        st.session_state.initialized = True
        ensure_dirs()

    defaults = {
        'page': 'home',
        'completed_exercises': [],
        'selected_level': 1,
        'progress_entries': [],
        'selected_workout': None,
        'selected_workout_day': None,
        'weight_entries': [],
        'meal_plan_option': 'Option A: Omnivore',
        'workout_sets': {}  # For tracking set/rep inputs
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

# ============================================================================
# VIDEO MANAGEMENT FUNCTIONS (NEW)
# ============================================================================
def load_videos_json():
    """Load video mappings from videos.json"""
    try:
        if os.path.exists(VIDEOS_JSON):
            with open(VIDEOS_JSON, 'r') as f:
                return json.load(f)
    except Exception as e:
        st.error(f"Error loading videos: {str(e)}")
    return {}

def save_videos_json(videos_dict):
    """Save video mappings to videos.json"""
    try:
        with open(VIDEOS_JSON, 'w') as f:
            json.dump(videos_dict, f, indent=2)
        return True
    except Exception as e:
        st.error(f"Error saving videos: {str(e)}")
        return False

def get_exercise_id(exercise_name):
    """Generate a stable exercise ID from name"""
    return re.sub(r'[^a-z0-9]+', '_', exercise_name.lower()).strip('_')

def render_admin_intro_video_manager():
    """Simplified admin interface for intro video only"""
    videos = load_videos_json()

    source_type = st.selectbox(
        "Video source",
        ["URL", "Upload File"],
        key="intro_source_simple"
    )

    if source_type == "URL":
        intro_url = st.text_input(
            "YouTube or Video URL",
            value=videos.get("__intro__", ""),
            key="intro_url_simple"
        )
        if st.button("Save Video URL", key="save_intro_url_simple"):
            videos["__intro__"] = intro_url
            if save_videos_json(videos):
                st.success("Intro video URL saved!")
                st.rerun()
    else:
        uploaded_intro = st.file_uploader(
            "Upload intro video (MP4 or MOV)",
            type=['mp4', 'mov'],
            key="intro_file_simple"
        )
        if uploaded_intro and st.button("Save Intro Video", key="save_intro_file_simple"):
            try:
                video_path = os.path.join(VIDEOS_DIR, f"intro_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
                with open(video_path, 'wb') as f:
                    f.write(uploaded_intro.getbuffer())
                videos["__intro__"] = video_path
                if save_videos_json(videos):
                    st.success("Intro video uploaded!")
                    st.rerun()
            except Exception as e:
                st.error(f"Upload failed: {str(e)}")

    if "__intro__" in videos:
        if st.button("Remove Intro Video", key="remove_intro_simple"):
            del videos["__intro__"]
            save_videos_json(videos)
            st.success("Intro video removed")
            st.rerun()

def render_admin_video_manager():
    """Render admin-only video management panel"""
    if not ADMIN_MODE:
        return

    with st.expander("🔧 Admin: Video Manager"):
        st.markdown("### Video Management")

        videos = load_videos_json()

        # Manage intro video
        st.markdown("#### Homepage Intro Video")
        intro_col1, intro_col2 = st.columns(2)

        with intro_col1:
            intro_source = st.selectbox(
                "Source type for intro",
                ["URL", "Upload File"],
                key="intro_source_type"
            )

            if intro_source == "URL":
                intro_url = st.text_input(
                    "Video URL",
                    value=videos.get("__intro__", ""),
                    key="intro_url_input"
                )
                if st.button("Save Intro URL", key="save_intro_url"):
                    videos["__intro__"] = intro_url
                    if save_videos_json(videos):
                        st.success("Intro video URL saved!")
                        st.rerun()
            else:
                uploaded_intro = st.file_uploader(
                    "Upload intro video",
                    type=['mp4', 'mov'],
                    key="intro_file_upload"
                )
                if uploaded_intro and st.button("Save Intro File", key="save_intro_file"):
                    try:
                        video_path = os.path.join(VIDEOS_DIR, f"intro_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
                        with open(video_path, 'wb') as f:
                            f.write(uploaded_intro.getbuffer())
                        videos["__intro__"] = video_path
                        if save_videos_json(videos):
                            st.success("Intro video uploaded!")
                            st.rerun()
                    except Exception as e:
                        st.error(f"Upload failed: {str(e)}")

        with intro_col2:
            if "__intro__" in videos:
                st.info(f"Current: {videos['__intro__'][:50]}...")
                if st.button("Remove Intro Video", key="remove_intro"):
                    del videos["__intro__"]
                    save_videos_json(videos)
                    st.rerun()

        st.markdown("---")

        # Manage exercise videos
        st.markdown("#### Exercise Videos")

        all_exercises = get_all_exercises()

        exercise_name = st.selectbox(
            "Select exercise",
            [""] + all_exercises,
            key="admin_exercise_select"
        )

        if exercise_name:
            exercise_id = get_exercise_id(exercise_name)

            col1, col2 = st.columns(2)

            with col1:
                source_type = st.selectbox(
                    "Source type",
                    ["URL", "Upload File"],
                    key=f"source_type_{exercise_id}"
                )

                if source_type == "URL":
                    video_url = st.text_input(
                        "Video URL",
                        value=videos.get(exercise_id, ""),
                        key=f"url_{exercise_id}"
                    )
                    if st.button("Save URL", key=f"save_url_{exercise_id}"):
                        videos[exercise_id] = video_url
                        if save_videos_json(videos):
                            st.success(f"Video URL saved for {exercise_name}!")
                            st.rerun()
                else:
                    uploaded_file = st.file_uploader(
                        "Upload video",
                        type=['mp4', 'mov'],
                        key=f"upload_{exercise_id}"
                    )
                    if uploaded_file and st.button("Save File", key=f"save_file_{exercise_id}"):
                        try:
                            video_path = os.path.join(VIDEOS_DIR, f"{exercise_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
                            with open(video_path, 'wb') as f:
                                f.write(uploaded_file.getbuffer())
                            videos[exercise_id] = video_path
                            if save_videos_json(videos):
                                st.success(f"Video uploaded for {exercise_name}!")
                                st.rerun()
                        except Exception as e:
                            st.error(f"Upload failed: {str(e)}")

            with col2:
                if exercise_id in videos:
                    st.info(f"Current: {videos[exercise_id][:50]}...")
                    if st.button("Remove Video", key=f"remove_{exercise_id}"):
                        del videos[exercise_id]
                        save_videos_json(videos)
                        st.rerun()

def get_all_exercises():
    """Get list of all unique exercise names"""
    exercises = set()

    # Add all exercises from workout data
    for ex in BOOTY_L1 + ABS_CORE_ONLY:
        if ex.get("name") and ex["name"] != "Repeat 2x total":
            exercises.add(ex["name"])

    # Add more exercises
    basic_exercises = [
        "Hip Thrust", "RDLs (Romanian Deadlifts)", "Kickbacks", "Hyperextensions",
        "Bulgarian Split Squats", "Leg Press", "Leg Curl", "Lat Pulldown Wide Grip"
    ]
    exercises.update(basic_exercises)

    return sorted(list(exercises))

# ============================================================================
# WORKOUT LOG FUNCTIONS (NEW)
# ============================================================================
def save_workout_log(date_str, exercise_id, exercise_name, set_num, reps, weight, completed):
    """Save workout data to CSV"""
    try:
        new_entry = pd.DataFrame([{
            'date': date_str,
            'exercise_id': exercise_id,
            'exercise': exercise_name,
            'set': set_num,
            'reps': reps,
            'weight': weight,
            'completed': completed
        }])

        if os.path.exists(WORKOUT_LOG_CSV):
            existing_df = pd.read_csv(WORKOUT_LOG_CSV)
            updated_df = pd.concat([existing_df, new_entry], ignore_index=True)
        else:
            updated_df = new_entry

        updated_df.to_csv(WORKOUT_LOG_CSV, index=False)
        return True
    except Exception as e:
        st.error(f"Error saving workout log: {str(e)}")
        return False

def get_today_workout_log(date_str, exercise_id):
    """Get today's workout log for specific exercise"""
    try:
        if os.path.exists(WORKOUT_LOG_CSV):
            df = pd.read_csv(WORKOUT_LOG_CSV)
            filtered = df[(df['date'] == date_str) & (df['exercise_id'] == exercise_id)]
            return filtered
    except Exception as e:
        st.error(f"Error reading workout log: {str(e)}")
    return pd.DataFrame()

def parse_set_count(sets_string):
    """Parse set count from string"""
    if not sets_string or sets_string.strip() == "—":
        return 0

    s = sets_string.lower()
    s = re.sub(r'\d+\s*warm[- ]*up.*?(?:\+|$)', '', s)
    nums = re.findall(r'\d+', s)

    if not nums:
        return 1 if "set" in s else 0

    return sum(int(n) for n in nums)

def render_enhanced_exercise_card(exercise, idx, workout_date):
    """Enhanced exercise card with video and set tracking"""
    exercise_name = exercise['name']
    exercise_id = get_exercise_id(exercise_name)
    sets_info = exercise.get('sets', '—')
    reps_info = exercise.get('reps', '—')
    category = exercise.get('category', 'General')

    num_sets = parse_set_count(sets_info)

    with st.container():
        st.markdown(f"### {idx}. {exercise_name}")
        st.markdown(f"**Category:** {category} | **Sets:** {sets_info} | **Reps:** {reps_info}")

        col1, col2 = st.columns([1, 1])

        # Left column: Set/Rep tracker
        with col1:
            if num_sets > 0:
                st.markdown("#### 📝 Track Your Sets")

                sets_data = []
                for set_num in range(1, num_sets + 1):
                    with st.container():
                        cols = st.columns([1, 2, 2, 1])

                        with cols[0]:
                            st.markdown(f"**Set {set_num}**")

                        with cols[1]:
                            reps_key = f"{exercise_id}_{workout_date}_set{set_num}_reps"
                            reps = st.number_input(
                                "Reps",
                                min_value=0,
                                max_value=100,
                                value=st.session_state.workout_sets.get(reps_key, 10),
                                key=reps_key,
                                label_visibility="collapsed"
                            )
                            st.session_state.workout_sets[reps_key] = reps

                        with cols[2]:
                            weight_key = f"{exercise_id}_{workout_date}_set{set_num}_weight"
                            weight = st.number_input(
                                "Weight (lbs)",
                                min_value=0.0,
                                max_value=500.0,
                                value=st.session_state.workout_sets.get(weight_key, 0.0),
                                step=2.5,
                                key=weight_key,
                                label_visibility="collapsed"
                            )
                            st.session_state.workout_sets[weight_key] = weight

                        with cols[3]:
                            completed_key = f"{exercise_id}_{workout_date}_set{set_num}_completed"
                            completed = st.checkbox(
                                "✅",
                                key=completed_key,
                                value=st.session_state.workout_sets.get(completed_key, False)
                            )
                            st.session_state.workout_sets[completed_key] = completed

                        sets_data.append({
                            'set': set_num,
                            'reps': reps,
                            'weight': weight,
                            'completed': completed
                        })

                if st.button(f"💾 Save {exercise_name}", key=f"save_{exercise_id}_{workout_date}"):
                    saved_count = 0
                    for data in sets_data:
                        if save_workout_log(
                            workout_date,
                            exercise_id,
                            exercise_name,
                            data['set'],
                            data['reps'],
                            data['weight'],
                            data['completed']
                        ):
                            saved_count += 1

                    if saved_count > 0:
                        st.success(f"Saved {saved_count} sets!")

                        today_log = get_today_workout_log(workout_date, exercise_id)
                        if not today_log.empty:
                            st.markdown("##### Today's Log")
                            st.dataframe(
                                today_log[['set', 'reps', 'weight', 'completed']],
                                hide_index=True,
                                use_container_width=True
                            )
            else:
                # Simple checkbox for exercises without sets
                key = f"ex_{idx}_{exercise_name.replace(' ', '_')}"
                completed = st.checkbox("✅ Done", key=key)

                if completed and key not in st.session_state.completed_exercises:
                    st.session_state.completed_exercises.append(key)

        # Right column: Video
        with col2:
            st.markdown("#### 🎥 Exercise Demo")

            videos = load_videos_json()

            if exercise_id in videos:
                video_source = videos[exercise_id]
                try:
                    if video_source.startswith(("http://", "https://")):
                        # For URLs, use standard video player
                        st.video(video_source)
                    elif os.path.exists(video_source):
                        # For local files, use HTML5 video with loop
                        with open(video_source, 'rb') as video_file:
                            video_bytes = video_file.read()
                            st.video(video_bytes, loop=True)
                    else:
                        st.info("Video file not found. Contact admin to update.")
                except Exception as e:
                    st.error(f"Error loading video: {str(e)}")
            else:
                st.info("No video available for this exercise yet.")

            # Admin video upload section - directly in the exercise card
            if ADMIN_MODE:
                st.markdown("---")
                st.markdown("##### 🔧 Admin: Add/Update Video")

                source_type = st.selectbox(
                    "Source",
                    ["Upload File", "URL"],
                    key=f"source_{exercise_id}_{idx}"
                )

                if source_type == "URL":
                    video_url = st.text_input(
                        "Video URL",
                        value=videos.get(exercise_id, ""),
                        key=f"url_{exercise_id}_{idx}"
                    )
                    if st.button("Save URL", key=f"save_url_{exercise_id}_{idx}"):
                        videos[exercise_id] = video_url
                        if save_videos_json(videos):
                            st.success(f"Video URL saved!")
                            st.rerun()
                else:
                    uploaded_file = st.file_uploader(
                        "Choose video file",
                        type=['mp4', 'mov'],
                        key=f"upload_{exercise_id}_{idx}"
                    )
                    if uploaded_file and st.button("Upload Video", key=f"upload_btn_{exercise_id}_{idx}"):
                        try:
                            video_path = os.path.join(VIDEOS_DIR, f"{exercise_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
                            with open(video_path, 'wb') as f:
                                f.write(uploaded_file.getbuffer())
                            videos[exercise_id] = video_path
                            if save_videos_json(videos):
                                st.success(f"Video uploaded successfully!")
                                st.rerun()
                        except Exception as e:
                            st.error(f"Upload failed: {str(e)}")

                # Remove video option
                if exercise_id in videos:
                    if st.button("Remove Video", key=f"remove_{exercise_id}_{idx}"):
                        del videos[exercise_id]
                        save_videos_json(videos)
                        st.rerun()

def render_homepage_intro_video():
    """Render intro video at bottom of homepage"""
    videos = load_videos_json()

    if "__intro__" in videos:
        st.markdown("---")
        st.markdown("### 🎥 Welcome Video")

        # --- MODIFICATION START: Shrink video layout ---
        # Use columns to create a narrower, centered view for the video
        _ , col_vid, _ = st.columns([1, 2, 1])
        with col_vid:
            video_source = videos["__intro__"]
            try:
                if video_source.startswith(("http://", "https://")):
                    st.video(video_source)
                elif os.path.exists(video_source):
                    st.video(video_source)
                else:
                    st.info("Video file not found")
            except Exception as e:
                st.error(f"Error loading video: {str(e)}")
        # --- MODIFICATION END ---

    # Admin controls for intro video (only in admin mode)
    if ADMIN_MODE:
        render_admin_video_manager()

# ============================================================================
# STYLES
# ============================================================================
def load_styles():
    """Load custom CSS styles"""
    st.markdown("""
    <style>
        .main {
            background: linear-gradient(135deg, #ffeef8 0%, #fff5f8 50%, #f0f8ff 100%);
        }
        .main-header {
            font-size: 3rem;
            font-weight: 800;
            text-align: center;
            background: linear-gradient(45deg, #FF1493, #FF69B4, #DA70D6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            margin-bottom: .5rem;
        }
        .sub-header {
            font-size: 1.1rem;
            text-align: center;
            color: #666;
            margin-bottom: 1rem;
            font-weight: 300;
        }
        .hero-section {
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, rgba(255,20,147,.15), rgba(255,105,180,.15), rgba(218,112,214,.15));
            border-radius: 18px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,.08);
            border: 1px solid rgba(255,255,255,.35);
        }
        .nav-button {
            background: linear-gradient(135deg, #FF69B4, #DA70D6);
            color: white;
            padding: 1.5rem;
            border-radius: 15px;
            text-align: center;
            font-size: 1.2rem;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s;
            cursor: pointer;
        }
        .nav-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .info-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
        }
        .weekly-box {
            background: rgba(255,255,255,.96);
            padding: 12px;
            border-radius: 14px;
            margin: 8px 0 14px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,.08);
            border-left: 5px solid #FF1493;
        }
        .category-header {
            background: linear-gradient(45deg,#FF69B4,#DA70D6);
            color:#fff;
            padding: 10px;
            border-radius: 10px;
            text-align:center;
            font-weight:700;
            margin: 12px 0 8px 0;
        }
        .exercise-card {
            background: rgba(255,255,255,.98);
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,.08);
            margin: 8px 0;
            border-left: 5px solid #FF1493;
        }
        .completed-card {
            background: rgba(232,245,232,.95);
            border-left: 5px solid #4CAF50;
        }
        .badge {
            display:inline-block;
            padding:6px 10px;
            border-radius:12px;
            color:#fff;
            font-weight:700;
            margin:6px 0;
        }
    </style>
    """, unsafe_allow_html=True)

# ============================================================================
# WORKOUT DATA
# ============================================================================
PROGRAM_SPLIT = {
    "Level 1": {
        "Monday": "BOOTY",
        "Tuesday": "ABS/CORE & CARDIO",
        "Wednesday": "REST",
        "Thursday": "LEGS & BOOTY",
        "Friday": "ABS/CORE ONLY (you can do at home)",
        "Saturday": "LIGHT SHOULDERS & BACK",
        "Sunday": "REST"
    },
    "Level 2": {
        "Monday": "BOOTY A",
        "Tuesday": "LIGHT SHOULDERS & BACK",
        "Wednesday": "ABS/CORE & CARDIO",
        "Thursday": "BOOTY B",
        "Friday": "SHOULDERS & ABS/CORE",
        "Saturday": "LEGS & BOOTY",
        "Sunday": "REST"
    }
}

# Exercise definitions
def warmup_item():
    return {"name": "Booty/Leg Activation", "sets": "—", "reps": "5 min", "category": "Warm-up"}

def stretching_item():
    return {"name": "Stretching", "sets": "—", "reps": "5 min", "category": "Recovery"}

def stairmaster_L1():
    return {"name": "Stairmaster Workout", "sets": "—", "reps": "30 min: fat loss levels 8-10", "category": "Cardio"}

def stairmaster_L2():
    return {"name": "Stairmaster Workout", "sets": "—", "reps": "30 min: fat loss levels 8-10", "category": "Cardio"}

# Core exercises
KICKBACKS = {"name": "Kickbacks", "sets": "1 warm up set + 3 (each side)", "reps": "10-12 reps; 12-15 reps (last set)", "category": "Booty"}
HIP_THRUST = {"name": "Hip Thrust", "sets": "1 warm up set + 3 + 1 AMRAP", "reps": "10-12 reps; 8 reps (last set); AMRAP ~20% avg weight", "category": "Booty"}
HYPEREXT = {"name": "Hyperextensions", "sets": "(1 warm up set) + 3 + 1 AMRAP (no weight)", "reps": "10-12 reps; 10s hold on last rep each set", "category": "Booty"}
RDLS = {"name": "RDLs (Romanian Deadlifts)", "sets": "1 warm up set + 3", "reps": "10-12 reps; 8 reps (last set)", "category": "Booty"}

# Workout lists - simplified
BOOTY_L1 = [warmup_item(), KICKBACKS, HIP_THRUST, HYPEREXT, RDLS, stairmaster_L1(), stretching_item()]

ABS_CORE_ONLY = [
    {"name": "Plank", "sets": "1", "reps": "1 min", "category": "Core"},
    {"name": "Plank Knee Taps", "sets": "1", "reps": "30 sec", "category": "Core"},
    {"name": "Reverse Plank", "sets": "1", "reps": "1 min", "category": "Core"},
    {"name": "Butterfly Kicks", "sets": "1", "reps": "30 sec", "category": "Core"},
    {"name": "Half Leg Raises", "sets": "1", "reps": "30 sec", "category": "Core"},
    {"name": "Dead Bugs", "sets": "1", "reps": "30 sec", "category": "Core"},
    {"name": "Repeat 2x total", "sets": "—", "reps": "Complete entire circuit twice", "category": "Core"}
]

# ============================================================================
# MEAL PLAN DATA
# ============================================================================
WEEKLY_MEALS = {
    "Option A: Omnivore": {
        "Monday": ["Greek yogurt + berries + oats", "Chicken, rice & broccoli", "Salmon, sweet potato, asparagus"],
        "Tuesday": ["Omelet + toast + fruit", "Turkey wrap + mixed greens", "Beef stir-fry + jasmine rice"],
        "Wednesday": ["Protein smoothie + banana + PB", "Chicken fajita bowl", "Shrimp tacos + slaw"],
        "Thursday": ["Overnight oats + chia + berries", "Sushi bowl (salmon, rice, edamame)", "Lean beef chili + quinoa"],
        "Friday": ["Eggs + avocado toast", "Grilled chicken Caesar", "Baked cod + potatoes + green beans"],
        "Saturday": ["Protein pancakes + fruit", "Turkey burger + salad", "Steak + rice + vegetables"],
        "Sunday": ["Cottage cheese + pineapple + granola", "Chicken pesto pasta + veggies", "Roast chicken + couscous + salad"]
    },
    "Option B: Pescatarian": {
        "Monday": ["Greek yogurt + berries + oats", "Tuna salad wrap + greens", "Salmon, sweet potato, asparagus"],
        "Tuesday": ["Tofu scramble + toast", "Shrimp quinoa bowl", "Baked cod + potatoes + broccoli"],
        "Wednesday": ["Protein smoothie + banana", "Sushi bowl", "Garlic shrimp pasta + salad"],
        "Thursday": ["Overnight oats + chia", "Miso salmon + rice + bok choy", "Veggie chili + avocado toast"],
        "Friday": ["Eggs + avocado toast", "Mediterranean tuna pasta", "Seared tuna + rice + edamame"],
        "Saturday": ["Protein pancakes + fruit", "Grilled shrimp tacos + slaw", "Baked halibut + quinoa + veg"],
        "Sunday": ["Cottage cheese + fruit", "Smoked salmon bagel", "Shrimp stir-fry + brown rice"]
    },
    "Option C: Vegan": {
        "Monday": ["Tofu scramble + toast + fruit", "Lentil quinoa bowl + veggies", "Tempeh stir-fry + rice"],
        "Tuesday": ["Overnight oats + chia + berries", "Chickpea wrap + greens", "Black bean pasta + broccoli"],
        "Wednesday": ["Pea-protein smoothie + banana + PB", "Buddha bowl", "Lentil curry + basmati rice"],
        "Thursday": ["Buckwheat pancakes + fruit", "Hummus + falafel bowl", "Tofu poke bowl"],
        "Friday": ["Tofu scramble burrito", "Pea-protein pasta + marinara", "Tempeh fajitas + tortillas"],
        "Saturday": ["Oatmeal + seeds + berries", "Chickpea quinoa bowl", "Tofu steak + potatoes + veg"],
        "Sunday": ["Soy yogurt + granola + fruit", "Vegan sushi + edamame", "Lentil bolognese + pasta"]
    }
}

# ============================================================================
# PAGE COMPONENTS
# ============================================================================
def render_hero():
    """Render the hero section"""
    st.markdown("""
    <div class="hero-section">
        <h1 class="main-header">HOURGLASS FITNESS TRANSFORMATION</h1>
        <p class="sub-header">12-Week plan for Booty, Core, Back & Shoulders — by Joane Aristilde</p>
    </div>
    """, unsafe_allow_html=True)

def render_homepage():
    """Render the main homepage - ENHANCED"""
    render_hero()

    st.markdown("## 🏠 Welcome to Your Fitness Journey!")

    # Admin photo upload section
    if ADMIN_MODE:
        with st.expander("🔧 Admin: Upload Coach Photo"):
            uploaded_photo = st.file_uploader(
                "Choose your photo to display on the homepage",
                type=['jpg', 'jpeg', 'png'],
                key="homepage_coach_photo"
            )
            if uploaded_photo is not None:
                # Save the uploaded photo
                try:
                    with open("coach_photo.jpg", "wb") as f:
                        f.write(uploaded_photo.getbuffer())
                    st.success("Photo saved! It will appear below.")
                    st.rerun()
                except Exception as e:
                    st.error(f"Error saving photo: {str(e)}")

    # Display coach photo - smaller and better positioned
    col1, col2, col3 = st.columns([2, 1, 2])
    with col2:
        if os.path.exists("coach_photo.jpg"):
            st.image("coach_photo.jpg", caption="Hourglass Fitness", width=450)
        elif ADMIN_MODE:
            st.info("👆 Use the admin panel above to upload your photo")

    st.markdown("---")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        <div class="info-card">
            <h3>✨ Transform Your Body</h3>
            <p>This comprehensive 12-week program is designed specifically for building your booty,
            strengthening your core, and sculpting your back and shoulders.</p>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="info-card">
            <h3>🎯 Your Goals, Your Way</h3>
            <p>Choose between Level 1 (beginner-friendly) or Level 2 (advanced) workouts.
            Track your progress, follow meal plans, and achieve lasting results!</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("## 🚀 Quick Navigation")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        if st.button("📚 Workout Overview", use_container_width=True, type="primary"):
            st.session_state.page = "workout_overview"
            st.rerun()

    with col2:
        if st.button("💪 Today's Workout", use_container_width=True, type="primary"):
            st.session_state.page = "workout_tracker"
            st.rerun()

    with col3:
        if st.button("🍽️ Meal Plans", use_container_width=True, type="primary"):
            st.session_state.page = "meal_plans"
            st.rerun()

    with col4:
        if st.button("📊 Weight Tracker", use_container_width=True, type="primary"):
            st.session_state.page = "weight_tracker"
            st.rerun()

    st.markdown("---")

    # --- MODIFICATION START: Add "Getting Started" Tabs ---
    st.markdown("### 🎓 Getting Started")

    tab_guide, tab_video = st.tabs(["📖 How to Use This App", "🎥 Getting Started Video"])

    with tab_guide:
        with st.expander("How to Use This App", expanded=True):
            st.markdown("""
            1. **Read the Workout Overview** - Understand the program structure and principles
            2. **Choose Your Level** - Start with Level 1 if you're new to this program
            3. **Follow Daily Workouts** - Use the workout tracker to log your exercises
            4. **Track Your Progress** - Use the weight tracker to monitor your transformation
            5. **Follow Meal Plans** - Nutrition is key to your success!

            **Remember:** Consistency and proper form are the keys to success! 💪
            """)

    with tab_video:
        st.markdown("#### Add or View the 'Getting Started' Video")
        st.info("You can upload a video file directly or provide a URL (e.g., from YouTube).")

        videos = load_videos_json()

        # Input fields for video source
        uploaded_file = st.file_uploader(
            "Upload a video file",
            type=["mp4", "mov", "m4v"],
            key="getting_started_uploader"
        )
        video_url = st.text_input(
            "Or, provide a video URL",
            placeholder="https://www.youtube.com/watch?v=...",
            key="getting_started_url"
        )

        if st.button("Save 'Getting Started' Video", key="save_getting_started"):
            source_to_save = None
            if uploaded_file is not None:
                try:
                    # Create a unique filename to avoid overwrites
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    # Sanitize filename
                    safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '', uploaded_file.name)
                    filename = f"getting_started_{timestamp}_{safe_filename}"
                    video_path = os.path.join(VIDEOS_DIR, filename)

                    with open(video_path, "wb") as f:
                        f.write(uploaded_file.getbuffer())
                    source_to_save = video_path
                    st.success(f"File '{uploaded_file.name}' uploaded successfully!")
                except Exception as e:
                    st.error(f"Failed to save uploaded file: {e}")
            elif video_url:
                source_to_save = video_url
                st.success("Video URL saved!")
            else:
                st.warning("Please upload a file or provide a URL to save.")

            if source_to_save:
                videos["__getting_started__"] = source_to_save
                if save_videos_json(videos):
                    st.rerun() # Rerun to reflect changes immediately
                # Error is handled inside save_videos_json

        # Display the saved video
        st.markdown("---")
        st.markdown("#### Current 'Getting Started' Video")
        if "__getting_started__" in videos and videos["__getting_started__"]:
            getting_started_source = videos["__getting_started__"]
            try:
                # Apply a narrow layout for consistency with the intro video
                _ , col_vid_gs, _ = st.columns([1, 2, 1])
                with col_vid_gs:
                    if getting_started_source.startswith(("http", "https")):
                         st.video(getting_started_source)
                    elif os.path.exists(getting_started_source):
                         st.video(getting_started_source)
                    else:
                         st.warning("Saved video file not found. It may have been moved or deleted.")
            except Exception as e:
                st.error(f"Could not display video: {e}")
        else:
            st.info("No 'Getting Started' video has been saved yet.")
    # --- MODIFICATION END ---


    # Quick stats if user has data
    if st.session_state.get('progress_entries') or st.session_state.get('completed_exercises'):
        st.markdown("### 📈 Your Quick Stats")
        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("Current Level", f"Level {st.session_state.selected_level}")

        with col2:
            completed = len([e for e in st.session_state.completed_exercises if e])
            st.metric("Exercises Completed", completed)

        with col3:
            entries = len(st.session_state.get('progress_entries', []))
            st.metric("Progress Entries", entries)

    # Add intro video at bottom (NEW)
    render_homepage_intro_video()

def render_workout_overview():
    """Render the workout overview page"""
    st.markdown("# 📚 Workout Overview")

    tab1, tab2, tab3, tab4 = st.tabs(["Program Structure", "Progressive Overload", "Exercise Guide", "About Your Coach"])

    with tab1:
        st.markdown("""
        ## Your Workout Journey Starts Here! 💪

        ### How Your Plan Works
        Ready to get stronger? Your workouts are split into easy-to-follow categories:
        - **Booty** – Shape and strengthen your glutes
        - **Legs & Booty** – Power up your lower body
        - **Light Shoulders & Back** – Build upper body strength
        - **Abs/Core Only** – Perfect for home workouts

        ### Pick Your Starting Point
        - **New to fitness?** Start with **Level 1** to build confidence.
        - **Ready for more?** Move to **Level 2** when Level 1 feels easy.

        ### Bonus Workouts
        On a rest day and feel motivated? Try **Abs/Core Only** (great at home).

        > **Important:** Listen to your body. Rest days are when muscles grow stronger.

        ### Pro Tips for Success
        ✨ **Level 2** is the exact workout I use personally.
        ✨ I switch routines every **12 weeks** to keep things fresh and challenging.
        ✨ Follow the **exercise order**—it's structured for best results.

        **Remember:** Every rep gets you stronger. Every workout gets you closer to your goals.
        """)

        # Show weekly schedules
        st.markdown("---")
        st.markdown("### 📅 Weekly Schedules")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("#### Level 1")
            schedule_df = pd.DataFrame(list(PROGRAM_SPLIT["Level 1"].items()), columns=["Day", "Workout"])
            st.table(schedule_df)

        with col2:
            st.markdown("#### Level 2")
            schedule_df = pd.DataFrame(list(PROGRAM_SPLIT["Level 2"].items()), columns=["Day", "Workout"])
            st.table(schedule_df)

    with tab2:
        st.markdown("""
        ## 🚀 Progressive Overload: The Key to Growth

        ### What Is Progressive Overload?
        Progressive overload is gradually increasing the demands on your muscles to force them to adapt and grow stronger.

        ### How to Apply It:

        **Week 1-2: Foundation**
        - Focus on form and technique
        - Use lighter weights to learn movements
        - Track your starting weights

        **Week 3-4: Building**
        - Increase weight by 5-10% when you can complete all sets
        - Maintain proper form
        - Add 1-2 reps if weight increase is too much

        **Week 5-8: Progressing**
        - Continue increasing weight gradually
        - Focus on mind-muscle connection
        - Consider adding pause reps or tempo work

        **Week 9-12: Pushing**
        - Challenge yourself with heavier weights
        - Add intensity techniques (drop sets, supersets)
        - Prepare for next program cycle

        ### Progressive Overload Methods:
        1. **Increase Weight** - Add 2.5-5 lbs when ready
        2. **Add Reps** - Go from 10 to 12 reps before increasing weight
        3. **Add Sets** - Progress from 3 to 4 sets
        4. **Decrease Rest** - Reduce rest between sets
        5. **Improve Form** - Better technique = more muscle activation

        ### When to Progress:
        - ✅ You complete all sets and reps with good form
        - ✅ The last 2-3 reps feel challenging but doable
        - ✅ You've done the same weight for 2-3 workouts

        ### Safety First:
        - ⚠️ Never sacrifice form for heavier weight
        - ⚠️ Listen to your body - some days you need to maintain or reduce
        - ⚠️ Proper warm-up is essential before heavy lifts
        """)

    with tab3:
        st.markdown("""
        ## 📖 Exercise Guide

        ### Key Exercise Categories:

        **🍑 Booty Builders**
        - Hip Thrusts: The #1 glute builder
        - RDLs: Target glutes and hamstrings
        - Kickbacks: Isolation for glute activation
        - Hyperextensions: Posterior chain development

        **🦵 Leg Shapers**
        - Bulgarian Split Squats: Unilateral strength
        - Leg Press: Quad and glute development
        - Leg Curls: Hamstring isolation

        **💪 Upper Body**
        - Lat Pulldowns: Back width
        - Rows: Back thickness
        - Shoulder Press: Deltoid development
        - Face Pulls: Rear delts and posture

        **🎯 Core**
        - Planks: Core stability
        - Dead Bugs: Core control
        - Leg Raises: Lower abs

        ### Form Tips:
        - Always warm up before working sets
        - Control the eccentric (lowering) phase
        - Focus on mind-muscle connection
        - Full range of motion > heavy weight
        """)

    with tab4:
        st.markdown("""
        ## 👩‍🏫 About Your Coach - Joane Aristilde
        """)

        col1, col2 = st.columns([1, 2])

        with col1:
            # Check for coach photo
            coach_photo_path = "coach_photo.jpg"
            if os.path.exists(coach_photo_path):
                st.image(coach_photo_path, caption="Joane Aristilde", width=250)
            elif ADMIN_MODE:
                st.info("Upload coach_photo.jpg to display photo")
                uploaded_photo = st.file_uploader("Upload Coach Photo", type=['jpg', 'jpeg', 'png'], key="coach_photo_upload_overview")
                if uploaded_photo:
                    with open("coach_photo.jpg", "wb") as f:
                        f.write(uploaded_photo.getbuffer())
                    st.success("Photo uploaded! Refresh to see it.")
                    st.rerun()

        with col2:
            st.markdown("""
            ### Your Transformation Partner

            Welcome! I'm Joane Aristilde, and I'm here to guide you through your fitness transformation journey.

            **My Philosophy:**
            - Building strength builds confidence
            - Consistency beats perfection
            - Your body is capable of amazing things
            - Every workout is a step toward your goals

            **This Program Features:**
            - ✅ 12 weeks of structured workouts
            - ✅ Progressive overload for real results
            - ✅ Focus on glutes, core, and upper body
            - ✅ Suitable for gym or home modifications
            - ✅ Nutrition guidance included

            **My Promise to You:**
            Follow this program, stay consistent, and you WILL see results.
            I've designed every workout with your success in mind.

            Let's build your dream body together! 💪
            """)

        st.markdown("---")
        st.info("💡 **Pro Tip:** Take progress photos every week to see your amazing transformation!")


def render_workout_tracker():
    """Render the workout tracker page - ENHANCED"""
    st.markdown("# 💪 Workout Tracker")

    # Show admin mode status
    if ADMIN_MODE:
        st.success("🔧 **Admin Mode Active** - You can upload/manage videos directly in each exercise")

    # Admin panel at top if in admin mode (for managing all videos at once)
    if ADMIN_MODE:
        with st.expander("🔧 Admin: Bulk Video Manager (Optional)"):
            render_admin_video_manager()

    # Level selection
    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        if st.button("🌟 Level 1", use_container_width=True):
            st.session_state.selected_level = 1
            st.session_state.selected_workout = None
            st.rerun()

    with col2:
        if st.button("🔥 Level 2", use_container_width=True):
            st.session_state.selected_level = 2
            st.session_state.selected_workout = None
            st.rerun()

    with col3:
        st.info(f"**Current: Level {st.session_state.selected_level}**")

    # Today's workout
    today = date.today().strftime("%A")
    schedule = PROGRAM_SPLIT[f"Level {st.session_state.selected_level}"]

    st.markdown("---")

    # Workout selection
    st.markdown("### 📅 Select Your Workout")

    # Weekly view
    cols = st.columns(7)
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for idx, (col, day) in enumerate(zip(cols, days)):
        with col:
            workout = schedule[day]
            is_today = day == today

            if is_today:
                st.markdown(f"**📍 {day}**")
            else:
                st.markdown(f"{day}")

            if workout == "REST":
                st.markdown("🛋️ *Rest*")
            else:
                if st.button(
                    workout,
                    key=f"day_{day}",
                    use_container_width=True,
                    type="primary" if is_today else "secondary"
                ):
                    st.session_state.selected_workout = workout
                    st.session_state.selected_workout_day = day
                    st.rerun()

    st.markdown("---")

    # Display selected workout
    if st.session_state.selected_workout:
        workout_label = st.session_state.selected_workout
        workout_day = st.session_state.selected_workout_day
        workout_date = date.today().isoformat()

        st.markdown(f"## 🎯 {workout_day}: {workout_label}")

        # Get exercises for this workout
        exercises = get_exercises_for_day(
            st.session_state.selected_level,
            workout_day,
            workout_label
        )

        # Display enhanced exercise cards with video and tracking
        for idx, exercise in enumerate(exercises, 1):
            render_enhanced_exercise_card(exercise, idx, workout_date)
            st.markdown("---")
    else:
        st.info("👆 Select a workout day above to see exercises")

def get_exercises_for_day(level, day_name, workout_label):
    """Get exercises for a specific day and workout"""
    # Simplified version - return sample exercises
    if workout_label == "REST":
        return [{"name": "Rest Day", "sets": "—", "reps": "Recovery", "category": "Rest"}]
    elif "BOOTY" in workout_label:
        return BOOTY_L1
    elif "ABS/CORE" in workout_label:
        return ABS_CORE_ONLY
    else:
        # Return a basic workout
        return [
            {"name": "Exercise 1", "sets": "3", "reps": "10-12", "category": "Main"},
            {"name": "Exercise 2", "sets": "3", "reps": "10-12", "category": "Main"},
            {"name": "Exercise 3", "sets": "3", "reps": "10-12", "category": "Accessory"},
        ]

def render_exercise_card(exercise, idx):
    """Render a single exercise card - ORIGINAL (kept for compatibility)"""
    with st.container():
        col1, col2 = st.columns([3, 1])

        with col1:
            st.markdown(f"### {idx}. {exercise['name']}")
            st.markdown(f"**Sets:** {exercise['sets']} | **Reps:** {exercise['reps']}")
            st.markdown(f"*Category: {exercise['category']}*")

        with col2:
            # Simple checkbox for completion
            key = f"ex_{idx}_{exercise['name'].replace(' ', '_')}"
            completed = st.checkbox("✅ Done", key=key)

            if completed and key not in st.session_state.completed_exercises:
                st.session_state.completed_exercises.append(key)

def render_meal_plans():
    """Render the meal plans page"""
    st.markdown("# 🍽️ Meal Plans")

    tab1, tab2, tab3 = st.tabs(["Weekly Plans", "Macro Calculator", "Nutrition Tips"])

    with tab1:
        st.markdown("## 📅 Weekly Meal Plans")

        # Diet type selection
        diet_type = st.selectbox(
            "Select your diet type:",
            list(WEEKLY_MEALS.keys()),
            key="meal_plan_selector"
        )

        # Display meal plan
        meals = WEEKLY_MEALS[diet_type]

        # Create a properly formatted dataframe
        meal_data = []
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for day in days:
            if day in meals:
                meal_data.append({
                    "Day": day,
                    "Breakfast": meals[day][0] if len(meals[day]) > 0 else "",
                    "Lunch": meals[day][1] if len(meals[day]) > 1 else "",
                    "Dinner": meals[day][2] if len(meals[day]) > 2 else ""
                })

        df = pd.DataFrame(meal_data)
        st.table(df)

        # Nutrition tips
        with st.expander("💡 Nutrition Tips"):
            st.markdown("""
            ### Key Points for Success:
            - **Protein Priority:** Aim for 0.8-1g per pound of body weight
            - **Hydration:** Drink at least 2-3L of water daily
            - **Meal Timing:** Eat protein within 2 hours post-workout
            - **Consistency:** Stick to your plan 80% of the time
            - **Flexibility:** Allow for treats and social occasions

            ### For Muscle Growth:
            - Slight caloric surplus (200-300 calories above maintenance)
            - Focus on whole foods
            - Don't skip carbs - they fuel your workouts!
            - Consider creatine supplementation (5g daily)
            """)

    with tab2:
        st.markdown("## 🧮 Macro Calculator")

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("### Your Stats")
            weight = st.number_input("Weight (lbs)", 100, 300, 150)
            height = st.number_input("Height (inches)", 50, 80, 65)
            age = st.number_input("Age", 18, 80, 25)
            activity = st.selectbox(
                "Activity Level",
                ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"]
            )

        with col2:
            st.markdown("### Your Goals")
            goal = st.selectbox("Goal", ["Lose Fat", "Maintain", "Build Muscle"])

            # Simple calorie calculation
            if activity == "Sedentary":
                multiplier = 1.2
            elif activity == "Lightly Active":
                multiplier = 1.375
            elif activity == "Moderately Active":
                multiplier = 1.55
            else:
                multiplier = 1.725

            # Basic BMR calculation (Mifflin-St Jeor)
            bmr = (10 * weight * 0.453592) + (6.25 * height * 2.54) - (5 * age) - 161
            tdee = bmr * multiplier

            if goal == "Lose Fat":
                calories = tdee - 300
            elif goal == "Maintain":
                calories = tdee
            else:  # Build Muscle
                calories = tdee + 300

            st.markdown("### Your Daily Targets")
            st.metric("Calories", f"{int(calories)} kcal")

            # Macro split
            protein_g = int(weight * 0.8)
            fat_g = int(calories * 0.25 / 9)
            carbs_g = int((calories - (protein_g * 4) - (fat_g * 9)) / 4)

            col_a, col_b, col_c = st.columns(3)
            col_a.metric("Protein", f"{protein_g}g")
            col_b.metric("Carbs", f"{carbs_g}g")
            col_c.metric("Fat", f"{fat_g}g")

    with tab3:
        st.markdown("""
        ## 🥗 Nutrition Tips for Success

        ### Pre-Workout (30-60 min before)
        - Banana + peanut butter
        - Rice cakes + honey
        - Oatmeal + berries
        - Coffee or green tea

        ### Post-Workout (within 2 hours)
        - Protein shake + fruit
        - Greek yogurt + granola
        - Chicken + rice
        - Tuna sandwich

        ### Supplements to Consider
        - **Creatine:** 5g daily for strength and muscle
        - **Protein Powder:** Convenient protein source
        - **Multivitamin:** Cover nutritional gaps
        - **Omega-3:** Anti-inflammatory benefits
        - **Vitamin D:** Especially if limited sun exposure

        ### Hydration Goals
        - Minimum: 2-3 liters per day
        - During workout: 500-750ml
        - Add electrolytes for intense sessions

        ### 80/20 Rule
        Eat nutritious whole foods 80% of the time, enjoy treats 20% of the time!
        """)

def render_weight_tracker():
    """Render the weight tracker page"""
    st.markdown("# 📊 Weight Tracker")

    # Initialize weight tracker storage if available
    if STORAGE_AVAILABLE:
        init_storage()

    tab1, tab2, tab3 = st.tabs(["Daily Entry", "Progress Charts", "History"])

    with tab1:
        st.markdown("## 📝 Daily Check-in")

        with st.form("daily_weight_entry"):
            col1, col2, col3 = st.columns(3)

            with col1:
                weight = st.number_input("Weight (lbs)", 80.0, 400.0, 150.0, 0.5)
                waist = st.number_input("Waist (inches)", 20.0, 60.0, 30.0, 0.5)
                hips = st.number_input("Hips (inches)", 25.0, 70.0, 36.0, 0.5)

            with col2:
                water = st.number_input("Water (liters)", 0.0, 10.0, 2.5, 0.25)
                calories_in = st.number_input("Calories In", 0, 5000, 1700, 50)
                calories_out = st.number_input("Calories Out", 0, 2000, 400, 50)

            with col3:
                energy = st.slider("Energy Level", 1, 10, 7)
                sleep = st.number_input("Sleep (hours)", 0.0, 12.0, 7.0, 0.5)

            notes = st.text_area("Notes", placeholder="How are you feeling? Any observations?")

            submitted = st.form_submit_button("💾 Save Entry", use_container_width=True, type="primary")

            if submitted:
                try:
                    # Save to session state
                    entry = {
                        "date": date.today().isoformat(),
                        "weight": weight,
                        "waist": waist,
                        "hips": hips,
                        "water": water,
                        "calories_in": calories_in,
                        "calories_out": calories_out,
                        "net_calories": calories_in - calories_out,
                        "energy": energy,
                        "sleep": sleep,
                        "notes": notes
                    }

                    if "weight_entries" not in st.session_state:
                        st.session_state.weight_entries = []

                    st.session_state.weight_entries.append(entry)

                    # Also save using storage module if available
                    if STORAGE_AVAILABLE:
                        try:
                            save_daily_log(
                                user_id="default",
                                date=date.today().isoformat(),
                                weight_kg=weight * 0.453592,
                                water_l=water,
                                cal_in=calories_in,
                                cal_out=calories_out,
                                waist_in=waist,
                                hips_in=hips,
                                energy_1_10=energy,
                                notes=notes,
                                photo_path=None,
                                on_target_flag="OK"
                            )
                        except:
                            pass  # Storage module might not be working

                    st.success("✅ Entry saved successfully!")
                    st.balloons()
                    st.rerun()

                except Exception as e:
                    st.error(f"Error saving entry: {str(e)}")

    with tab2:
        st.markdown("## 📈 Progress Charts")

        if st.session_state.get("weight_entries"):
            # Convert to DataFrame
            df = pd.DataFrame(st.session_state.weight_entries)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')

            # Weight trend
            st.markdown("### Weight Trend")
            weight_data = df[['date', 'weight']].dropna()
            if not weight_data.empty:
                st.line_chart(weight_data.set_index('date')['weight'])

            # Metrics
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                if len(df) >= 2:
                    weight_change = df.iloc[-1]['weight'] - df.iloc[0]['weight']
                    st.metric("Weight Change", f"{weight_change:+.1f} lbs")
                else:
                    st.metric("Weight Change", "N/A")

            with col2:
                avg_calories = df['net_calories'].mean() if 'net_calories' in df else 0
                st.metric("Avg Net Calories", f"{int(avg_calories)}")

            with col3:
                avg_water = df['water'].mean() if 'water' in df else 0
                st.metric("Avg Water", f"{avg_water:.1f}L")

            with col4:
                avg_energy = df['energy'].mean() if 'energy' in df else 0
                st.metric("Avg Energy", f"{avg_energy:.1f}/10")

            # Waist to Hip Ratio
            if 'waist' in df.columns and 'hips' in df.columns:
                st.markdown("### Waist-to-Hip Ratio")
                df['wh_ratio'] = df['waist'] / df['hips']
                ratio_data = df[['date', 'wh_ratio']].dropna()
                if not ratio_data.empty:
                    st.line_chart(ratio_data.set_index('date')['wh_ratio'])
        else:
            st.info("📊 Start tracking to see your progress charts!")

    with tab3:
        st.markdown("## 📜 History")

        if st.session_state.get("weight_entries"):
            df = pd.DataFrame(st.session_state.weight_entries)
            df = df.sort_values('date', ascending=False)

            # Display table with formatted columns
            display_df = df[['date', 'weight', 'waist', 'hips', 'water', 'calories_in', 'calories_out', 'energy', 'sleep']].copy()
            display_df['date'] = pd.to_datetime(display_df['date']).dt.strftime('%Y-%m-%d')

            st.dataframe(
                display_df,
                use_container_width=True,
                hide_index=True
            )

            # Export option
            if st.button("📥 Export to CSV", use_container_width=True):
                csv = df.to_csv(index=False)
                st.download_button(
                    label="Download CSV",
                    data=csv,
                    file_name=f"weight_tracker_{date.today()}.csv",
                    mime="text/csv",
                    use_container_width=True
                )
        else:
            st.info("📝 No entries yet. Start tracking above!")

def sidebar_navigation():
    """Sidebar navigation - ENHANCED"""
    with st.sidebar:
        st.markdown("# 🏋️ Navigation")

        # Navigation buttons
        pages = {
            "home": "🏠 Home",
            "workout_overview": "📚 Workout Overview",
            "workout_tracker": "💪 Workout Tracker",
            "meal_plans": "🍽️ Meal Plans",
            "weight_tracker": "📊 Weight Tracker"
        }

        for page_key, page_name in pages.items():
            if st.button(
                page_name,
                key=f"nav_{page_key}",
                use_container_width=True,
                type="primary" if st.session_state.page == page_key else "secondary"
            ):
                st.session_state.page = page_key
                st.rerun()

        st.markdown("---")

        # Quick Stats
        st.markdown("### 📈 Quick Stats")
        st.metric("Current Level", f"Level {st.session_state.selected_level}")

        completed = len(st.session_state.completed_exercises)
        st.metric("Exercises Done", completed)

        if st.session_state.get("weight_entries"):
            entries = len(st.session_state.weight_entries)
            st.metric("Weight Entries", entries)

        # Show admin mode indicator
        if ADMIN_MODE:
            st.markdown("---")
            st.success("🔧 Admin Mode Active")

        st.markdown("---")

        # Settings
        with st.expander("⚙️ Settings"):
            if st.button("🔄 Reset All Data", use_container_width=True):
                if st.checkbox("Confirm reset"):
                    for key in ["completed_exercises", "progress_entries", "weight_entries", "workout_sets"]:
                        if key in st.session_state:
                            st.session_state[key] = [] if key != "workout_sets" else {}
                    st.success("Data reset!")
                    st.rerun()

# ============================================================================
# MAIN APP
# ============================================================================
def main():
    """Main application"""
    # Initialize
    init_session_state()
    load_styles()

    # Sidebar
    sidebar_navigation()

    # Route to appropriate page
    page = st.session_state.get("page", "home")

    if page == "home":
        render_homepage()
    elif page == "workout_overview":
        render_workout_overview()
    elif page == "workout_tracker":
        render_workout_tracker()
    elif page == "meal_plans":
        render_meal_plans()
    elif page == "weight_tracker":
        render_weight_tracker()
    else:
        render_homepage()

if __name__ == "__main__":
    main()