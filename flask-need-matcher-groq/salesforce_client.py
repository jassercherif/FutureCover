from simple_salesforce import Salesforce
from config import SF_USERNAME, SF_PASSWORD, SF_SECURITY_TOKEN

sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)

def get_latest_lead():
    query = "SELECT Id, Name, Needs__c FROM Lead ORDER BY CreatedDate DESC LIMIT 1"
    result = sf.query(query)
    return result['records'][0] if result['records'] else None

def get_products():
    query = """
SELECT Id, Name, ProductCode, Family, Coverage_Duration__c, Coverage_Limit__c, 
       Price__c, Reimbursement_Rate__c, Beneficiaries__c, Renewable__c, 
       Network_of_Partners__c, Included_Coverage__c, Reimbursement_Base__c, 
       CreatedById, LastModifiedById, Description
FROM Product2
WHERE Family != NULL
"""

            

    result = sf.query(query)
    return result['records']

def assign_product_to_lead(lead_id, product_id):
    sf.Lead.update(lead_id, {'Product__c': product_id})
