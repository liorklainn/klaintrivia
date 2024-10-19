import json

def jsonl_to_json(jsonl_file, json_file):
    data = []
    
    # Open the JSONL file and read line by line
    with open(jsonl_file, 'r') as f:
        for line in f:
            # Each line in JSONL is a valid JSON object
            data.append(json.loads(line))
    
    # Write the list of JSON objects to a regular JSON file
    with open(json_file, 'w') as f:
        json.dump(data, f, indent=4)

# Example usage
jsonl_to_json('trivia_questions.jsonl', 'questions.json')
