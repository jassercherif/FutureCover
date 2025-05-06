import requests
from config import GROQ_API_KEY, GROQ_MODEL

def choose_product(needs_text, products):
    product_names = [product['Name'] for product in products]
    context = "\n".join([
    f"Name: {p['Name']}\n"
    f"Product Code: {p.get('ProductCode', '')}\n"
    f"Family: {p.get('Family', '')}\n"
    f"Coverage Duration: {p.get('Coverage_Duration__c', '')}\n"
    f"Coverage Limit: {p.get('Coverage_Limit__c', '')}\n"
    f"Price: {p.get('Price__c', '')}\n"
    f"Reimbursement Rate: {p.get('Reimbursement_Rate__c', '')}\n"
    f"Beneficiaries: {p.get('Beneficiaries__c', '')}\n"
    f"Renewable: {p.get('Renewable__c', '')}\n"
    f"Network of Partners: {p.get('Network_of_Partners__c', '')}\n"
    f"Included Coverage: {p.get('Included_Coverage__c', '')}\n"
    f"Reimbursement Base: {p.get('Reimbursement_Base__c', '')}\n"
    f"Created By: {p.get('CreatedById', '')}\n"
    f"Last Modified By: {p.get('LastModifiedById', '')}\n"
    f"Description: {p.get('Description', '')}\n"
    for p in products
])

    prompt = (
        f"The following are insurance products:\n{context}\n\n"
        f"Based on the client's needs: '{needs_text}', which product is the best match?"
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert insurance advisor."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 100
    }

    response = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
    response.raise_for_status()
    result = response.json()
    print(f"Résultat Groq : {result}")

    # Retourne uniquement le nom extrait
    answer = result['choices'][0]['message']['content'].strip()

    # Extraire le nom du produit s’il est encadré dans une phrase
    for name in product_names:
        if name.lower() in answer.lower():
            return name

    return answer  
