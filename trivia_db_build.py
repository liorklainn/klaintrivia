from openai import OpenAI
import json
import os

# Load OpenAI API key from environment variable
client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key=os.getenv("OPENAI_API_KEY"),
)

# Function to read existing questions from jsonl file
def load_existing_questions(file_path):
    questions = []
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            for line in file:
                questions.append(json.loads(line)['question'])
    return questions

# Function to save new questions and answers to jsonl file
def save_new_question(file_path, new_question, new_answer):
    with open(file_path, 'a') as file:
        json.dump({"question": new_question, "answer": new_answer}, file)
        file.write("\n")

# Function to generate new True/False trivia questions using OpenAI GPT API
def generate_trivia_questions_and_answers(topic, existing_questions, num_questions=5):
    # Create the messages for the chat API
    messages = [
        {"role": "system", "content": "You are a trivia question generator."},
        {
            "role": "user",
            "content": (
                f"Generate {num_questions} unique True/False trivia questions with their answers on the topic of '{topic}'. "
                "The questions should be concise, non-repetitive, and educational. Provide only 'True' or 'False' as the answer. "
                "Avoid any questions that have already been generated below:\n\n" +
                "\n".join(existing_questions) +
                "\n\nNew questions with answers:"
            )
        }
    ]
    
    # Call the OpenAI Chat API to generate trivia questions and answers
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    # Split the response content by lines and process them
    response_lines = response.choices[0].message.content.strip().split("\n")
    
    questions_and_answers = []
    question = None  # To hold the current question being processed
    for line in response_lines:
        line = line.strip()  # Remove extra spaces
        if not line:
            continue  # Skip empty lines
        
        # If it's a question (ends with '?'), store it
        if line.endswith("."):
            question = line
        # Otherwise, it's the answer (check if it contains 'true' or 'false')
        elif question and ("true" in line.lower() or "false" in line.lower()):
            answer = "True" if "true" in line.lower() else "False"  # Set 'True' or 'False'
            questions_and_answers.append((question, answer))
            question = None  # Reset question for next pair
    
    return questions_and_answers

# Main function to load existing questions, generate new ones with answers, and save them
def main(topic, file_path, num_questions=5):
    # Load previously generated questions from the jsonl file
    existing_questions = load_existing_questions(file_path)

    # Generate new True/False trivia questions with answers
    new_questions_and_answers = generate_trivia_questions_and_answers(topic, existing_questions, num_questions)

    # Save new questions and answers to the jsonl file
    for question, answer in new_questions_and_answers:
        save_new_question(file_path, question, answer)
        print(f"New question added: {question} (Answer: {answer})")

if __name__ == "__main__":
    topic = "Food"  # Change this topic to whatever you prefer
    file_path = "trivia_questions.jsonl"  # Path to the jsonl file
    num_questions = 20
    
    main(topic, file_path, num_questions)
