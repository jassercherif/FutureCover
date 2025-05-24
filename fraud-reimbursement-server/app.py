import os
import requests
from flask import Flask, request, jsonify
from simple_salesforce import Salesforce, SalesforceAuthenticationFailed
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Salesforce credentials
SF_USERNAME = os.getenv("SF_USERNAME")
SF_PASSWORD = os.getenv("SF_PASSWORD")
SF_SECURITY_TOKEN = os.getenv("SF_SECURITY_TOKEN")

# Groq API credentials
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

# Authentifier Salesforce au démarrage
try:
    sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)
    print("✅ Authentification Salesforce réussie.")
except SalesforceAuthenticationFailed as e:
    print("❌ Salesforce authentication failed:", str(e))
    sf = None

def get_latest_request():
    try:
        query = """
        SELECT Id, Amount__c, Type__c, Date__c, Mode__c, Pack__c, Description__c,
               Has_valid_receipt__c, Frequency__c, Is_Duplicate__c,
               Previous_fraudulent_requests__c, Time_since_last_request__c
        FROM Reimbursement_Request__c
        ORDER BY CreatedDate DESC
        LIMIT 1
        """
        result = sf.query(query)
        return result['records'][0] if result['records'] else None
    except Exception as e:
        print("❌ Erreur lors de la récupération :", str(e))
        return None

def format_prompt(req):
    return f"""
Reimbursement Request Analysis:
- Amount: {req.get('Amount__c', 'N/A')} EUR
- Type: {req.get('Type__c', 'N/A')}
- Date: {req.get('Date__c', 'N/A')}
- Mode: {req.get('Mode__c', 'N/A')}
- Pack: {req.get('Pack__c', 'N/A')}
- Description: {req.get('Description__c', 'N/A')}
- Has Valid Receipt: {req.get('Has_valid_receipt__c', False)}
- Frequency: {req.get('Frequency__c', 0)}
- Is Duplicate: {req.get('Is_Duplicate__c', 0)}
- Previous Fraudulent Requests: {req.get('Previous_fraudulent_requests__c', 0)}
- Time Since Last Request: {req.get('Time_since_last_request__c', 0)} days

Evaluate if this request is fraudulent.
Give a fraud score between 0 and 100, then explain your reasoning.

Respond strictly like this:
---
Fraud Score: <score>%
Reasoning:
- ...
- ...
---
"""

def query_groq(prompt):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are a fraud detection expert reviewing reimbursement requests."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()

def extract_score_and_reasoning(text):
    try:
        lines = text.splitlines()
        score_line = next((l for l in lines if "Fraud Score" in l), "Fraud Score: 0%")
        score = int(score_line.split(":")[1].strip().replace("%", ""))
        reasoning = "\n".join([l for l in lines if l.startswith("-")])
        return score, reasoning
    except Exception as e:
        print("❌ Error extracting score and reasoning:", str(e))
        return 0, "Could not extract reasoning."

@app.route("/fraud", methods=["POST"])
def detect_fraud():
    if not sf:
        return jsonify({"error": "Salesforce authentication failed"}), 500

    print("📥 Requête reçue de Salesforce.")
    req = get_latest_request()
    if not req:
        return jsonify({"error": "No reimbursement request found"}), 404

    prompt = format_prompt(req)
    print("🧠 Envoi de la requête à Groq...")
    try:
        response = query_groq(prompt)
        score, reasoning = extract_score_and_reasoning(response)
        print(f"✅ Score de fraude : {score}%\n📋 Raisonnement :\n{reasoning}")

        # Mettre à jour Salesforce
        sf.Reimbursement_Request__c.update(req["Id"], {
            "Fraud_Score__c": score,
            "Fraud_Details__c": reasoning
        })
        print("📤 Salesforce mis à jour avec succès.")

        return jsonify({"fraud_score": score, "reasoning": reasoning}), 200

    except Exception as e:
        print("❌ Erreur :", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
