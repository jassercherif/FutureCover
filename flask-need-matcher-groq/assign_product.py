from salesforce_client import get_latest_lead, get_products, assign_product_to_lead
from groq_agent import choose_product


lead = get_latest_lead()
products = get_products()

if lead and 'Needs__c' in lead:
    chosen_name = choose_product(lead['Needs__c'], products)
    product = next((p for p in products if p['Name'].lower() == chosen_name.lower()), None)

    if product:
        assign_product_to_lead(lead['Id'], product['Id'])
        print(f"✅ Produit '{product['Name']}' assigné au lead {lead['Name']}")
    else:
        print(f"⚠️ Produit '{chosen_name}' introuvable dans Salesforce.")
else:
    print("⚠️ Aucun lead trouvé ou pas de champ 'Needs__c'")
