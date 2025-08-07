# app.py
# 1. Import necessary libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
import json

# 2. Configure the Flask App and Gemini API
app = Flask(__name__)
CORS(app)

try:
    # Using the API key you provided
    genai.configure(api_key="AIzaSyCXPk-S3qNYYU7f960YP1XIwKQMIUigWAE")
    # Using the gemini-1.5-flash model as requested
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    model = None

# --- API Endpoints ---

# **NEW** Root URL to check if the server is running
@app.route('/')
def index():
    return "<h1>Sahayata AI Backend is running!</h1>"

# 3. API Endpoint for Diet Planner
@app.route('/generate-diet-plan', methods=['POST'])
def generate_diet_plan():
    if not model:
        return jsonify({"error": "Gemini API not configured"}), 500
    data = request.json
    ingredients = data.get('ingredients', 'roti, sabzi, dal')
    prompt = f"Create a simple, healthy, and fun meal recipe for a child with special needs using the following ingredients: {ingredients}. Make it sound appealing for a child. The recipe should be one paragraph long."
    try:
        response = model.generate_content(prompt)
        return jsonify({"recipe": response.text})
    except Exception as e:
        error_msg = str(e)
        if "quota" in error_msg.lower():
            return jsonify({
                "error": "AI service temporarily unavailable - daily limit reached. Please try again tomorrow or contact support.",
                "fallback": "Here's a simple recipe: Mix your ingredients with love and serve with a smile!"
            }), 429
        else:
            return jsonify({"error": "AI service temporarily unavailable. Please try again later."}), 500

# 4. API Endpoint for Exercise Planner
@app.route('/generate-exercise-plan', methods=['POST'])
def generate_exercise_plan():
    if not model:
        return jsonify({"error": "Gemini API not configured"}), 500
    data = request.json
    duration = data.get('duration', '10')
    prompt = f"""
    Create a fun, simple, and safe {duration}-minute exercise routine for a young child with special needs.

    Please provide your response in a valid JSON format. The JSON object should have one key: "routine".
    This key should be a list of 3-5 exercise objects.
    Each exercise object must have three keys: 
    1. 'name' (string with a fun, creative name), 
    2. 'duration' (string, e.g., "1 minute"),
    3. 'description' (string, a 2-line explanation of how to do the exercise).

    Example format:
    {{
      "routine": [
        {{
          "name": "Dinosaur Stomps",
          "duration": "1 minute",
          "description": "March around the room lifting your knees up high and stomping your feet like a giant dinosaur. Make big roaring sounds!"
        }}
      ]
    }}
    """
    
    generation_config = {
        "response_mime_type": "application/json",
    }
    
    try:
        response = model.generate_content(prompt, generation_config=generation_config)
        routine_json = json.loads(response.text)
        return jsonify(routine_json)
    except Exception as e:
        print(f"An error occurred in /generate-exercise-plan: {e}")
        return jsonify({"error": str(e)}), 500

# 5. API Endpoint for Learning Path
@app.route('/generate-learning-path', methods=['POST'])
def generate_learning_path():
    if not model:
        return jsonify({"error": "Gemini API not configured"}), 500
        
    data = request.json
    child_name = data.get('name', 'the child')
    learning_needs = data.get('needs')
    learning_style = data.get('style')
    focus_subjects = data.get('subjects')
    progress_summary = data.get('summary', 'No summary provided.')

    prompt = f"""
    Create a highly personalized 4-week learning plan for a child with special needs based on the following details.

    **Child's Profile:**
    - Name: {child_name}
    - Learning Needs & Challenges: {learning_needs}
    - Preferred Learning Style: {learning_style}
    - Focus Subjects: {focus_subjects}
    - Current Progress: {progress_summary}

    **Your Task:**
    Generate a response in a valid JSON format. The JSON object must have a key "planTitle" and a key "weeklyPlan".
    The "weeklyPlan" should be a list of 4 objects, one for each week.
    Each weekly object must have three keys: 'week' (e.g., "Week 1"), 'theme' (string), and 'tasks' (a list of 2-3 strings).
    The tasks must be tailored to the child's specific learning style and needs.
    The tone must be encouraging and positive.

    Example format:
    {{
      "planTitle": "Alex's 4-Week Math Adventure",
      "weeklyPlan": [
        {{
          "week": "Week 1",
          "theme": "Building Blocks of Addition",
          "tasks": ["Task 1 description...", "Task 2 description..."]
        }}
      ]
    }}
    """
    
    generation_config = {
        "response_mime_type": "application/json",
    }

    try:
        response = model.generate_content(prompt, generation_config=generation_config)
        plan_json = json.loads(response.text)
        return jsonify(plan_json)
    except Exception as e:
        print(f"An error occurred in /generate-learning-path: {e}")
        return jsonify({"error": str(e)}), 500

# 6. API Endpoint for Fun Activities
@app.route('/generate-activities', methods=['POST'])
def generate_activities():
    if not model:
        return jsonify({"error": "Gemini API not configured"}), 500
    
    data = request.json
    condition = data.get('condition')

    prompt = f"""
    Generate a list of 4-5 fun and developmental activities for a child with {condition}.
    
    Please provide your response in a valid JSON format. The JSON object should have one key: "activities".
    This key should correspond to a list of activity objects.
    Each activity object must have four keys:
    1.  'title' (string)
    2.  'description' (string)
    3.  'benefit' (string)
    4.  'type' (string), which must be one of the following: "Physical", "Art-Based", "Interactive", or "Sensory".

    Example format:
    {{
      "activities": [
        {{
          "title": "Example Physical Game",
          "description": "A fun game that involves...",
          "benefit": "Improves gross motor skills.",
          "type": "Physical"
        }}
      ]
    }}
    """
    
    generation_config = {
        "response_mime_type": "application/json",
    }

    try:
        response = model.generate_content(prompt, generation_config=generation_config)
        activities_json = json.loads(response.text)
        return jsonify(activities_json)
    except Exception as e:
        print(f"An error occurred in /generate-activities: {e}")
        return jsonify({"activities": [{"title": "AI Error", "description": "The AI could not generate activities at this time. Please try again.", "benefit": "N/A", "type": "Error"}]})


# 7. This makes the server run when you execute the file
if __name__ == '__main__':
    app.run(debug=True, port=5001)
