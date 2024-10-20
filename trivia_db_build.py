from openai import OpenAI
import json
import os

# Load OpenAI API key from environment variable
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

# Function to read existing questions from jsonl file filtered by topic
def load_existing_questions_by_topic(file_path, topic):
    questions = []
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            for line in file:
                data = json.loads(line)
                if data.get('topic') == topic:
                    questions.append(data['question'])
    return questions

# Function to save new questions and answers to jsonl file, including the topic
def save_new_question(file_path, topic, new_question, new_answer):
    with open(file_path, 'a') as file:
        json.dump({"topic": topic, "question": new_question, "answer": new_answer}, file)
        file.write("\n")

# Function to generate new True/False trivia questions using OpenAI GPT API
def generate_trivia_questions_and_answers(topic, existing_questions, num_questions=5):
    # If there are too many existing questions, truncate to the most recent 200
    if len(existing_questions) > 200:
        existing_questions = existing_questions[-200:]
    
    # Create the prompt with an emphasis on generating new, unique questions
    prompt = (
        f"Generate {num_questions} unique True/False trivia questions with their answers on the topic of '{topic}'. "
        "Make sure the questions are concise, non-repetitive, and educational. "
        "Ensure that half of the answers are 'True' and the other half are 'False'. "
        "The questions below have already been generated; do NOT reuse or paraphrase them.\n\n"
        "Previously generated questions:\n" +
        "\n".join(existing_questions) +
        "\n\nGenerate new questions with answers in the format 'True or False: <question> (True/False)':"
    )
    
    # Create the messages for the chat API
    messages = [
        {"role": "system", "content": "You are a trivia question generator."},
        {"role": "user", "content": prompt}
    ]
    
    # Call the OpenAI Chat API to generate trivia questions and answers
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    # Split the response content by lines and process them
    response_lines = response.choices[0].message.content.strip().split("\n")
    
    questions_and_answers = []
    
    for line in response_lines:
        line = line.strip()  # Remove extra spaces
        if not line:
            continue  # Skip empty lines
        
        # Parse the question and answer from the format "True or False: <question> (True/False)"
        if "True or False:" in line and "(" in line and ")" in line:
            question_part = line.split(" (")[0].strip()  # Extracts "True or False: <question>"
            answer_part = line.split(" (")[1].strip(")")  # Extracts "True" or "False"
            
            # Clean up question text to remove the "True or False:" prefix
            question = question_part.replace("True or False:", "").strip()
            answer = "True" if "true" in answer_part.lower() else "False"
            
            questions_and_answers.append((question, answer))
    
    return questions_and_answers

# Main function to load existing questions, generate new ones with answers, and save them
def main(topic, file_path, num_questions=5):
    # Load previously generated questions from the jsonl file for the specific topic
    existing_questions = load_existing_questions_by_topic(file_path, topic)

    # Generate new True/False trivia questions with answers
    new_questions_and_answers = generate_trivia_questions_and_answers(topic, existing_questions, num_questions)

    # Save new questions and answers to the jsonl file, including the topic field
    for question, answer in new_questions_and_answers:
        save_new_question(file_path, topic, question, answer)
        print(f"New question added: {question} (Answer: {answer})")

if __name__ == "__main__":
    topic = "History"  # Change this topic to whatever you prefer
    file_path = "trivia_questions.jsonl"  # Path to the jsonl file
    num_questions = 20
    
    main(topic, file_path, num_questions)
