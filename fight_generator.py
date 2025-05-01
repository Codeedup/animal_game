import openai
import json
import csv
import time
import os
from datetime import datetime
import random
from collections import defaultdict

class FightGenerator:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("Please set OPENAI_API_KEY environment variable")
        
        # Initialize the OpenAI client
        self.client = openai.OpenAI(api_key=self.api_key)
        
        # Create output directory if it doesn't exist
        self.output_dir = 'output'
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        
        # Initialize data structures
        self.species_usage = defaultdict(int)
        self.used_facts = defaultdict(set)
        self.checkpoint_file = os.path.join(self.output_dir, 'checkpoint.json')
        self.json_file = os.path.join(self.output_dir, 'fights.json')
        self.csv_file = os.path.join(self.output_dir, 'fights.csv')
        
        # Load existing data if available
        self.load_checkpoint()
        
    def load_checkpoint(self):
        """Load existing data from checkpoint and output files"""
        try:
            if os.path.exists(self.checkpoint_file):
                with open(self.checkpoint_file, 'r') as f:
                    checkpoint = json.load(f)
                    self.last_id = checkpoint['last_id']
                    self.species_usage = defaultdict(int, checkpoint['species_usage'])
                    self.used_facts = defaultdict(set, {k: set(v) for k, v in checkpoint['used_facts'].items()})
            else:
                self.last_id = 0
                
            # Load existing fights to ensure ID uniqueness
            if os.path.exists(self.json_file):
                with open(self.json_file, 'r') as f:
                    existing_fights = json.load(f)
                    self.last_id = max(fight['fight_id'] for fight in existing_fights)
        except Exception as e:
            print(f"Error loading checkpoint: {e}")
            self.last_id = 0
            self.species_usage = defaultdict(int)
            self.used_facts = defaultdict(set)

    def save_checkpoint(self):
        """Save current state to checkpoint file"""
        checkpoint = {
            'last_id': self.last_id,
            'species_usage': dict(self.species_usage),
            'used_facts': {k: list(v) for k, v in self.used_facts.items()}
        }
        with open(self.checkpoint_file, 'w') as f:
            json.dump(checkpoint, f)

    def generate_fights(self, batch_size=50, total_fights=10000):
        """Generate fights in batches"""
        start_time = time.time()
        fights_generated = 0
        retry_count = 0
        max_retries = 3
        
        while fights_generated < total_fights:
            try:
                current_batch = min(batch_size, total_fights - fights_generated)
                fights = self._generate_batch(current_batch)
                
                if not fights:
                    if retry_count < max_retries:
                        retry_count += 1
                        print(f"Retrying batch generation (attempt {retry_count}/{max_retries})")
                        time.sleep(min(2 ** retry_count, 30))  # Cap the sleep time at 30 seconds
                        continue
                    else:
                        print("Max retries reached. Moving to next batch.")
                        retry_count = 0
                        continue
                
                # Save to both JSON and CSV
                self._save_to_json(fights)
                self._save_to_csv(fights)
                
                # Update progress
                fights_generated += len(fights)
                print(f"Generated {fights_generated}/{total_fights} fights")
                
                # Save checkpoint
                self.save_checkpoint()
                
                # Reset retry count on success
                retry_count = 0
                
                # Rate limiting
                time.sleep(0.25)
                
            except Exception as e:
                print(f"Error in main loop: {e}")
                time.sleep(1)  # Longer delay on error
                continue
        
        # Generate final report
        self._generate_report(start_time)

    def _generate_batch(self, batch_size):
        """Generate a batch of fights using OpenAI API"""
        prompt = f"""
        Generate {batch_size} unique animal fight scenarios with the following format:
        - Each fight should be between animals of different species
        - The number of animals on each side should be balanced based on their size and strength
        - Include a brief, humorous explanation of why the winner won
        - Include a unique fun fact about the winning species that hasn't been used before
        - Make sure the fights are realistic and balanced
        - Avoid repeating the same species combinations
        - Ensure the commentary is unique and entertaining

        Format each fight as a JSON object with these exact fields:
        {{
            "fight_id": number,
            "combatant_a": {{
                "species": "species_name",
                "count": number
            }},
            "combatant_b": {{
                "species": "species_name",
                "count": number
            }},
            "winner": "A" or "B",
            "commentary": "humorous explanation of the outcome",
            "fact": "unique fun fact about the winning species"
        }}

        Return only a JSON array of these objects, nothing else.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a creative fight scenario generator that follows strict formatting rules."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.9,
                max_tokens=2000
            )
            
            if not response.choices or not response.choices[0].message.content:
                raise ValueError("Empty response from API")
            
            fights = json.loads(response.choices[0].message.content)
            
            # Validate the response format
            for fight in fights:
                if not all(key in fight for key in ['fight_id', 'combatant_a', 'combatant_b', 'winner', 'commentary', 'fact']):
                    raise ValueError("Invalid fight format in API response")
                
                if not all(key in fight['combatant_a'] for key in ['species', 'count']):
                    raise ValueError("Invalid combatant_a format")
                
                if not all(key in fight['combatant_b'] for key in ['species', 'count']):
                    raise ValueError("Invalid combatant_b format")
            
            # Update IDs and track species usage
            for fight in fights:
                self.last_id += 1
                fight['fight_id'] = self.last_id
                
                # Track species usage
                self.species_usage[fight['combatant_a']['species']] += 1
                self.species_usage[fight['combatant_b']['species']] += 1
                
                # Track used facts
                winner_species = fight['combatant_a']['species'] if fight['winner'] == 'A' else fight['combatant_b']['species']
                self.used_facts[winner_species].add(fight['fact'])
            
            return fights
            
        except json.JSONDecodeError as e:
            print(f"Error parsing API response: {e}")
            return []
        except Exception as e:
            print(f"Error generating fights: {e}")
            return []

    def _save_to_json(self, fights):
        """Save fights to JSON file"""
        try:
            if os.path.exists(self.json_file):
                with open(self.json_file, 'r') as f:
                    existing_fights = json.load(f)
                existing_fights.extend(fights)
                fights = existing_fights
            else:
                fights = fights
            
            with open(self.json_file, 'w') as f:
                json.dump(fights, f, indent=2)
        except Exception as e:
            print(f"Error saving to JSON: {e}")

    def _save_to_csv(self, fights):
        """Save fights to CSV file"""
        try:
            file_exists = os.path.exists(self.csv_file)
            
            with open(self.csv_file, 'a', newline='') as csvfile:
                fieldnames = ['fight_id', 'combatant_a_species', 'combatant_a_count',
                            'combatant_b_species', 'combatant_b_count', 'winner',
                            'commentary', 'fact']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                if not file_exists:
                    writer.writeheader()
                
                for fight in fights:
                    writer.writerow({
                        'fight_id': fight['fight_id'],
                        'combatant_a_species': fight['combatant_a']['species'],
                        'combatant_a_count': fight['combatant_a']['count'],
                        'combatant_b_species': fight['combatant_b']['species'],
                        'combatant_b_count': fight['combatant_b']['count'],
                        'winner': fight['winner'],
                        'commentary': fight['commentary'],
                        'fact': fight['fact']
                    })
        except Exception as e:
            print(f"Error saving to CSV: {e}")

    def _generate_report(self, start_time):
        """Generate a report of the generation process"""
        total_time = time.time() - start_time
        species_count = len(self.species_usage)
        avg_usage = sum(self.species_usage.values()) / species_count if species_count > 0 else 0
        
        report = {
            'total_fights_generated': self.last_id,
            'total_time_seconds': total_time,
            'unique_species_used': species_count,
            'average_species_usage': avg_usage,
            'most_used_species': max(self.species_usage.items(), key=lambda x: x[1]) if self.species_usage else None,
            'facts_generated': sum(len(facts) for facts in self.used_facts.values())
        }
        
        print("\nGeneration Report:")
        print(json.dumps(report, indent=2))
        
        # Save report to file in output directory
        report_file = os.path.join(self.output_dir, 'generation_report.json')
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)

if __name__ == "__main__":
    generator = FightGenerator()
    generator.generate_fights(batch_size=50, total_fights=10000) 