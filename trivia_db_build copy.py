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

# Function to save new questions to jsonl file
def save_new_question(file_path, new_question):
    with open(file_path, 'a') as file:
        json.dump({"question": new_question}, file)
        file.write("\n")

# Function to generate new trivia questions using OpenAI GPT API
def generate_trivia_questions(topic, existing_questions, num_questions=5):
    # Create the messages for the chat API
    messages = [
        {"role": "system", "content": "You are a trivia question generator."},
        {
            "role": "user",
            "content": (
                f"Generate {num_questions} unique yes/no trivia questions on the topic of '{topic}'. "
                "The questions should be concise, non-repetitive, and educational. Avoid any questions "
                "that have already been generated below:\n\n" +
                "\n".join(existing_questions) +
                "\n\nNew questions:"
            )
        }
    ]
    
    # Call the OpenAI Chat API to generate trivia questions
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    
    new_questionsText = response.choices[0].message.content.strip()

    # Extract the generated questions from the response text
    new_questions = response.choices[0].message.content.strip().split("\n")
    return [q.strip() for q in new_questions if q.strip()]

# Main function to load existing questions, generate new ones, and save them
def main(topic, file_path, num_questions=5):
    # Load previously generated questions from the jsonl file
    existing_questions = load_existing_questions(file_path)

    # Generate new trivia questions
    new_questions = generate_trivia_questions(topic, existing_questions, num_questions)

    # Save new questions to the jsonl file
    for question in new_questions:
        save_new_question(file_path, question)
        print(f"New question added: {question}")

if __name__ == "__main__":
    topic = "Israel"
    file_path = "trivia_questions.jsonl"  # Path to the jsonl file
    num_questions = 10
    
    main(topic, file_path, num_questions)
