from simple_salesforce import Salesforce
from config import SF_USERNAME, SF_PASSWORD, SF_SECURITY_TOKEN

sf = Salesforce(username=SF_USERNAME, password=SF_PASSWORD, security_token=SF_SECURITY_TOKEN)