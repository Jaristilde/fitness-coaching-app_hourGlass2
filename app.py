import streamlit as st
import pandas as pd
from PIL import Image
import base64
import os

# Configure page
st.set_page_config(
    page_title="Hourglass Fitness Program",
    page_icon="⏳",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #FF1493;
        margin-bottom: 2rem;
    }
    .sub-header {
        font-size: 1.5rem;
        text-align: center;
        color: #666;
        margin-bottom: 3rem;
    }
    .workout-button {
        background: linear-gradient(45deg, #FF1493, #FF69B4);
        color: white;
        padding: 15px 30px;
        border: none;
        border-radius: 25px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        margin: 10px 0;
        transition: all 0.3s ease;
    }
    .workout-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 20, 147, 0.3);
    }
    .hero-section {
        text-align: center;
        padding: 2rem 0;
        background: linear-gradient(135deg, rgba(255, 20, 147, 0.1), rgba(255, 105, 180, 0.1));
        border-radius: 20px;
        margin-bottom: 3rem;
    }
    .exercise-card {
        background: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 15px 0;
        border-left: 5px solid #FF1493;
    }
    .exercise-form-tip {
        background: #FFF8DC;
        padding: 15px;
        border-radius: 10px;
        border-left: 4px solid #FFD700;
        margin: 10px 0;
    }
    .video-container {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 10px;
        border: 2px dashed #FF69B4;
        margin: 10px 0;
    }
    .media-tabs {
        display: flex;
        gap: 10px;
        margin: 15px 0;
    }
    .media-tab {
        padding: 8px 16px;
        border: 2px solid #FF69B4;
        border-radius: 20px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .media-tab.active {
        background: #FF69B4;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'current_page' not in st.session_state:
    st.session_state.current_page = 'home'
if 'current_workout' not in st.session_state:
    st.session_state.current_workout = None
if 'completed_exercises' not in st.session_state:
    st.session_state.completed_exercises = []
if 'main_video_url' not in st.session_state:
    st.session_state.main_video_url = ""

# Enhanced workout data with video support
WORKOUT_DATA = {
    "Booty Level 1": {
        "description": "Beginner-friendly glute focused workout for building that hourglass shape",
        "intro_video": "Add your workout intro video here",
        "total_time": "60-75 minutes",
        "exercises": [
            {
                "name": "Booty/Leg Activation",
                "duration": "5 minutes",
                "sets": "1",
                "reps": "Dynamic warm-up",
                "form_tips": [
                    "Focus on activating glutes with banded movements",
                    "Start slow and feel the muscles engage",
                    "Include: Banded clamshells, monster walks, glute bridges",
                    "Keep tension in the band throughout the movement"
                ],
                "video_cues": "Show the banded warm-up sequence",
                "image_placeholder": "🔥 Warm-up movements"
            },
            {
                "name": "Cable Kickbacks",
                "duration": "8-10 minutes",
                "sets": "1 warm-up + 3 working",
                "reps": "10-12, then 12-15 each leg",
                "form_tips": [
                    "Stand close to cable machine, ankle strap attached",
                    "Keep core tight, slight forward lean",
                    "Push through heel, don't use momentum",
                    "Feel the squeeze in your glutes at the top",
                    "Control the return - don't let weight slam down"
                ],
                "video_cues": "Demonstrate proper stance and leg positioning",
                "image_placeholder": "🍑 Cable kickback form"
            },
            {
                "name": "Hip Thrusts",
                "duration": "12-15 minutes",
                "sets": "1 warm-up + 3 working + 1 AMRAP",
                "reps": "10-12, then 8 heavy reps",
                "form_tips": [
                    "Shoulders on bench, feet flat on floor",
                    "Chin tucked to chest (double chin position)",
                    "Drive through heels, not toes",
                    "Squeeze glutes hard at the top",
                    "Pause for 1 second at peak contraction",
                    "Don't overextend back - focus on glutes"
                ],
                "video_cues": "Show setup, execution, and common mistakes to avoid",
                "image_placeholder": "🏋️‍♀️ Hip thrust technique"
            },
            {
                "name": "Hyperextensions",
                "duration": "10-12 minutes",
                "sets": "1 warm-up + 3 working + 1 AMRAP",
                "reps": "10-12 with 10 sec hold",
                "form_tips": [
                    "Position pad at hip crease, not waist",
                    "Keep back slightly rounded (not arched)",
                    "Toes pointed outward for glute activation",
                    "Initiate movement with glutes, not back",
                    "Hold at top for glute squeeze",
                    "Control the descent"
                ],
                "video_cues": "Emphasize glute-focused vs back-focused technique",
                "image_placeholder": "📐 Hyperextension form"
            },
            {
                "name": "Romanian Deadlifts",
                "duration": "10-12 minutes",
                "sets": "1 warm-up + 3 working",
                "reps": "10-12, then 8 heavy",
                "form_tips": [
                    "Feet hip-width apart, slight toe turn out",
                    "Hinge at hips, push butt back",
                    "Keep weights close to legs",
                    "Feel stretch in hamstrings",
                    "Drive through heels to return to standing",
                    "Squeeze glutes at the top"
                ],
                "video_cues": "Show the hip hinge movement and weight path",
                "image_placeholder": "💪 RDL technique"
            },
            {
                "name": "Treadmill Intervals",
                "duration": "8-10 minutes",
                "sets": "3 rounds",
                "reps": "1:30 @ 5.5km/h, 3min @ 9.5km/h, 30sec @ 12km/h",
                "form_tips": [
                    "Warm up with easy pace",
                    "Maintain steady rhythm during moderate intervals",
                    "Push hard during sprint intervals",
                    "Focus on proper running form",
                    "Cool down gradually"
                ],
                "video_cues": "Show proper treadmill form and interval transitions",
                "image_placeholder": "🏃‍♀️ Cardio intervals"
            },
            {
                "name": "Stretching",
                "duration": "5-8 minutes",
                "sets": "1",
                "reps": "Hold each stretch 30 seconds",
                "form_tips": [
                    "Focus on hip flexors, glutes, and hamstrings",
                    "Breathe deeply and relax into stretches",
                    "Don't bounce - hold steady",
                    "Feel gentle tension, not pain"
                ],
                "video_cues": "Demonstrate each stretch with proper alignment",
                "image_placeholder": "🧘‍♀️ Cool down stretches"
            }
        ]
    },
    "Booty Level 2": {
        "description": "Advanced glute training with additional exercises for maximum growth",
        "intro_video": "Add your advanced workout intro video here",
        "total_time": "75-90 minutes",
        "exercises": [
            {
                "name": "Advanced Booty/Leg Activation",
                "duration": "5 minutes",
                "sets": "1",
                "reps": "Dynamic warm-up + activation",
                "form_tips": [
                    "Include banded monster walks and clamshells",
                    "Add single-leg glute bridges",
                    "Fire hydrants with band resistance",
                    "Really focus on mind-muscle connection"
                ],
                "video_cues": "Show advanced activation sequence",
                "image_placeholder": "🔥 Advanced warm-up"
            },
            {
                "name": "Weighted Cable Kickbacks",
                "duration": "8-10 minutes",
                "sets": "1 warm-up + 3 working",
                "reps": "10-12, then 12-15 each leg",
                "form_tips": [
                    "Use heavier resistance than Level 1",
                    "Control the eccentric (lowering) for 2 seconds",
                    "Add pulses at the top for extra burn",
                    "Maintain perfect form even when fatigued"
                ],
                "video_cues": "Show tempo control and advanced variations",
                "image_placeholder": "🍑 Advanced kickbacks"
            }
            # Add remaining Level 2 exercises...
        ]
    }
}


# Navigation function
def show_page(page_name):
    st.session_state.current_page = page_name


# Video handling functions
def handle_video_upload(exercise_name, exercise_index):
    """Handle different types of video content for exercises"""

    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown(f"""
        <div class="video-container">
            <h4 style="text-align: center; color: #FF1493;">📹 Video Demonstration</h4>
            <p style="text-align: center; color: #666;">Choose how to add your {exercise_name} video</p>
        </div>
        """, unsafe_allow_html=True)

        # Video type selector
        video_type = st.selectbox(
            "Video Type:",
            ["Upload Video File", "YouTube Link", "Video URL", "Record Instructions"],
            key=f"video_type_{exercise_index}"
        )

        if video_type == "Upload Video File":
            uploaded_video = st.file_uploader(
                f"Upload {exercise_name} video (MP4, MOV, AVI - max 200MB)",
                type=['mp4', 'mov', 'avi', 'webm'],
                key=f"upload_video_{exercise_index}",
                help="For best results, keep videos under 200MB and 2 minutes long"
            )
            if uploaded_video:
                st.video(uploaded_video)
                st.success(f"✅ Video uploaded for {exercise_name}")

        elif video_type == "YouTube Link":
            youtube_url = st.text_input(
                f"YouTube URL for {exercise_name}:",
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                key=f"youtube_{exercise_index}"
            )
            if youtube_url:
                if embed_youtube_video(youtube_url):
                    st.success(f"✅ YouTube video linked for {exercise_name}")
                else:
                    st.error("Invalid YouTube URL. Please check the format.")

        elif video_type == "Video URL":
            video_url = st.text_input(
                f"Direct video URL for {exercise_name}:",
                placeholder="https://example.com/video.mp4",
                key=f"url_{exercise_index}"
            )
            if video_url:
                try:
                    st.video(video_url)
                    st.success(f"✅ Video URL added for {exercise_name}")
                except:
                    st.error("Could not load video from this URL")

        elif video_type == "Record Instructions":
            st.info("💡 **Recording Tips for Best Results:**")
            st.markdown("""
            **Setup:**
            - Use good lighting (natural light works best)
            - Film from the side to show full form
            - Keep camera steady (use tripod if possible)

            **Content:**
            - Show 3-5 perfect reps slowly
            - Demonstrate setup and starting position
            - Include common mistakes to avoid
            - Add verbal cues for key form points

            **Technical:**
            - Record in landscape (horizontal) mode
            - Keep videos 30-90 seconds long
            - Use phone's highest quality setting
            """)

    with col2:
        # Image upload option
        st.markdown("""
        <div class="video-container">
            <h4 style="text-align: center; color: #FF69B4;">📸 Photo Option</h4>
            <p style="text-align: center; color: #666;">Or upload step-by-step photos</p>
        </div>
        """, unsafe_allow_html=True)

        uploaded_images = st.file_uploader(
            f"Upload photos for {exercise_name} (multiple allowed)",
            type=['png', 'jpg', 'jpeg'],
            accept_multiple_files=True,
            key=f"images_{exercise_index}"
        )

        if uploaded_images:
            st.write(f"**{len(uploaded_images)} photos uploaded:**")
            cols = st.columns(min(len(uploaded_images), 3))
            for idx, img in enumerate(uploaded_images):
                with cols[idx % 3]:
                    image = Image.open(img)
                    st.image(image, caption=f"Step {idx + 1}", use_column_width=True)


def embed_youtube_video(url):
    """Extract YouTube video ID and embed video"""
    try:
        video_id = None
        if "youtube.com/watch?v=" in url:
            video_id = url.split("watch?v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1].split("?")[0]
        elif "youtube.com/embed/" in url:
            video_id = url.split("embed/")[1].split("?")[0]

        if video_id:
            st.markdown(f"""
            <div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;">
                <iframe 
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                    src="https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1" 
                    title="Exercise demonstration" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            """, unsafe_allow_html=True)
            return True
        return False
    except:
        return False


# Home page with video hero section
def show_home_page():
    # Hero section with main video
    st.markdown('<div class="hero-section">', unsafe_allow_html=True)

    st.markdown('<h1 class="main-header">🏖️ HOURGLASS FITNESS TRANSFORMATION</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Sculpt Your Dream Body with Science-Based Training</p>', unsafe_allow_html=True)

    # Main video/photo section
    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        # Tab selection for main media
        main_media_type = st.radio(
            "Choose your main display:",
            ["Photo", "Introduction Video", "YouTube Channel"],
            horizontal=True
        )

        if main_media_type == "Photo":
            uploaded_main_photo = st.file_uploader(
                "Upload your transformation photo",
                type=['png', 'jpg', 'jpeg'],
                key="main_photo"
            )
            if uploaded_main_photo:
                image = Image.open(uploaded_main_photo)
                st.image(image, use_column_width=True, caption="Your Transformation Journey")
            else:
                st.markdown("""
                <div style="background: linear-gradient(45deg, #FF1493, #FF69B4); 
                            height: 400px; 
                            border-radius: 20px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center;
                            color: white;
                            font-size: 24px;
                            font-weight: bold;
                            text-align: center;">
                    📸 YOUR TRANSFORMATION PHOTO<br>
                    <small style="font-size: 16px;">Upload your inspiring beach photo here</small>
                </div>
                """, unsafe_allow_html=True)

        elif main_media_type == "Introduction Video":
            intro_video = st.file_uploader(
                "Upload your introduction video",
                type=['mp4', 'mov', 'avi'],
                key="intro_video"
            )
            if intro_video:
                st.video(intro_video)
            else:
                st.info("Upload a personal introduction video to inspire your users!")

        elif main_media_type == "YouTube Channel":
            youtube_intro = st.text_input(
                "Enter your YouTube video URL:",
                placeholder="https://www.youtube.com/watch?v=...",
                key="youtube_intro"
            )
            if youtube_intro:
                embed_youtube_video(youtube_intro)

    st.markdown('</div>', unsafe_allow_html=True)

    # Workout selection buttons (existing code continues...)
    st.markdown("## 🎯 Choose Your Workout Level")

    col1, col2 = st.columns(2)

    with col1:
        workout = WORKOUT_DATA["Booty Level 1"]
        st.markdown(f"""
        <div class="exercise-card">
            <h3>🌟 BOOTY LEVEL 1</h3>
            <p><strong>Perfect for beginners</strong></p>
            <p>• {len(workout['exercises'])} targeted exercises</p>
            <p>• {workout['total_time']} total</p>
            <p>• Focus on form and foundation</p>
            <p>• Build that hourglass base</p>
        </div>
        """, unsafe_allow_html=True)

        if st.button("START BOOTY LEVEL 1", key="booty_l1", use_container_width=True):
            st.session_state.current_workout = "Booty Level 1"
            show_page('workout')

    with col2:
        workout = WORKOUT_DATA["Booty Level 2"]
        st.markdown(f"""
        <div class="exercise-card">
            <h3>🔥 BOOTY LEVEL 2</h3>
            <p><strong>Advanced training</strong></p>
            <p>• {len(workout['exercises'])} challenging exercises</p>
            <p>• {workout['total_time']} total</p>
            <p>• Maximum glute activation</p>
            <p>• Accelerated results</p>
        </div>
        """, unsafe_allow_html=True)

        if st.button("START BOOTY LEVEL 2", key="booty_l2", use_container_width=True):
            st.session_state.current_workout = "Booty Level 2"
            show_page('workout')


# Enhanced workout page with comprehensive video support
def show_workout_page():
    if st.session_state.current_workout is None:
        st.error("No workout selected. Please go back to home page.")
        if st.button("← Back to Home"):
            show_page('home')
        return

    workout = WORKOUT_DATA[st.session_state.current_workout]

    # Header
    col1, col2 = st.columns([3, 1])
    with col1:
        st.title(f"🍑 {st.session_state.current_workout}")
        st.write(workout["description"])
        st.info(f"⏱️ Total Time: {workout['total_time']}")
    with col2:
        if st.button("← Back to Home", use_container_width=True):
            show_page('home')

    # Progress tracker
    completed_count = len([ex for ex in workout["exercises"] if ex["name"] in st.session_state.completed_exercises])
    total_count = len(workout["exercises"])
    progress = completed_count / total_count if total_count > 0 else 0

    st.progress(progress)
    st.write(f"Progress: {completed_count}/{total_count} exercises completed ({progress:.1%})")

    # Exercise list with enhanced video support
    for i, exercise in enumerate(workout["exercises"], 1):
        is_completed = exercise["name"] in st.session_state.completed_exercises

        # Exercise card
        st.markdown(f"""
        <div class="exercise-card">
            <h3>Exercise {i}: {exercise["name"]} {'✅' if is_completed else '⏳'}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 15px 0;">
                <div><strong>Duration:</strong> {exercise["duration"]}</div>
                <div><strong>Sets:</strong> {exercise["sets"]}</div>
                <div><strong>Reps:</strong> {exercise["reps"]}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Expandable section for details
        with st.expander(f"📋 View {exercise['name']} Details, Videos & Form Tips"):

            # Video demonstration section
            st.markdown("### 🎥 Video Demonstration")
            handle_video_upload(exercise['name'], i)

            # Form tips section
            st.markdown("### 🎯 Form Tips & Technique")
            st.markdown(f"""
            <div class="exercise-form-tip">
                <h4>Key Points:</h4>
            </div>
            """, unsafe_allow_html=True)

            for tip in exercise['form_tips']:
                st.markdown(f"• {tip}")

            # Video cues
            if 'video_cues' in exercise:
                st.info(f"💡 **Video Focus:** {exercise['video_cues']}")

            # Exercise controls
            col1, col2, col3 = st.columns(3)

            with col1:
                if st.button(f"⏱️ Start Timer", key=f"timer_{i}"):
                    st.success(f"Timer started for {exercise['name']}! ⏰")

            with col2:
                if not is_completed:
                    if st.button(f"✅ Complete", key=f"complete_{i}"):
                        st.session_state.completed_exercises.append(exercise["name"])
                        st.success(f"Great job! 🎉")
                        st.experimental_rerun()
                else:
                    if st.button(f"↶ Undo", key=f"undo_{i}"):
                        st.session_state.completed_exercises.remove(exercise["name"])
                        st.experimental_rerun()

            with col3:
                # Rest timer
                if st.button(f"⏰ Rest Timer", key=f"rest_{i}"):
                    st.info("60 second rest period - prepare for next set!")

    # Workout completion
    if completed_count == total_count:
        st.balloons()
        st.success("🎉 Congratulations! You've completed your workout! 🎉")


# Main app logic
def main():
    if st.session_state.current_page == 'home':
        show_home_page()
    elif st.session_state.current_page == 'workout':
        show_workout_page()


if __name__ == "__main__":
    main()