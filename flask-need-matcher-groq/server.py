from flask import Flask, request, jsonify
from salesforce_client import get_products, assign_product_to_lead, get_latest_lead
from groq_agent import choose_product

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def lead_webhook():
    print("🔔 Requête reçue de Salesforce")

    lead = get_latest_lead()
    if not lead or 'Needs__c' not in lead:
        print("⚠️ Aucun lead valide trouvé")
        return jsonify({"status": "error", "message": "Aucun lead ou champ 'Needs__c' manquant"}), 400

    print("📥 Lead récupéré :", lead['Name'], "-", lead['Needs__c'])

    products = get_products()
    chosen_name = choose_product(lead['Needs__c'], products)
    product = next((p for p in products if p['Name'].lower() == chosen_name.lower()), None)

    if product:
        assign_product_to_lead(lead['Id'], product['Id'])
        print(f"✅ Produit '{product['Name']}' assigné au lead {lead['Name']}")
        return jsonify({"status": "success", "product_assigned": product['Name']}), 200
    else:
        print(f"⚠️ Produit '{chosen_name}' introuvable")
        return jsonify({"status": "error", "message": f"Produit '{chosen_name}' introuvable"}), 404

if __name__ == '__main__':
    app.run(port=5000)
